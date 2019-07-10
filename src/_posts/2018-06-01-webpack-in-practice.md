---
category: 前端
tags:
  - 前端工程化
  - Webpack
date: 2018-06-03
title: Webpack前端工程化配置
---

从工程构建角度去了解一个前端项目我认为是走向架构的一个good sign，每个前端其实也有责任去了解自己项目的构建过程，这才能做到有效的降低开发成本和服务器压力

<!-- more -->

> 本文参考自：https://juejin.im/post/59bb37fa6fb9a00a554f89d2#heading-8

## 直接上手

### webpack.config.js
```javascript
const path = require('path')
module.exports = {
  entry:  './app/index.js', // 入口文件
  output: {
    path: path.resolve(__dirname, 'build'), // 必须使用绝对地址，输出文件夹
    filename: "bundle.js" // 打包后输出文件的文件名
  }
}
```

### index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Document</title>
</head>
<body>
  <div id="app"></div>
  <script src="./build/bundle.js"></script>
</body>
</html>
```

### package.json
```json
"scripts": {
  "start": "webpack"
}
```

上面就是一个webpack的最初时的样子，得益于webpack和社区的努力，这样的配置已经可以让你的web应用快速打包发布了，然而我们对于生产环境的工程应该有更高的要求。

## Loader的理解与配置
### Babel
Babel 可以让你使用 ES2015/16/17 写代码而不用顾忌浏览器的问题，Babel 可以帮你转换代码。首先安装必要的几个 Babel 库。

#### 依赖包
> npm i --save-dev babel-loader babel-core babel-preset-env
- babel-loader 用于让 webpack 知道如何运行 babel
- babel-core 可以看做编译器，这个库知道如何解析代码
- babel-preset-env 这个库可以根据环境的不同转换代码

#### webpack.config.js
```javascript
module.exports = {
  // ......
  module: {
    rules: [{
      // js 文件才使用 babel
      test: /\.js$/,
      // 使用哪个 loader
      use: 'babel-loader',
      // 不包括路径
      exclude: /node_modules/
    }]
  }
}
```

#### .babelrc
```json
{
  "presets": ["babel-preset-env"]
}
```

### 处理图片
创建一个 images 文件夹，放入两张图片，并且在 app 文件夹下创建一个 js 文件处理图片
#### 依赖包
> npm i --save-dev url-loader file-loader

在工程中引用这些图片，就像这样：
```javascript
// addImage.js
let smallImg = document.createElement('img')
// 必须 require 进来
smallImg.src = require('../images/small.jpeg')
document.body.appendChild(smallImg)

let bigImg = document.createElement('img')
bigImg.src = require('../images/big.jpeg')
document.body.appendChild(bigImg)
```
然后添加对应的loader
```javascript
module.exports = {
// ...
    module: {
        rules: [
            // ...
            {
            // 图片格式正则
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                use: [
                  {
                    loader: 'url-loader',
                    // 配置 url-loader 的可选项
                    options: {
                    // 限制 图片大小 10000B，小于限制会将图片转换为 base64格式
                      limit: 10000,
                    // 超出限制，创建的文件格式
                    // build/images/[图片名].[hash].[图片格式]
                      name: 'images/[name].[hash].[ext]'
                   }
                  }
                ]
            }
        ]
    }
  }
```
`npm run start`之后，可以看到控制台输出结果
![](https://user-gold-cdn.xitu.io/2017/9/15/b460ba75c92052ffd2df037b76af7ddb?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

你会发现大的图片被提取出来，小的图片被打包进`bundle.js`了，这也就导致了页面上小图被加载，大图裂了的情况，其实就是路径不对，改一下webpack config即可
```javascript
module.exports = {
    entry:  './app/index.js', // 入口文件
    output: {
      path: path.resolve(__dirname, 'build'), // 必须使用绝对地址，输出文件夹
      filename: "bundle.js", // 打包后输出文件的文件名
      publicPath: 'build/' // 知道如何寻找资源
    }
    // ...
  }
```

### 处理CSS
为工程引入css文件，就像这样：
```css
img {
    border: 5px black solid;
}
.test {border: 5px black solid;}
```
我们引入`css-loader`和`style-loader`来处理。
- css-loader: 让css文件支持`import`导入
- style-loader: 将解析出来的 CSS 通过标签的形式插入到 HTML 中，所以依赖css-loader

> npm i --save-dev css-loader style-loader

修改之前的js文件
```javascript
import '../styles/addImage.css'

let smallImg = document.createElement('img')
smallImg.src = require('../images/small.jpeg')
document.body.appendChild(smallImg)

// let bigImg = document.createElement('img')
// bigImg.src = require('../images/big.jpeg')
// document.body.appendChild(bigImg)
```

#### webpack.config.js
```javascript
module.exports = {
// ...
    module: {
      rules: [
        {
            test: /\.css$/,
            use: ['style-loader',
                {
                    loader: 'css-loader',
                    options: {
                        modules: true
                       }
                }
            ]
        },
      ]
    }
  }
```
再次运行后发现样式生效了，并且观察此时的element会发现

![](https://user-gold-cdn.xitu.io/2017/9/15/aa11101b8e22e4dd6b8c6432cfa26e03?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

我们在 css 文件中写的代码被加入到了 style 标签中，并且因为我们开启了 CSS 模块化的选项，所以 .test 被转成了唯一的哈希值，这样就解决了 CSS 的变量名重复问题。

但是将 CSS 代码整合进 JS 文件也是有弊端的，大量的 CSS 代码会造成 JS 文件的大小变大，操作 DOM 也会造成性能上的问题，所以接下来我们将使用`extract-text-webpack-plugin`插件将 CSS 文件打包为一个单独文件。

> npm i --save-dev extract-text-webpack-plugin

再次修改webpack config
```javascript
const ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
// ....
    module: {
      rules: [
        {
          test: /\.css$/,
          // 写法和之前基本一致
          loader: ExtractTextPlugin.extract({
          // 必须这样写，否则会报错
                fallback: 'style-loader',
                use: [{
                    loader: 'css-loader',
                    options: { 
                        modules: true
                    }
                }]
            })
        ]
        }
      ]
    },
    // 插件列表
    plugins: [
    // 输出的文件路径
      new ExtractTextPlugin("css/[name].[hash].css")
    ]
  }
```
再次运行start，会发现css文件被提取出来了！

![](https://user-gold-cdn.xitu.io/2017/9/15/343a4f4e729dc87f0ba67a652128dea3?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

但此时刷新页面发现样式消失了，这是因为HTML文件没有引用到这个被打上哈希值的css文件，我们再处理一下就好。

### 分离代码
先让我们考虑下缓存机制。对于代码中依赖的库很少会去主动升级版本，但是我们自己的代码却每时每刻都在变更，所以我们可以考虑将依赖的库和自己的代码分割开来，这样用户在下一次使用应用时就可以尽量避免重复下载没有变更的代码，那么既然要将依赖代码提取出来，我们需要变更下入口和出口的部分代码。
```javascript
// 这是 packet.json 中 dependencies 下的
const VENDOR = [
  "faker",
  "lodash",
  "react",
  "react-dom",
  "react-input-range",
  “react-router”,
  "react-redux",
  "redux",
  "redux-form",
  "redux-thunk"
]

module.exports = {
// 之前我们都是使用了单文件入口
// entry 同时也支持多文件入口，现在我们有两个入口
// 一个是我们自己的代码，一个是依赖库的代码
  entry: {
  // bundle 和 vendor 都是自己随便取名的，会映射到 [name] 中
    bundle: './src/index.js',
    vendor: VENDOR
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js'
  },
  // ...
 }
```
此时build一下，我们会发现
![](https://user-gold-cdn.xitu.io/2017/9/16/370471eb63feeaa72e86415e396141e3?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)
`bundle.js`的文件大小根本没变，这是因为`bundle`中也引入了依赖库，刚才的配置并没有将依赖库从`bundle`中提取出来。

#### 抽取共同代码
此时就要用到`CommonsChunkPlugin`了
```javascript
module.exports = {
//...
  output: {
    path: path.join(__dirname, 'dist'),
    // 既然我们希望缓存生效，就应该每次在更改代码以后修改文件名
    // [chunkhash]会自动根据文件是否更改而更换哈希
    filename: '[name].[chunkhash].js'
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
    // vendor 的意义和之前相同
    // manifest文件是将每次打包都会更改的东西单独提取出来，保证没有更改的代码无需重新打包，这样可以加快打包速度
      names: ['vendor', 'manifest'],
      // 配合 manifest 文件使用
      minChunks: Infinity
    })
  ]
};
```
![](https://user-gold-cdn.xitu.io/2017/9/16/0a0617d1f53173638cf9da06769bea27?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)
这样就可以了。但是我们使用哈希来保证缓存的同时会发现每次 build 都会生成不一样的文件，这时候我们引入另一个插件来帮助我们删除不需要的文件。这时候就需要`CleanWebpackPlugin`了。

> npm install --save-dev clean-webpack-plugin

```javascript
module.exports = {
//...
  plugins: [
  // 只删除 dist 文件夹下的 bundle 和 manifest 文件
    new CleanWebpackPlugin(['dist/bundle.*.js','dist/manifest.*.js'], {
    // 打印 log
      verbose: true,
      // 删除文件
      dry: false
    }),
  ]
};
```
因为我们现在将文件已经打包成三个 JS 了，以后也许会更多，每次新增 JS 文件我们都需要手动在 HTML 中新增标签，现在我们可以通过一个插件来自动完成这个功能。这时候我们需要`HtmlWebpackPlugin`。

> npm install html-webpack-plugin --save-dev

```javascript
module.exports = {
//...
  plugins: [
  // 我们这里将之前的 HTML 文件当做模板
  // 注意在之前 HTML 文件中请务必删除之前引入的 JS 文件
    new HtmlWebpackPlugin({
      template: 'index.html'
    })
  ]
};
```
![](https://user-gold-cdn.xitu.io/2017/9/17/f8a5991239c5aa45f845d1d9d4afe05d?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)
执行 build 操作会发现同时生成了 HTML 文件，并且已经自动引入了 JS 文件。

#### 按需加载代码
现在我们的 bundle 文件包含了我们全部的自己代码。但是当用户访问我们的首页时，其实我们根本无需让用户加载除了首页以外的代码，这个优化我们可以通过路由的异步加载来完成。

#### 自动刷新
每次更新代码都需要执行依次 build，并且还要等上一会很麻烦。

> npm i --save-dev webpack-dev-server

接着修改`package.json`
```json
"scripts": {
    "build": "webpack",
    "dev": "webpack-dev-server --open"
  },
```
现在直接执行 npm run dev 可以发现浏览器自动打开了一个空的页面，并且在命令行中也多了新的输出
![](https://user-gold-cdn.xitu.io/2017/9/17/43f5b70bd82152ce21379120dfab8d71?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)
等待编译完成以后，修改 JS 或者 CSS 文件，可以发现 webpack 自动帮我们完成了编译，并且只更新了需要更新的代码
![](https://user-gold-cdn.xitu.io/2017/9/17/7a5769363d0782abc59902d370c52472?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

还可以通过`hot-loader`实现模块热替换

### 可以上生产了

> npm i --save-dev url-loader optimize-css-assets-webpack-plugin file-loader extract-text-webpack-plugin

一份标准的config
```javascript
var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin')
var CleanWebpackPlugin = require('clean-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')

const VENOR = ["faker",
  "lodash",
  "react",
  "react-dom",
  "react-input-range",
  "react-redux",
  "redux",
  "redux-form",
  "redux-thunk",
  "react-router"
]

module.exports = {
  entry: {
    bundle: './src/index.js',
    vendor: VENOR
  },
  // 如果想修改 webpack-dev-server 配置，在这个对象里面修改
  devServer: {
    port: 8081
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].[chunkhash].js'
  },
  module: {
    rules: [{
        test: /\.js$/,
        use: 'babel-loader'
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: [{
            loader: 'url-loader',
            options: {
                limit: 10000,
                name: 'images/[name].[hash:7].[ext]'
            }
        }]
    },
    {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [{
            // 这边其实还可以使用 postcss 先处理下 CSS 代码
                loader: 'css-loader'
            }]
        })
    },
    ]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: ['vendor', 'manifest'],
      minChunks: Infinity
    }),
    new CleanWebpackPlugin(['dist/*.js'], {
      verbose: true,
      dry: false
    }),
    new HtmlWebpackPlugin({
      template: 'index.html'
    }),
    // 生成全局变量
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("process.env.NODE_ENV")
    }),
    // 分离 CSS 代码
    new ExtractTextPlugin("css/[name].[contenthash].css"),
    // 压缩提取出的 CSS，并解决ExtractTextPlugin分离出的 JS 重复问题
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        safe: true
      }
    }),
    // 压缩 JS 代码
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ]
};
```
接下来在`package.json`中做些手脚
```
"scripts": {
    "build": "NODE_ENV=production webpack -p",
    "dev": "webpack-dev-server --open"
  }
```
![](https://user-gold-cdn.xitu.io/2017/9/17/ff8acf374946ee6db118117f22ec48f5?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)
可以看到我们在经历了这么多步以后，将 bundle 缩小到了只有 27.1KB，像 vendor 这种常用的库我们一般可以使用 CDN 的方式外链进来。
### 补充技巧
```javascript
module.exports = {
  resolve: {
  // 文件扩展名，写明以后就不需要每个文件写后缀
    extensions: ['.js', '.css', '.json'],
 // 路径别名，比如这里可以使用 css 指向 static/css 路径
    alias: {
      '@': resolve('src'),
      'css': resolve('static/css')
    }
  },
  // 生成 source-map，用于打断点，这里有好几个选项
  devtool: '#cheap-module-eval-source-map',
}
```