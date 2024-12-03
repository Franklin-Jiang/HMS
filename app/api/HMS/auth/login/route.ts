import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { pool } from '../../../../HMS/lib/db'
import bcrypt from 'bcryptjs'
import { setSession } from '../../../../HMS/lib/session'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    const connection = await pool.getConnection()

    try {
      // 获取用户账号信息
      const [users] = await connection.execute(
        `SELECT ua.UserID, ua.Username, ua.Password, LOWER(ua.Role) as Role, ua.RelatedID,
         CASE 
           WHEN ua.Role = 'doctor' THEN d.isVerified
           WHEN ua.Role = 'nurse' THEN n.isVerified
           ELSE true
         END as isVerified
         FROM UserAccounts ua
         LEFT JOIN Doctors d ON ua.Role = 'doctor' AND ua.RelatedID = d.DoctorID
         LEFT JOIN Nurses n ON ua.Role = 'nurse' AND ua.RelatedID = n.NurseID
         WHERE ua.Username = ?`,
        [username]
      )

      if (!(users as any[]).length) {
        return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 })
      }

      const user = (users as any[])[0]

      // 检查医生和护士的认证状态
      if ((user.Role === 'doctor' || user.Role === 'nurse') && !user.isVerified) {
        return NextResponse.json({ error: '您的账户未经医院审核' }, { status: 401 })
      }

      // 验证密码
      const isValid = await bcrypt.compare(password, user.Password)
      if (!isValid) {
        return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 })
      }

      // 设置会话
      await setSession({
        UserID: user.UserID,
        Username: user.Username,
        Role: user.Role,
        RelatedID: user.RelatedID
      })

      // 更新最后登录时间
      await connection.execute(
        'UPDATE UserAccounts SET LastLogin = NOW() WHERE UserID = ?',
        [user.UserID]
      )

      return NextResponse.json({
        message: '登录成功',
        user: {
          UserID: user.UserID,
          Username: user.Username,
          Role: user.Role,
          RelatedID: user.RelatedID
        }
      })

    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Login Error:', error)
    return NextResponse.json({ error: '登录失败，请稍后重试' }, { status: 500 })
  }
} 