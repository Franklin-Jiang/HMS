import { NextResponse } from 'next/server'
import { pool } from '../../../../HMS/lib/db'
import bcrypt from 'bcryptjs'
import { ResultSetHeader } from 'mysql2'

export async function POST(request: Request) {
    try {
        const data = await request.json()
        const { Role, Username, Password, ...otherData } = data

        const connection = await pool.getConnection()
        try {
            await connection.beginTransaction()

            // 检查用户名是否已存在
            const [existingUsers] = await connection.execute(
                'SELECT UserID FROM UserAccounts WHERE Username = ?',
                [Username]
            )

            if ((existingUsers as any[]).length > 0) {
                return NextResponse.json({ error: '用户名已存在' }, { status: 400 })
            }

            // 加密密码
            const hashedPassword = await bcrypt.hash(Password, 10)

            // 根据角色处理注册
            let relatedId: number
            switch (Role.toLowerCase()) {
                case 'admin':
                    // 管理员不需要关联ID
                    relatedId = 0
                    break

                case 'patient':
                    const [patientResult] = await connection.execute(
                        'INSERT INTO Patients (Name, Gender, DateOfBirth, Phone, Address) VALUES (?, ?, ?, ?, ?)',
                        [otherData.Name, otherData.Gender, otherData.DateOfBirth, otherData.Phone, otherData.Address]
                    )
                    relatedId = (patientResult as any).insertId
                    break

                case 'doctor':
                    const [doctorResult] = await connection.execute(
                        'INSERT INTO Doctors (Name, Gender, Phone, DepartmentID, isVerified) VALUES (?, ?, ?, ?, false)',
                        [otherData.Name, otherData.Gender, otherData.Phone, otherData.DepartmentID]
                    )
                    relatedId = (doctorResult as ResultSetHeader).insertId
                    break

                case 'nurse':
                    const [nurseResult] = await connection.execute(
                        'INSERT INTO Nurses (Name, Gender, Phone, Shift, isVerified) VALUES (?, ?, ?, ?, false)',
                        [otherData.Name, otherData.Gender, otherData.Phone, otherData.Shift]
                    )
                    relatedId = (nurseResult as ResultSetHeader).insertId
                    break

                default:
                    throw new Error('无效的角色类型')
            }

            // 创建用户账号
            await connection.execute(
                `INSERT INTO UserAccounts 
         (Username, Password, Role, RelatedID) 
         VALUES (?, ?, ?, ?)`,
                [Username, hashedPassword, Role.toLowerCase(), relatedId]
            )

            await connection.commit()
            return NextResponse.json({
                message: Role === 'patient' ? '注册成功' : '注册成功，等待管理员审核',
                data: { relatedId }
            })

        } catch (error) {
            await connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    } catch (error) {
        console.error('Register Error:', error)
        return NextResponse.json({
            error: error instanceof Error ? error.message : '注册失败'
        }, { status: 500 })
    }
} 