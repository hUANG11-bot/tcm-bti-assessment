module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      ['@babel/preset-env', {
        modules: false
      }],
      ['@babel/preset-react', {
        runtime: 'automatic' // 使用新的 JSX 转换，不需要导入 React
      }],
      '@babel/preset-typescript'
    ]
  }
}
