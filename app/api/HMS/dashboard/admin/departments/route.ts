import { NextResponse } from 'next/server'
import { pool } from '../../../../../HMS/lib/db'
import { getSession } from '../../../../../HMS/lib/auth'
import { ResultSetHeader } from 'mysql2'

// 获取科室列表
export async function GET() {
  try {
    const admin = await getSession()
    if (!admin || admin.Role !== 'admin') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
    }

    const connection = await pool.getConnection()
    try {
      const [departments] = await connection.execute(`
        SELECT * FROM Departments
        ORDER BY DepartmentID
      `)

      return NextResponse.json({ departments })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Get Departments Error:', error)
    return NextResponse.json({ error: '获取科室列表失败' }, { status: 500 })
  }
}

// 添加科室
export async function POST(request: Request) {
  try {
    const admin = await getSession()
    if (!admin || admin.Role !== 'admin') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
    }

    const { Name, Description, Location } = await request.json()

    if (!Name) {
      return NextResponse.json({ error: '科室名称不能为空' }, { status: 400 })
    }

    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // 检查科室名是否已存在
      const [existing] = await connection.execute(
        'SELECT * FROM Departments WHERE Name = ?',
        [Name]
      )
      if ((existing as any[]).length > 0) {
        return NextResponse.json({ error: '科室名称已存在' }, { status: 400 })
      }

      // 添加科室
      const [result] = await connection.execute<ResultSetHeader>(
        'INSERT INTO Departments (Name, Description, Location) VALUES (?, ?, ?)',
        [Name, Description || null, Location || null]
      )

      await connection.commit()
      return NextResponse.json({
        message: '科室添加成功',
        data: { DepartmentID: result.insertId, Name, Description, Location }
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Add Department Error:', error)
    return NextResponse.json({ error: '添加科室失败' }, { status: 500 })
  }
}

// 更新科室
export async function PUT(request: Request) {
  try {
    const admin = await getSession()
    if (!admin || admin.Role !== 'admin') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
    }

    const { id, Name, Description, Location } = await request.json()

    if (!id || !Name) {
      return NextResponse.json({ error: '科室ID和名称不能为空' }, { status: 400 })
    }

    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // 检查科室是否存在
      const [existing] = await connection.execute(
        'SELECT * FROM Departments WHERE DepartmentID = ?',
        [id]
      )
      if ((existing as any[]).length === 0) {
        return NextResponse.json({ error: '科室不存在' }, { status: 404 })
      }

      // 检查新名称是否与其他科室重复
      const [nameCheck] = await connection.execute(
        'SELECT * FROM Departments WHERE Name = ? AND DepartmentID != ?',
        [Name, id]
      )
      if ((nameCheck as any[]).length > 0) {
        return NextResponse.json({ error: '科室名称已存在' }, { status: 400 })
      }

      // 更新科室信息
      await connection.execute(
        'UPDATE Departments SET Name = ?, Description = ?, Location = ? WHERE DepartmentID = ?',
        [Name, Description || null, Location || null, id]
      )

      await connection.commit()
      return NextResponse.json({ message: '科室更新成功' })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Update Department Error:', error)
    return NextResponse.json({ error: '更新科室失败' }, { status: 500 })
  }
}

// 删除科室
export async function DELETE(request: Request) {
  try {
    const admin = await getSession()
    if (!admin || admin.Role !== 'admin') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: '科室ID不能为空' }, { status: 400 })
    }

    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // 检查科室是否存在
      const [existing] = await connection.execute(
        'SELECT * FROM Departments WHERE DepartmentID = ?',
        [id]
      )
      if ((existing as any[]).length === 0) {
        return NextResponse.json({ error: '科室不存在' }, { status: 404 })
      }

      // 检查是否有医生关联到此科室
      const [doctors] = await connection.execute(
        'SELECT * FROM Doctors WHERE DepartmentID = ?',
        [id]
      )
      if ((doctors as any[]).length > 0) {
        return NextResponse.json({ error: '该科室下还有医生，无法删除' }, { status: 400 })
      }

      // 删除科室
      await connection.execute(
        'DELETE FROM Departments WHERE DepartmentID = ?',
        [id]
      )

      await connection.commit()
      return NextResponse.json({ message: '科室删除成功' })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Delete Department Error:', error)
    return NextResponse.json({ error: '删除科室失败' }, { status: 500 })
  }
} 