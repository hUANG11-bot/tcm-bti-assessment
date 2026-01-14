import { Router } from 'express';
import { getDb } from '../db';
import { adminUsers } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const router = Router();

// 登录接口
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: '数据库连接失败' });
    }

    // 查询管理员
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username))
      .limit(1);

    if (!admin) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 设置Cookie
    res.cookie('admin_id', admin.id.toString(), {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
    });

    return res.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: '登录失败，请稍后重试' });
  }
});

// 检查认证状态
router.get('/check', async (req, res) => {
  try {
    const adminId = req.cookies.admin_id;

    if (!adminId) {
      return res.json({ isAuthenticated: false });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: '数据库连接失败' });
    }

    // 验证管理员是否存在
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, parseInt(adminId)))
      .limit(1);

    if (!admin) {
      // 清除无效Cookie
      res.clearCookie('admin_id', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });
      return res.json({ isAuthenticated: false });
    }

    return res.json({
      isAuthenticated: true,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (error: any) {
    console.error('Check auth error:', error);
    return res.status(500).json({ error: '验证失败' });
  }
});

// 登出接口
router.post('/logout', (req, res) => {
  res.clearCookie('admin_id', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
  return res.json({ success: true });
});

export default router;
