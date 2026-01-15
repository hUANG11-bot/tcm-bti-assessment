import Taro from '@tarojs/taro'

/**
 * 检测是否在微信小程序中
 */
export function isWechat(): boolean {
  // 在Taro中，可以通过Taro.getEnv()判断环境
  return Taro.getEnv() === Taro.ENV_TYPE.WEAPP
}

/**
 * 配置微信分享
 */
export interface WechatShareConfig {
  title: string
  desc: string
  link: string
  imgUrl: string
}

export function configWechatShare(config: WechatShareConfig) {
  if (!isWechat()) {
    console.log('Not in WeChat mini program, skip share config')
    return
  }

  // 小程序中的分享配置
  // 需要在页面的onShareAppMessage中配置
  console.log('WeChat share configured:', config)
}

/**
 * 设置默认分享配置
 */
export function setDefaultShare() {
  const defaultConfig: WechatShareConfig = {
    title: 'TCM-BTI 中医体质评估',
    desc: '探寻身体的山水画卷，解码您的体质语言，定制专属养生方案',
    link: '',
    imgUrl: '',
  }

  configWechatShare(defaultConfig)
}

/**
 * 设置体质报告分享配置
 */
export function setReportShare(bodyType: string) {
  const reportConfig: WechatShareConfig = {
    title: `我的体质是【${bodyType}】`,
    desc: '我刚完成了TCM-BTI体质评估，快来测测你的体质吧！',
    link: '',
    imgUrl: '',
  }

  configWechatShare(reportConfig)
}
