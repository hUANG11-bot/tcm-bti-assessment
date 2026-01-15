import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { getDb } from '../db';
import { assessments } from '../../drizzle/schema';

const router = Router();

/**
 * GET /api/assessments/history?phone=13800138000
 * 根据手机号查询历史测评记录
 */
router.get('/assessments/history', async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ error: '请提供手机号' });
    }

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: '手机号格式不正确' });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: '数据库连接失败' });
    }
    
    // 查询该手机号的所有测评记录，按时间倒序
    const records = await db
      .select({
        id: assessments.id,
        createdAt: assessments.createdAt,
        age: assessments.age,
        gender: assessments.gender,
        primaryType: assessments.primaryType,
        secondaryType: assessments.secondaryType,
        scores: assessments.scores,
      })
      .from(assessments)
      .where(eq(assessments.phone, phone))
      .orderBy(assessments.createdAt);

    // 解析JSON字段
    const formattedRecords = records.map((record: any) => ({
      ...record,
      scores: typeof record.scores === 'string' ? JSON.parse(record.scores) : record.scores,
    }));

    res.json(formattedRecords);
  } catch (error) {
    console.error('查询历史记录失败:', error);
    res.status(500).json({ error: '查询失败' });
  }
});

export default router;
