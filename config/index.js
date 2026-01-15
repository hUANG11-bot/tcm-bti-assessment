import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import devConfig from './dev'
import prodConfig from './prod'

// https://taro-docs.jd.com/docs/next/config
export default defineConfig(async (merge, { command, mode }) => {
  const baseConfig: UserConfigExport = {
    projectName: 'tcm-bti-assessment',
    date: '2025-1-27',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    // 完全排除 client 目录，不参与编译
    exclude: [/client/],
    plugins: ['@tarojs/plugin-framework-react'],
    defineConstants: {
      // API 服务器地址，可以在环境变量中设置 TARO_APP_API_URL
      // 开发环境默认使用 localhost:3000，生产环境使用自定义域名
      TARO_APP_API_URL: JSON.stringify(
        process.env.TARO_APP_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://er1.store')
      )
    },
    copy: {
      patterns: [
        {
          from: 'src/assets/images',
          to: 'assets/images'
        }
      ],
      options: {}
    },
    framework: 'react',
    compiler: {
      type: 'webpack5',
      prebundle: { enable: false }
    },
    cache: {
      enable: false // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
    },
    // 清理编译缓存
    clean: true,
    alias: {
      '@': require('path').resolve(__dirname, '..', 'src'),
      '@shared': require('path').resolve(__dirname, '..', 'shared'),
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {
            selectorBlackList: ['.van-', '.nut-'],
            onePxTransform: true,
            unitPrecision: 5,
            propList: ['*'],
            replace: true,
            mediaQuery: false,
            minPixelValue: 0
          }
        },
        url: {
          enable: true,
          config: {
            limit: 1024 // 设定转换尺寸上限
          }
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      },
      webpackChain(chain) {
        // 禁用 tsconfig-paths，因为它可能使用指向 client 目录的 tsconfig.json
        // 直接使用 alias 配置，确保只解析 src 目录
        // chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
        
        // 关键修复：在 resolve 阶段就替换有问题的包（使用多种方式确保生效）
        const path = require('path')
        const webpack = require('webpack')
        const emptyModulePath = path.resolve(__dirname, '../src/lib/empty.ts')
        
        // React 18 与 Taro 3.6.0 兼容，不需要特殊处理
        // 让 Webpack 使用默认的模块解析
        
        // 方法1: 使用 resolve.alias（最优先，在模块解析的最早阶段）
        // 确保 @radix-ui 和 class-variance-authority 被替换
        chain.resolve.alias
          .set('@radix-ui/react-slot', emptyModulePath)
          .set('class-variance-authority', emptyModulePath)
        
        // 方法2: 使用 NormalModuleReplacementPlugin（在模块解析时替换）
        // 使用更宽泛的匹配，包括所有可能的导入路径
        chain.plugin('replace-radix-ui')
          .use(webpack.NormalModuleReplacementPlugin, [
            /@radix-ui\/react-slot/,
            emptyModulePath
          ])
        chain.plugin('replace-cva')
          .use(webpack.NormalModuleReplacementPlugin, [
            /class-variance-authority/,
            emptyModulePath
          ])
        
        // 修复 React 解析问题：确保使用正确的 mainFields 顺序
        // 让 Webpack 使用默认的模块解析，不要强制使用生产版本
        chain.resolve.mainFields
          .clear()
          .add('browser')
          .add('module')
          .add('main')
        
        // 方法3: 使用 IgnorePlugin 完全忽略这些包（最后手段）
        // 这会阻止 Webpack 尝试解析这些包
        chain.plugin('ignore-problematic-packages')
          .use(webpack.IgnorePlugin, [
            {
              resourceRegExp: /^@radix-ui\/react-slot$/,
            }
          ])
        chain.plugin('ignore-cva')
          .use(webpack.IgnorePlugin, [
            {
              resourceRegExp: /^class-variance-authority$/,
            }
          ])
        
        // 方法4: 使用 IgnorePlugin 完全忽略 client 目录中的所有文件
        chain.plugin('ignore-client-dir')
          .use(webpack.IgnorePlugin, [
            {
              resourceRegExp: /client[\\/]/,
            }
          ])
        
        // 排除 client 目录（确保所有规则都排除它）
        // 使用更严格的排除规则
        const excludeClient = (filePath) => {
          return /[\\/]client[\\/]/.test(filePath) || filePath.includes('\\client\\') || filePath.includes('/client/')
        }
        
        chain.module
          .rule('script')
          .exclude
            .add(excludeClient)
            .end()
        
        // 排除 client 目录的所有文件
        chain.module
          .rule('exclude-client')
          .test(/\.(ts|tsx|js|jsx)$/)
          .exclude
            .add(excludeClient)
            .end()
        
        // 关键：添加一个最优先的规则，处理所有 node_modules 中的 TypeScript 文件
        // 这个规则必须在所有其他规则之前执行
        chain.module
          .rule('node-modules-ts-first')
          .enforce('pre')
          .test(/\.tsx?$/)
          .exclude
            .add(/client[\\/]/)
            .end()
          .include
            .add((filePath) => {
              // 只处理 node_modules 中的文件
              if (!/node_modules[\\/]/.test(filePath)) {
                return false
              }
              // 排除 Taro 自己的包
              if (/node_modules[\\/](@tarojs|taro)[\\/]/.test(filePath)) {
                return false
              }
              // 特别处理有问题的包，确保它们被 Babel 处理
              if (/node_modules[\\/](@radix-ui|class-variance-authority)[\\/]/.test(filePath)) {
                return true
              }
              return true
            })
            .end()
          .use('babel-loader-ts')
          .loader('babel-loader')
          .options({
            presets: [
              ['@babel/preset-env', { modules: false }],
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript'
            ],
            cacheDirectory: true,
            configFile: require('path').resolve(__dirname, '../babel.config.cjs')
          })
      }
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      esnextModules: ['taro-ui'],
      postcss: {
        autoprefixer: {
          enable: true,
          config: {}
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      },
      webpackChain(chain) {
        // 禁用 tsconfig-paths，直接使用 alias 配置
        // chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
      }
    },
    rn: {
      appName: 'tcm-bti-assessment',
      postcss: {
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        }
      }
    }
  }
  if (process.env.NODE_ENV === 'development') {
    // 本地开发构建配置（不混淆压缩）
    return merge({}, baseConfig, devConfig)
  }
  // 生产构建配置（默认开启压缩混淆）
  return merge({}, baseConfig, prodConfig)
})
