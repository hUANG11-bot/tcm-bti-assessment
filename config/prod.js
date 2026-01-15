export default {
  mini: {},
  h5: {
    /**
     * WebpackChain 插件配置
     * @docs https://github.com/neutrinojs/webpack-chain
     */
    // webpackChain (chain) {},
    /**
     * Webpack 相关配置
     * @docs https://webpack.js.org/configuration/
     */
    // webpack [object]
    /**
     * 路由相关配置
     * @docs https://taro-docs.jd.com/docs/next/router
     */
    router: {
      mode: 'hash', // 或者是 "browser"
      basename: '/',
      customRoutes: {
        '/pages/index/index': '/',
        '/pages/user-info/index': '/user-info',
        '/pages/assessment/index': '/assessment',
        '/pages/result/index': '/result',
        '/pages/history/index': '/history',
        '/pages/invite/index': '/invite',
        '/pages/admin/login/index': '/admin/login',
        '/pages/admin/index': '/admin',
      }
    }
  }
}
