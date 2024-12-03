import { NextResponse } from 'next/server'
import { pool } from '../../../../../HMS/lib/db'
import { getSession } from '../../../../../HMS/lib/auth'

export async function POST(request: Request) {
    try {
        const admin = await getSession()
        if (!admin || admin.Role !== 'admin') {
            return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
        }

        const { staffId, role, action } = await request.json()

        const connection = await pool.getConnection()
        try {
            await connection.beginTransaction()

            if (action === 'verify') {
                // 验证通过
                await connection.execute(
                    'UPDATE UserAccounts SET isVerified = true WHERE Role = ? AND RelatedID = ?',
                    [role, staffId]
                )

                await connection.commit()
                return NextResponse.json({ message: '审核通过成功' })

            } else if (action === 'reject') {
                // 拒绝申请，删除相关记录
                await connection.execute(
                    'DELETE FROM UserAccounts WHERE Role = ? AND RelatedID = ?',
                    [role, staffId]
                )

                if (role === 'doctor') {
                    await connection.execute(
                        'DELETE FROM Doctors WHERE DoctorID = ?',
                        [staffId]
                    )
                } else if (role === 'nurse') {
                    await connection.execute(
                        'DELETE FROM Nurses WHERE NurseID = ?',
                        [staffId]
                    )
                }

                await connection.commit()
                return NextResponse.json({ message: '已拒绝申请' })

            } else {
                return NextResponse.json({ error: '无效的操作类型' }, { status: 400 })
            }
        } catch (error) {
            await connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    } catch (error) {
        console.error('Verify Staff Error:', error)
        return NextResponse.json({ error: '审核操作失败' }, { status: 500 })
    }
}

// 获取待审核列表
export async function GET(request: Request) {
    try {
        const admin = await getSession()
        if (!admin || admin.Role !== 'admin') {
            return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') || 'all'

        const connection = await pool.getConnection()
        try {
            let query = `
                SELECT 
                    CASE 
                        WHEN ua.Role = 'doctor' THEN d.DoctorID
                        WHEN ua.Role = 'nurse' THEN n.NurseID
                    END as ID,
                    CASE 
                        WHEN ua.Role = 'doctor' THEN d.Name
                        WHEN ua.Role = 'nurse' THEN n.Name
                    END as Name,
                    CASE 
                        WHEN ua.Role = 'doctor' THEN d.Gender
                        WHEN ua.Role = 'nurse' THEN n.Gender
                    END as Gender,
                    CASE 
                        WHEN ua.Role = 'doctor' THEN d.Phone
                        WHEN ua.Role = 'nurse' THEN n.Phone
                    END as Phone,
                    ua.Role,
                    dep.Name as DepartmentName,
                    n.Shift,
                    ua.CreatedAt as RegisterDate
                FROM UserAccounts ua
                LEFT JOIN Doctors d ON ua.Role = 'doctor' AND ua.RelatedID = d.DoctorID
                LEFT JOIN Nurses n ON ua.Role = 'nurse' AND ua.RelatedID = n.NurseID
                LEFT JOIN Departments dep ON d.DepartmentID = dep.DepartmentID
                WHERE (
                    (ua.Role = 'doctor' AND d.isVerified = false) OR
                    (ua.Role = 'nurse' AND n.isVerified = false)
                )`

            if (type !== 'all') {
                query += ` AND ua.Role = ?`
            }

            query += ` ORDER BY ua.CreatedAt DESC`

            const [staff] = await connection.execute(
                query,
                type !== 'all' ? [type] : []
            )

            return NextResponse.json(staff)
        } finally {
            connection.release()
        }
    } catch (error) {
        console.error('Get Pending Staff Error:', error)
        return NextResponse.json({ error: '获取待审核员工列表失败' }, { status: 500 })
    }
}

// 通过审核
export async function PUT(request: Request) {
    try {
        const admin = await getSession()
        if (!admin || admin.Role !== 'admin') {
            return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
        }

        const { id, role } = await request.json()
        if (!id || !role) {
            return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
        }

        const connection = await pool.getConnection()
        try {
            await connection.beginTransaction()

            // 根据角色更新对应表的 isVerified 字段
            if (role === 'doctor') {
                await connection.execute(
                    'UPDATE Doctors SET isVerified = true WHERE DoctorID = ?',
                    [id]
                )
            } else if (role === 'nurse') {
                await connection.execute(
                    'UPDATE Nurses SET isVerified = true WHERE NurseID = ?',
                    [id]
                )
            } else {
                return NextResponse.json({ error: '无效的角色类型' }, { status: 400 })
            }

            await connection.commit()
            return NextResponse.json({ message: '审核通过成功' })

        } catch (error) {
            await connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    } catch (error) {
        console.error('Verify Staff Error:', error)
        return NextResponse.json({ error: '审核操作失败' }, { status: 500 })
    }
} 