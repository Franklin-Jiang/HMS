import { NextResponse } from 'next/server'
import { pool, noStore } from '../../../app/HMS/lib/db'
import { getSession, setSession } from '../../../app/HMS/lib/auth'
import { ResultSetHeader } from 'mysql2'
import bcrypt from 'bcryptjs'

// 获取列表
export async function GET(request: Request) {
  try {
    noStore()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const token = searchParams.get('token')

    // 验证用户权限
    const user = await getSession()

    switch (type) {
      case 'patients':
        // 医生和管理员可以查看所有患者，患者只能查看自己
        let patientsQuery = 'SELECT * FROM Patients'
        if (user?.Role === 'patient') {
          patientsQuery += ' WHERE PatientID = ?'
          const [patients] = await pool.execute(patientsQuery, [user.RelatedID])
          return NextResponse.json({ data: patients })
        }
        const [allPatients] = await pool.execute(patientsQuery)
        return NextResponse.json({ data: allPatients })

      case 'doctors':
        // 添加验证状态字段的查询
        const [doctors] = await pool.execute(`
          SELECT d.*, u.isVerified 
          FROM Doctors d 
          LEFT JOIN UserAccounts u ON d.DoctorID = u.RelatedID 
          WHERE u.Role = 'doctor'
        `)
        return NextResponse.json({ data: doctors })

      case 'departments':
        const [departments] = await pool.execute('SELECT * FROM Departments')
        return NextResponse.json({ data: departments })

      case 'rooms':
        const [rooms] = await pool.execute('SELECT * FROM Rooms')
        return NextResponse.json({ data: rooms })

      default:
        return NextResponse.json({ error: '无效的请求类型' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 添加新记录
export async function POST(request: Request) {
  try {
    const { type, data, token } = await request.json()
    const user = await getSession()

    switch (type) {
      case 'patient':
        const connection = await pool.getConnection()
        try {
          await connection.beginTransaction()

          // 插入患者基本信息
          const [patientResult] = await connection.execute<ResultSetHeader>(
            'INSERT INTO Patients (Name, Gender, DateOfBirth, Phone, Address) VALUES (?, ?, ?, ?, ?)',
            [data.Name, data.Gender, data.DateOfBirth, data.Phone, data.Address]
          )
          const patientId = patientResult.insertId

          // 创建用户账户
          await connection.execute(
            'INSERT INTO UserAccounts (Username, Password, Role, RelatedID) VALUES (?, ?, ?, ?)',
            [data.Username, data.Password, 'patient', patientId]
          )

          await connection.commit()
          return NextResponse.json({ message: '患者注册成功', data: patientResult })
        } catch (error) {
          await connection.rollback()
          throw error
        } finally {
          connection.release()
        }

      case 'doctor':
        if (!data.Username || !data.Password) {
          return NextResponse.json({ error: '缺少必要的注册信息' }, { status: 400 })
        }

        const doctorConnection = await pool.getConnection()
        try {
          await doctorConnection.beginTransaction()

          // 插入医生基本信息
          const [doctorResult] = await doctorConnection.execute<ResultSetHeader>(
            'INSERT INTO Doctors (Name, Gender, Phone, DepartmentID) VALUES (?, ?, ?, ?)',
            [data.Name, data.Gender, data.Phone, data.DepartmentID]
          )
          const doctorId = doctorResult.insertId

          // 创建待验证的用户账户
          await doctorConnection.execute(
            'INSERT INTO UserAccounts (Username, Password, Role, RelatedID, isVerified) VALUES (?, ?, ?, ?, ?)',
            [data.Username, data.Password, 'doctor', doctorId, false]
          )

          await doctorConnection.commit()
          return NextResponse.json({ message: '医生注册申请已提交，等待管理员验证', data: doctorResult })
        } catch (error) {
          await doctorConnection.rollback()
          throw error
        } finally {
          doctorConnection.release()
        }

      case 'login':
        return await handleLogin(data)

      case 'register':
        return await handleRegister(data)

      default:
        return NextResponse.json({ error: '无效的请求类型' }, { status: 400 })
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 处理登录的辅助函数
async function handleLogin(data: any) {
  const connection = await pool.getConnection()
  try {
    // 查找用户
    const [users] = await connection.execute(
      'SELECT * FROM UserAccounts WHERE Username = ?',
      [data.username]
    )
    const user = (users as any[])[0]

    if (!user) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 })
    }

    // 验证密码
    const isValid = await bcrypt.compare(data.password, user.Password)
    if (!isValid) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 })
    }

    // 如果是医生或护士，检查是否已验证
    if ((user.Role === 'doctor' || user.Role === 'nurse') && !user.isVerified) {
      return NextResponse.json({ error: '账号待管理员验证' }, { status: 403 })
    }

    // 生成 token
    const token = await setSession(user)

    return NextResponse.json({
      message: '登录成功',
      token,
      user: {
        UserID: user.UserID,
        Username: user.Username,
        Role: user.Role,
        RelatedID: user.RelatedID,
      }
    })
  } finally {
    connection.release()
  }
}

// 处理注册的辅助函数
async function handleRegister(data: any) {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    // 检查用户名是否已存在
    const [existingUsers] = await connection.execute(
      'SELECT * FROM UserAccounts WHERE Username = ?',
      [data.Username]
    )
    if ((existingUsers as any[]).length > 0) {
      return NextResponse.json({ error: '用户名已存在' }, { status: 400 })
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(data.Password, 10)

    let relatedId: number

    // 根据角色创建相应记录
    switch (data.Role) {
      case 'patient':
        const [patientResult] = await connection.execute<ResultSetHeader>(
          'INSERT INTO Patients (Name, Gender, DateOfBirth, Phone, Address) VALUES (?, ?, ?, ?, ?)',
          [data.Name, data.Gender, data.DateOfBirth, data.Phone, data.Address]
        )
        relatedId = patientResult.insertId
        break

      case 'doctor':
        const [doctorResult] = await connection.execute<ResultSetHeader>(
          'INSERT INTO Doctors (Name, Gender, Phone, DepartmentID) VALUES (?, ?, ?, ?)',
          [data.Name, data.Gender, data.Phone, data.DepartmentID]
        )
        relatedId = doctorResult.insertId
        break

      case 'nurse':
        const [nurseResult] = await connection.execute<ResultSetHeader>(
          'INSERT INTO Nurses (Name, Gender, Phone, RoomID, Shift) VALUES (?, ?, ?, ?, ?)',
          [data.Name, data.Gender, data.Phone, data.RoomID, data.Shift]
        )
        relatedId = nurseResult.insertId
        break

      case 'admin':
        relatedId = 0
        break

      default:
        return NextResponse.json({ error: '无效的角色类型' }, { status: 400 })
    }

    // 创建用户账户
    await connection.execute(
      'INSERT INTO UserAccounts (Username, Password, Role, RelatedID, isVerified) VALUES (?, ?, ?, ?, ?)',
      [
        data.Username,
        hashedPassword,
        data.Role,
        relatedId,
        // 管理员直接验证，其他角色需要管理员验证
        data.Role === 'admin' || data.Role === 'patient' ? true : false
      ]
    )

    await connection.commit()
    return NextResponse.json({ message: '注册成功' })
  } finally {
    connection.release()
  }
}

// 更新记录
export async function PUT(request: Request) {
  try {
    const { type, id, data, token } = await request.json()
    const user = await getSession()

    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    switch (type) {
      case 'patient':
        // 患者只能更新自己的联系信息
        if (user.Role === 'patient' && user.RelatedID !== id) {
          return NextResponse.json({ error: '无权限修改其他患者信息' }, { status: 403 })
        }

        if (user.Role === 'patient') {
          const [result] = await pool.execute(
            'UPDATE Patients SET Phone = ?, Address = ? WHERE PatientID = ?',
            [data.Phone, data.Address, id]
          )
          return NextResponse.json({ message: '患者信息更新成功', data: result })
        }

        // 管理员可以更新所有信息
        if (user.Role === 'admin') {
          const [result] = await pool.execute(
            'UPDATE Patients SET Name = ?, Gender = ?, DateOfBirth = ?, Phone = ?, Address = ?, RoomID = ? WHERE PatientID = ?',
            [data.Name, data.Gender, data.DateOfBirth, data.Phone, data.Address, data.RoomID, id]
          )
          return NextResponse.json({ message: '患者信息更新成功', data: result })
        }
        break

      case 'doctor':
        // 医生只能更新自己的联系信息
        if (user.Role === 'doctor' && user.RelatedID !== id) {
          return NextResponse.json({ error: '无权限修改其他医生信息' }, { status: 403 })
        }

        if (user.Role === 'doctor') {
          const [result] = await pool.execute(
            'UPDATE Doctors SET Phone = ? WHERE DoctorID = ?',
            [data.Phone, id]
          )
          return NextResponse.json({ message: '医生信息更新成功', data: result })
        }

        // 管理员可以更新所有信息和验证状态
        if (user.Role === 'admin') {
          const connection = await pool.getConnection()
          try {
            await connection.beginTransaction()

            // 更新医生基本信息
            await connection.execute(
              'UPDATE Doctors SET Name = ?, Gender = ?, Phone = ?, DepartmentID = ? WHERE DoctorID = ?',
              [data.Name, data.Gender, data.Phone, data.DepartmentID, id]
            )

            // 更新验证状态
            if (data.isVerified !== undefined) {
              await connection.execute(
                'UPDATE UserAccounts SET isVerified = ? WHERE Role = "doctor" AND RelatedID = ?',
                [data.isVerified, id]
              )
            }

            await connection.commit()
            return NextResponse.json({ message: '医生信息更新成功' })
          } catch (error) {
            await connection.rollback()
            throw error
          } finally {
            connection.release()
          }
        }
        break

      default:
        return NextResponse.json({ error: '无效的请求类型' }, { status: 400 })
    }

    // 添加默认的未授权响应
    return NextResponse.json({ error: '无权限执行此操作' }, { status: 403 })
  } catch (error) {
    console.error('Error in PUT request:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 删除记录（仅管理员）
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')
    const token = searchParams.get('token')

    const user = await getSession()

    if (!user || user.Role !== 'admin') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
    }

    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      switch (type) {
        case 'patient':
          await connection.execute('DELETE FROM UserAccounts WHERE Role = "patient" AND RelatedID = ?', [id])
          await connection.execute('DELETE FROM Patients WHERE PatientID = ?', [id])
          break

        case 'doctor':
          await connection.execute('DELETE FROM UserAccounts WHERE Role = "doctor" AND RelatedID = ?', [id])
          await connection.execute('DELETE FROM Doctors WHERE DoctorID = ?', [id])
          break

        default:
          return NextResponse.json({ error: '无效的请求类型' }, { status: 400 })
      }

      await connection.commit()
      return NextResponse.json({ message: '记录删除成功' })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
