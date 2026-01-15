export default {
  pages: [
    'pages/index/index',
    'pages/user-info/index',
    'pages/assessment/index',
    'pages/result/index',
    'pages/ai-chat/index',
    'pages/invite/index',
    'pages/profile/index',
    'pages/admin/login/index',
    'pages/admin/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'TCM-BTI 中医体质评估',
    navigationBarTextStyle: 'black',
    backgroundColor: '#fcfcfc',
  },
  tabBar: {
    custom: true,
    color: '#666666',
    selectedColor: '#8FBC8F',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
      },
    ],
  },
}
