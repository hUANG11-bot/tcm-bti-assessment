import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { sdk } from '../_core/sdk';
import { COOKIE_NAME, ONE_YEAR_MS } from '../../shared/const';
import { getSessionCookieOptions } from '../_core/cookies';

const router = Router();

/**
 * 微信小程序登录接口
 * POST /api/wechat/login
 * Body: { code: string, userInfo?: { nickName: string, avatarUrl: string } }
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { code, userInfo } = req.body;

    if (!code) {
      return res.status(400).json({ 
        success: false,
        message: '微信登录凭证 code 不能为空' 
      });
    }

    // 注意：这里需要配置微信小程序的 AppID 和 AppSecret
    // 实际项目中应该从环境变量读取
    const WX_APPID = process.env.WX_APPID || 'wx04a7af67c8f47620';
    const WX_SECRET = process.env.WX_SECRET || '';

    if (!WX_SECRET) {
      console.error('[WeChat Login] WX_SECRET is not configured');
      return res.status(500).json({ 
        success: false,
        message: '服务器配置错误，请联系管理员' 
      });
    }

    // 1. 使用 code 换取 openid 和 session_key
    // 注意：这里需要调用微信 API
    // 实际实现中，应该使用微信官方 SDK 或直接调用微信 API
    const wxApiUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${WX_APPID}&secret=${WX_SECRET}&js_code=${code}&grant_type=authorization_code`;
    
    console.log('[WeChat Login] Calling WeChat API with AppID:', WX_APPID);
    console.log('[WeChat Login] Code length:', code?.length || 0);
    
    const wxResponse = await fetch(wxApiUrl);
    const wxData = await wxResponse.json();

    if (wxData.errcode) {
      console.error('[WeChat Login] WeChat API error:', {
        errcode: wxData.errcode,
        errmsg: wxData.errmsg,
        appid: WX_APPID,
        hasSecret: !!WX_SECRET,
      });
      
      // 根据不同的错误码返回更详细的错误信息
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

    const { openid, session_key } = wxData;

    if (!openid) {
      return res.status(400).json({ 
        success: false,
        message: '获取用户 openid 失败' 
      });
    }

    // 2. 创建或更新用户
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ 
        success: false,
        message: '数据库连接失败' 
      });
    }

    // 使用 openid 作为用户标识
    // 注意：这里假设 openid 就是用户的唯一标识
    // 实际项目中可能需要根据业务需求调整
    await db.upsertUser({
      openId: openid,
      name: userInfo?.nickName || null,
      email: null,
      loginMethod: 'wechat_miniprogram',
      lastSignedIn: new Date(),
    });

    // 3. 创建 session token
    const sessionToken = await sdk.createSessionToken(openid, {
      name: userInfo?.nickName || '',
      expiresInMs: ONE_YEAR_MS,
    });

    // 4. 设置 cookie
    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, sessionToken, { 
      ...cookieOptions, 
      maxAge: ONE_YEAR_MS 
    });

    // 5. 返回成功响应
    return res.json({
      success: true,
      user: {
        openId: openid,
        name: userInfo?.nickName || null,
        avatar: userInfo?.avatarUrl || null,
      },
    });
  } catch (error: any) {
    console.error('[WeChat Login] Error:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message || '登录失败，请稍后重试' 
    });
  }
});

export default router;
