export default {
  navigationBarTitleText: '邀请好友',
  enableShareAppMessage: true,
  onShareAppMessage() {
    return {
      title: 'TCM-BTI 中医体质评估',
      desc: '我刚完成了TCM-BTI中医体质评估，发现了很多关于自己身体的秘密！快来测测你的体质吧！',
      path: '/pages/index/index',
    }
  },
}
