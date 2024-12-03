import { NextResponse } from 'next/server'
import { pool } from '../../../../../HMS/lib/db'
import { getSession } from '../../../../../HMS/lib/auth'
import { ResultSetHeader } from 'mysql2'
import { RoomType } from '../../../../../HMS/types'


// 验证房间类型的函数
const validateRoomType = (type: string): RoomType => {
  const validTypes = ['ward', 'icu', 'operating'] as const
  return validTypes.includes(type as RoomType) ? (type as RoomType) : 'ward'
}

// 获取房间列表
export async function GET() {
  try {
    const admin = await getSession()
    if (!admin || admin.Role !== 'admin') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
    }

    const connection = await pool.getConnection()
    try {
      const [rooms] = await connection.execute(`
        SELECT r.*, 
          CASE 
            WHEN EXISTS(SELECT 1 FROM Patients p WHERE p.RoomID = r.RoomID) THEN 'occupied'
            ELSE r.Status
          END as Status
        FROM Rooms r
        ORDER BY r.RoomID
      `)

      // 在返回房间数据之前进行类型验证
      const processedRooms = (rooms as any[]).map(room => ({
        ...room,
        RoomType: validateRoomType(room.RoomType)
      }))

      return NextResponse.json({ rooms: processedRooms })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Get Rooms Error:', error)
    return NextResponse.json({ error: '获取房间列表失败' }, { status: 500 })
  }
}

// 添加房间
export async function POST(request: Request) {
  try {
    const admin = await getSession()
    if (!admin || admin.Role !== 'admin') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
    }

    const { RoomType, Capacity, Status } = await request.json()

    if (!RoomType || !Capacity) {
      return NextResponse.json({ error: '房间类型和容量不能为空' }, { status: 400 })
    }

    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // 添加房间
      const [result] = await connection.execute<ResultSetHeader>(
        'INSERT INTO Rooms (RoomType, Capacity, Status) VALUES (?, ?, ?)',
        [RoomType, parseInt(Capacity), Status || 'available']
      )

      await connection.commit()
      return NextResponse.json({
        message: '房间添加成功',
        data: { RoomID: result.insertId, RoomType, Capacity, Status }
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Add Room Error:', error)
    return NextResponse.json({ error: '添加房间失败' }, { status: 500 })
  }
}

// 更新房间
export async function PUT(request: Request) {
  try {
    const admin = await getSession()
    if (!admin || admin.Role !== 'admin') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
    }

    const { id, RoomNumber, RoomType, Floor, Building, BedCount, Description, Status } = await request.json()

    if (!id || !RoomNumber || !RoomType || !Floor || !Building || !BedCount || !Status) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 })
    }

    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // 检查房间是否存在
      const [existing] = await connection.execute(
        'SELECT * FROM Rooms WHERE RoomID = ?',
        [id]
      )
      if ((existing as any[]).length === 0) {
        return NextResponse.json({ error: '房间不存在' }, { status: 404 })
      }

      // 检查房间号是否重复
      const [duplicates] = await connection.execute(
        'SELECT * FROM Rooms WHERE RoomNumber = ? AND RoomID != ?',
        [RoomNumber, id]
      )
      if ((duplicates as any[]).length > 0) {
        return NextResponse.json({ error: '房间号已存在' }, { status: 400 })
      }

      // 更新房间信息
      await connection.execute(
        `UPDATE Rooms 
         SET RoomNumber = ?, RoomType = ?, Floor = ?, Building = ?, 
             BedCount = ?, Description = ?, Status = ?
         WHERE RoomID = ?`,
        [RoomNumber, RoomType, Floor, Building, BedCount, Description, Status, id]
      )

      await connection.commit()
      return NextResponse.json({ message: '房间更新成功' })

    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Update Room Error:', error)
    return NextResponse.json({ error: '更新房间失败' }, { status: 500 })
  }
}

// 删除房间
export async function DELETE(request: Request) {
  try {
    const admin = await getSession()
    if (!admin || admin.Role !== 'admin') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: '房间ID不能为空' }, { status: 400 })
    }

    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // 检查房间是否存在
      const [existing] = await connection.execute(
        'SELECT * FROM Rooms WHERE RoomID = ?',
        [id]
      )
      if ((existing as any[]).length === 0) {
        return NextResponse.json({ error: '房间不存在' }, { status: 404 })
      }

      // 检查房间是否被占用
      const [occupied] = await connection.execute(
        'SELECT * FROM Patients WHERE RoomID = ?',
        [id]
      )
      if ((occupied as any[]).length > 0) {
        return NextResponse.json({ error: '房间正在使用中，无法删除' }, { status: 400 })
      }

      // 删除房间
      await connection.execute(
        'DELETE FROM Rooms WHERE RoomID = ?',
        [id]
      )

      await connection.commit()
      return NextResponse.json({ message: '房间删除成功' })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Delete Room Error:', error)
    return NextResponse.json({ error: '删除房间失败' }, { status: 500 })
  }
} 