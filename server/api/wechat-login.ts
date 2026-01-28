import { Router, Request, Response } from 'express';
import { upsertUser, getUserByOpenId } from '../db';
import { sdk } from '../_core/sdk';
import { COOKIE_NAME, ONE_YEAR_MS } from '@shared/const';
import { getSessionCookieOptions } from '../_core/cookies';
import axios from 'axios';
import https from 'https';

const router = Router();

// 用于存储已使用的 code，防止重复使用（生产环境建议使用 Redis）
const usedCodes = new Map<string, { openid: string; timestamp: number }>();
const CODE_EXPIRY_MS = 5 * 60 * 1000; // 5分钟过期

// 清理过期的 code
function cleanupExpiredCodes() {
  const now = Date.now();
  for (const [code, data] of usedCodes.entries()) {
    if (now - data.timestamp > CODE_EXPIRY_MS) {
      usedCodes.delete(code);
    }
  }
}

// 每分钟清理一次
setInterval(cleanupExpiredCodes, 60 * 1000);

/**
 * 微信小程序登录接口
 * POST /api/wechat/login
 * Body: { code: string, userInfo?: { nickName: string, avatarUrl: string } }
 */
router.post('/login', async (req: Request, res: Response) => {
  const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  
  try {
    const { code, userInfo } = req.body;

    console.log(`[WeChat Login][${requestId}] ========== 新登录请求 ==========`);
    console.log(`[WeChat Login][${requestId}] 时间: ${new Date().toISOString()}`);
    console.log(`[WeChat Login][${requestId}] Code: ${code?.substring(0, 15)}...`);

    if (!code) {
      console.error(`[WeChat Login][${requestId}] 错误: code 为空`);
      return res.status(400).json({ 
        success: false,
        message: '微信登录凭证 code 不能为空' 
      });
    }

    // 检查 code 是否已被使用（防止重复提交）
    const usedCodeData = usedCodes.get(code);
    if (usedCodeData) {
      console.log(`[WeChat Login][${requestId}] Code 已被使用，返回缓存的 openid: ${usedCodeData.openid}`);
      
      // 返回之前缓存的结果
      const existingUser = await getUserByOpenId(usedCodeData.openid);
      const sessionToken = await sdk.createSessionToken(usedCodeData.openid, {
        name: existingUser?.name || userInfo?.nickName || '',
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { 
        ...cookieOptions, 
        maxAge: ONE_YEAR_MS 
      });

      return res.json({
        success: true,
        user: {
          openId: usedCodeData.openid,
          name: existingUser?.name || userInfo?.nickName || null,
          avatar: existingUser?.avatar || userInfo?.avatarUrl || null,
        },
        sessionToken: sessionToken,
        _cached: true, // 标记这是缓存的结果
      });
    }

    // 注意：这里需要配置微信小程序的 AppID 和 AppSecret
    // 实际项目中应该从环境变量读取
    const WX_APPID = process.env.WX_APPID || 'wx04a7af67c8f47620';
    const WX_SECRET = process.env.WX_SECRET || '';

    if (!WX_SECRET) {
      console.error(`[WeChat Login][${requestId}] 错误: WX_SECRET 未配置`);
      return res.status(500).json({ 
        success: false,
        message: '服务器配置错误，请联系管理员' 
      });
    }

    // 1. 使用 code 换取 openid 和 session_key
    const wxApiUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${WX_APPID}&secret=${WX_SECRET}&js_code=${code}&grant_type=authorization_code`;
    
    console.log(`[WeChat Login][${requestId}] 调用微信API, AppID: ${WX_APPID}`);
    
    // 使用 axios 替代 fetch，解决 SSL 证书验证问题
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });
    
    const wxResponse = await axios.get(wxApiUrl, {
      httpsAgent,
      timeout: 10000,
    });
    const wxData = wxResponse.data;

    console.log(`[WeChat Login][${requestId}] 微信API响应:`, {
      hasOpenid: !!wxData.openid,
      openidPrefix: wxData.openid?.substring(0, 10) || 'N/A',
      hasSessionKey: !!wxData.session_key,
      hasUnionid: !!wxData.unionid,
      errcode: wxData.errcode,
      errmsg: wxData.errmsg,
    });

    if (wxData.errcode) {
      console.error(`[WeChat Login][${requestId}] 微信API错误:`, {
        errcode: wxData.errcode,
        errmsg: wxData.errmsg,
      });
      
      let errorMessage = wxData.errmsg || '微信登录失败';
      if (wxData.errcode === 40013) {
        errorMessage = 'AppID 无效，请检查配置';
      } else if (wxData.errcode === 40125) {
        errorMessage = 'AppSecret 无效，请检查配置';
      } else if (wxData.errcode === 40029) {
        errorMessage = '登录凭证已过期，请重新登录';
      } else if (wxData.errcode === 40163) {
        errorMessage = '登录凭证已被使用，请重新获取';
      }
      
      return res.status(400).json({ 
        success: false,
        message: errorMessage,
        errcode: wxData.errcode,
      });
    }

    const { openid, session_key, unionid } = wxData;

    if (!openid) {
      console.error(`[WeChat Login][${requestId}] 错误: 未获取到 openid`);
      return res.status(400).json({ 
        success: false,
        message: '获取用户 openid 失败' 
      });
    }

    // 将 code 标记为已使用
    usedCodes.set(code, { openid, timestamp: Date.now() });

    // 2. 创建或更新用户
    console.log(`[WeChat Login][${requestId}] 用户 openId: ${openid}`);
    console.log(`[WeChat Login][${requestId}] 用户昵称: ${userInfo?.nickName || '(未提供)'}`);
    
    try {
      await upsertUser({
        openId: openid,
        name: userInfo?.nickName || null,
        avatar: userInfo?.avatarUrl || null,
        email: null,
        loginMethod: 'wechat_miniprogram',
        lastSignedIn: new Date(),
      });
      console.log(`[WeChat Login][${requestId}] 用户记录已更新`);
    } catch (dbError: any) {
      console.error(`[WeChat Login][${requestId}] 数据库错误:`, {
        message: dbError?.message,
        code: dbError?.code,
      });
      throw dbError;
    }

    // 3. 创建 session token
    const sessionToken = await sdk.createSessionToken(openid, {
      name: userInfo?.nickName || '',
      expiresInMs: ONE_YEAR_MS,
    });

    console.log(`[WeChat Login][${requestId}] Session token 已创建`);

    // 4. 设置 cookie
    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, sessionToken, { 
      ...cookieOptions, 
      maxAge: ONE_YEAR_MS 
    });

    // 5. 返回成功响应
    console.log(`[WeChat Login][${requestId}] 登录成功, openId: ${openid}`);
    
    return res.json({
      success: true,
      user: {
        openId: openid,
        name: userInfo?.nickName || null,
        avatar: userInfo?.avatarUrl || null,
      },
      sessionToken: sessionToken,
    });
  } catch (error: any) {
    console.error(`[WeChat Login][${requestId}] 异常:`, error.message);
    return res.status(500).json({ 
      success: false,
      message: error.message || '登录失败，请稍后重试' 
    });
  }
});

/**
 * 调试接口：获取当前 session 信息
 * GET /api/wechat/debug-session
 */
router.get('/debug-session', async (req: Request, res: Response) => {
  try {
    // 尝试获取当前用户
    const user = await sdk.authenticateRequest(req, true);
    
    if (user) {
      return res.json({
        authenticated: true,
        user: {
          id: user.id,
          openId: user.openId,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
        },
      });
    } else {
      return res.json({
        authenticated: false,
        message: '未登录或 session 无效',
      });
    }
  } catch (error: any) {
    return res.json({
      authenticated: false,
      error: error.message,
    });
  }
});

export default router;
