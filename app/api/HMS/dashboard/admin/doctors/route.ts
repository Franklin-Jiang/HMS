import { NextRequest, NextResponse } from 'next/server'
import { pool } from '../../../../../HMS/lib/db'
import { getSession } from '../../../../../HMS/lib/auth'

// 获取医生列表
export async function GET(request: NextRequest) {
    try {
        const admin = await getSession()
        if (!admin || admin.Role !== 'admin') {
            return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
        }

        // 检查是否是获取单个医生的请求
        const url = new URL(request.url)
        const doctorId = url.searchParams.get('id')

        const connection = await pool.getConnection()
        try {
            if (doctorId) {
                // 获取单个医生信息
                const [doctors] = await connection.execute(`
          SELECT 
            d.*,
            dep.Name as DepartmentName
          FROM Doctors d
          LEFT JOIN Departments dep ON d.DepartmentID = dep.DepartmentID
          WHERE d.DoctorID = ?
        `, [doctorId])

                return NextResponse.json({ doctor: (doctors as any[])[0] })
            } else {
                // 获取所有医生列表
                const [doctors] = await connection.execute(`
          SELECT d.*, dep.Name as DepartmentName 
          FROM Doctors d
          LEFT JOIN Departments dep ON d.DepartmentID = dep.DepartmentID
          WHERE d.isVerified = true 
          ORDER BY d.DoctorID DESC
        `)

                return NextResponse.json({ doctors })
            }
        } finally {
            connection.release()
        }
    } catch (error) {
        console.error('Get Doctors Error:', error)
        return NextResponse.json({ error: '获取医生信息失败' }, { status: 500 })
    }
}

// 更新医生信息
export async function PUT(request: NextRequest) {
    try {
        const admin = await getSession()
        if (!admin || admin.Role !== 'admin') {
            return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
        }

        const url = new URL(request.url)
        const doctorId = url.searchParams.get('id')
        if (!doctorId) {
            return NextResponse.json({ error: '缺少医生ID' }, { status: 400 })
        }

        const data = await request.json()
        const { Name, Gender, Phone, DepartmentID } = data

        const connection = await pool.getConnection()
        try {
            await connection.beginTransaction()

            await connection.execute(
                'UPDATE Doctors SET Name = ?, Gender = ?, Phone = ?, DepartmentID = ? WHERE DoctorID = ?',
                [Name, Gender, Phone, DepartmentID, doctorId]
            )

            await connection.commit()
            return NextResponse.json({ message: '更新成功' })

        } catch (error) {
            await connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    } catch (error) {
        console.error('Update Doctor Error:', error)
        return NextResponse.json({ error: '更新医生信息失败' }, { status: 500 })
    }
}

// 删除医生
export async function DELETE(request: NextRequest) {
    try {
        const admin = await getSession()
        if (!admin || admin.Role !== 'admin') {
            return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
        }

        const url = new URL(request.url)
        const doctorId = url.searchParams.get('id')
        if (!doctorId) {
            return NextResponse.json({ error: '缺少医生ID' }, { status: 400 })
        }

        const connection = await pool.getConnection()
        try {
            await connection.beginTransaction()

            await connection.execute(
                'DELETE FROM UserAccounts WHERE Role = "doctor" AND RelatedID = ?',
                [doctorId]
            )

            await connection.execute(
                'DELETE FROM Doctors WHERE DoctorID = ?',
                [doctorId]
            )

            await connection.commit()
            return NextResponse.json({ message: '删除成功' })

        } catch (error) {
            await connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    } catch (error) {
        console.error('Delete Doctor Error:', error)
        return NextResponse.json({ error: '删除医生失败' }, { status: 500 })
    }
} 