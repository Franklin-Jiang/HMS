import { NextRequest, NextResponse } from 'next/server'
import { pool } from '../../../../../HMS/lib/db'
import { getSession } from '../../../../../HMS/lib/auth'

// 获取护士列表
export async function GET(request: NextRequest) {
    try {
        const admin = await getSession()
        if (!admin || admin.Role !== 'admin') {
            return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
        }

        const url = new URL(request.url)
        const nurseId = url.searchParams.get('id')

        const connection = await pool.getConnection()
        try {
            if (nurseId) {
                // 获取单个护士信息及其分配的房间
                const [nurses] = await connection.execute(`
                    SELECT 
                        n.*,
                        COALESCE(
                            JSON_ARRAYAGG(
                                IF(r.RoomID IS NOT NULL,
                                    JSON_OBJECT(
                                        'RoomID', r.RoomID,
                                        'RoomNumber', r.RoomNumber,
                                        'RoomType', r.RoomType
                                    ),
                                    NULL
                                )
                            ),
                            JSON_ARRAY()
                        ) as AssignedRooms
                    FROM Nurses n
                    LEFT JOIN NurseRoomAssignments nra ON n.NurseID = nra.NurseID
                    LEFT JOIN Rooms r ON nra.RoomID = r.RoomID
                    WHERE n.NurseID = ?
                    GROUP BY n.NurseID
                `, [nurseId])

                const nurse = (nurses as any[])[0]
                if (nurse) {
                    // 过滤掉 null 值
                    nurse.AssignedRooms = nurse.AssignedRooms.filter(Boolean)
                }

                return NextResponse.json({ nurse })
            } else {
                // 获取所有已验证的护士列表及其分配的房间
                const [nurses] = await connection.execute(`
                    SELECT 
                        n.*,
                        COALESCE(
                            JSON_ARRAYAGG(
                                IF(r.RoomID IS NOT NULL,
                                    JSON_OBJECT(
                                        'RoomID', r.RoomID,
                                        'RoomNumber', r.RoomNumber,
                                        'RoomType', r.RoomType
                                    ),
                                    NULL
                                )
                            ),
                            JSON_ARRAY()
                        ) as AssignedRooms
                    FROM Nurses n
                    LEFT JOIN NurseRoomAssignments nra ON n.NurseID = nra.NurseID
                    LEFT JOIN Rooms r ON nra.RoomID = r.RoomID
                    WHERE n.isVerified = true
                    GROUP BY n.NurseID
                    ORDER BY n.NurseID DESC
                `)

                // 处理每个护士的 AssignedRooms，过滤掉 null 值
                const processedNurses = (nurses as any[]).map(nurse => ({
                    ...nurse,
                    AssignedRooms: nurse.AssignedRooms.filter(Boolean)
                }))

                return NextResponse.json({ nurses: processedNurses })
            }
        } finally {
            connection.release()
        }
    } catch (error) {
        console.error('Get Nurses Error:', error)
        return NextResponse.json({ error: '获取护士信息失败' }, { status: 500 })
    }
}

// 更新护士信息
export async function PUT(request: NextRequest) {
    try {
        const admin = await getSession()
        if (!admin || admin.Role !== 'admin') {
            return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
        }

        const url = new URL(request.url)
        const nurseId = url.searchParams.get('id')
        const { Name, Gender, Phone, Shift } = await request.json()

        if (!nurseId || !Name || !Gender || !Phone || !Shift) {
            return NextResponse.json({ error: '缺少必要字段' }, { status: 400 })
        }

        const connection = await pool.getConnection()
        try {
            await connection.beginTransaction()

            // 移除了 RoomID 字段的更新
            await connection.execute(
                'UPDATE Nurses SET Name = ?, Gender = ?, Phone = ?, Shift = ? WHERE NurseID = ?',
                [Name, Gender, Phone, Shift, nurseId]
            )

            await connection.commit()
            return NextResponse.json({ message: '护士信息更新成功' })

        } catch (error) {
            await connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    } catch (error) {
        console.error('Update Nurse Error:', error)
        return NextResponse.json({ error: '更新护士信息失败' }, { status: 500 })
    }
}

// 删除护士
export async function DELETE(request: NextRequest) {
    try {
        const admin = await getSession()
        if (!admin || admin.Role !== 'admin') {
            return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
        }

        const url = new URL(request.url)
        const nurseId = url.searchParams.get('id')
        if (!nurseId) {
            return NextResponse.json({ error: '缺少护士ID' }, { status: 400 })
        }

        const connection = await pool.getConnection()
        try {
            await connection.beginTransaction()

            // 删除用户账号
            await connection.execute(
                'DELETE FROM UserAccounts WHERE Role = "nurse" AND RelatedID = ?',
                [nurseId]
            )

            // 删除护士信息
            await connection.execute(
                'DELETE FROM Nurses WHERE NurseID = ?',
                [nurseId]
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
        console.error('Delete Nurse Error:', error)
        return NextResponse.json({ error: '删除护士失败' }, { status: 500 })
    }
}

// 分配房间
export async function POST(request: NextRequest) {
    try {
        const admin = await getSession()
        if (!admin || admin.Role !== 'admin') {
            return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
        }

        const url = new URL(request.url)
        const action = url.searchParams.get('action')

        if (action === 'assign-room') {
            const { nurseId, roomIds } = await request.json()

            const connection = await pool.getConnection()
            try {
                await connection.beginTransaction()

                // 先删除原有的分配
                await connection.execute(
                    'DELETE FROM NurseRoomAssignments WHERE NurseID = ?',
                    [nurseId]
                )

                // 添加新的分配
                if (roomIds.length > 0) {
                    // 构建批量插入的 SQL
                    const placeholders = roomIds.map(() => '(?, ?)').join(', ')
                    const values = roomIds.flatMap(roomId => [nurseId, roomId])
                    
                    await connection.execute(
                        `INSERT INTO NurseRoomAssignments (NurseID, RoomID) VALUES ${placeholders}`,
                        values
                    )
                }

                await connection.commit()
                return NextResponse.json({ message: '房间分配成功' })

            } catch (error) {
                await connection.rollback()
                throw error
            } finally {
                connection.release()
            }
        }

        return NextResponse.json({ error: '无效的操作' }, { status: 400 })
    } catch (error) {
        console.error('Nurse API Error:', error)
        return NextResponse.json({ error: '操作失败' }, { status: 500 })
    }
} 