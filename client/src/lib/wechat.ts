import wx from 'weixin-js-sdk';

/**
 * 检测是否在微信浏览器中
 */
export function isWechat(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return /micromessenger/.test(ua);
}

/**
 * 配置微信分享
 * 注意：实际使用时需要后端提供签名接口
 */
export interface WechatShareConfig {
  title: string;
  desc: string;
  link: string;
  imgUrl: string;
}

export function configWechatShare(config: WechatShareConfig) {
  if (!isWechat()) {
    console.log('Not in WeChat browser, skip share config');
    return;
  }

  // 注意：这里需要后端提供签名接口
  // 实际部署时需要实现 /api/wechat/jssdk-config 接口
  // 该接口应返回：{ appId, timestamp, nonceStr, signature }
  
  // 临时方案：仅配置分享内容，不调用后端签名
  // 在微信开发者工具中可以测试分享UI，但实际分享需要后端支持
  
  const shareData = {
    title: config.title,
    desc: config.desc,
    link: config.link,
    imgUrl: config.imgUrl,
    success: function () {
      console.log('Share success');
    },
    cancel: function () {
      console.log('Share cancelled');
    },
  };

  // 如果有后端签名接口，取消下面的注释并实现
  /*
  fetch('/api/wechat/jssdk-config?url=' + encodeURIComponent(location.href.split('#')[0]))
    .then(res => res.json())
    .then(data => {
      wx.config({
        debug: false,
        appId: data.appId,
        timestamp: data.timestamp,
        nonceStr: data.nonceStr,
        signature: data.signature,
        jsApiList: [
          'updateAppMessageShareData', // 分享给朋友
          'updateTimelineShareData',   // 分享到朋友圈
        ],
      });

      wx.ready(() => {
        // 分享给朋友
        wx.updateAppMessageShareData(shareData);
        // 分享到朋友圈
        wx.updateTimelineShareData(shareData);
      });

      wx.error((res: any) => {
        console.error('WeChat JS-SDK error:', res);
      });
    })
    .catch(err => {
      console.error('Failed to fetch WeChat config:', err);
    });
  */

  console.log('WeChat share configured (frontend only):', shareData);
}

/**
 * 设置默认分享配置
 */
export function setDefaultShare() {
  const defaultConfig: WechatShareConfig = {
    title: 'TCM-BTI 中医体质评估',
    desc: '探寻身体的山水画卷，解码您的体质语言，定制专属养生方案',
    link: window.location.origin,
    imgUrl: window.location.origin + '/images/logo-placeholder.png',
  };

  configWechatShare(defaultConfig);
}

/**
 * 设置体质报告分享配置
 */
export function setReportShare(bodyType: string) {
  const reportConfig: WechatShareConfig = {
    title: `我的体质是【${bodyType}】`,
    desc: '我刚完成了TCM-BTI体质评估，快来测测你的体质吧！',
    link: window.location.origin,
    imgUrl: window.location.origin + '/images/logo-placeholder.png',
  };

  configWechatShare(reportConfig);
}
