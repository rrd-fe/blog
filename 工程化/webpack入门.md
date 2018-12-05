# webpack入门

## webpack简介

### webpack是什么？

本质上，webpack 是一个现代 JavaScript 应用程序的静态模块打包器(module bundler)。当 webpack 处理应用程序时，它会递归地构建一个依赖关系图(dependency graph)，其中包含应用程序需要的每个模块，然后将所有这些模块打包成一个或多个 bundle。

学习webpack，可以先从官方文档开始：

* [webpack 中文文档](https://www.webpackjs.com/concepts/)
* [webpack Documentation](https://webpack.js.org/concepts/)

### webpack能干什么？

想一想前端同学的日常搬砖的场景：

* 开发的时候需要一个开发环境，要是我们修改一下代码保存之后浏览器就自动展现最新的代码那就好了（热更新服务）
* 本地写代码的时候，要是调后端的接口不跨域就好了（代理服务）
* 为了跟上时代，要是能用上什么ES678N等等新东西就好了（翻译服务）
* 项目要上线了，要是能一键压缩代码啊图片什么的就好了（压缩打包服务）
* 我们平时的静态资源都是放到CDN上的，要是能自动帮我把这些搞好的静态资源上到CDN去就好了（自动上传服务）

上面的这些改进，确实大大的提高了我们的开发效率，但是利用它们开发的文件往往需要进行额外的处理才能让浏览器识别,而手动处理又是非常反锁的，这就为WebPack类的工具的出现提供了需求：

* 如果与输入相关的需求，找entry（比如多页面就有多个入口）
* 如果与输出相关的需求，找output（比如你需要定义输出文件的路径、名字等等）
* 如果与模块寻址相关的需求，找resolve（比如定义别名alias）
* 如果与转译相关的需求，找loader（比如处理sass处理es678N）
* 如果与构建流程相关的需求，找plugin（比如我需要在打包完成后，将打包好的文件复制到某个目录，然后提交到git上）

### webpack版本信息

* 2012年3月推出
* 最新版本：4.26.1（2018.11.27）
* webpack1到2最大的升级是tree-shaking，其次是配置文件的对象化，再其次包括插件的写法优化。
* webpack2到3的最大升级是scope-hoisting。
* webpack3到4简化了整个打包配置操作。

## webpack基础概念

* 入口(entry)
* 输出(output)
* loader
* 插件(plugins)
* 模式(mode)
* 浏览器兼容性(Browser Compatibility)

### 入口

入口(entry)是告诉 webpack，从哪些文件开始，构建项目的内部依赖关系。从入口开始，webpack 会找出所有直接或者间接的依赖，并进行后续处理。所有的依赖项，根据配置的loader和plugins处理完成后，最后输出到称之为 bundles 的文件中。

可以通过在 webpack 配置中配置 entry 属性，来指定一个入口起点（或多个入口起点）。默认值为 ./src。

接下来我们看一个 entry 配置的最简单例子：

webpack.config.js
```
module.exports = {
  entry: './path/to/my/entry/file.js'
};
```

### 出口

output 属性告诉 webpack 在哪里输出它所处理生成的 bundles 文件，以及如何命名这些文件，默认值为 ./dist。

基本上，整个应用程序结构，都会被编译到你指定的输出路径的文件夹中。你可以通过在配置中指定一个 output 字段，来配置这些处理过程：

webpack.config.js
```
const path = require('path');

module.exports = {
  entry: './path/to/my/entry/file.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'my-first-webpack.bundle.js'
  }
};
```

### loader

A loader is a node module exporting a function.

webpack 本身只能打包 Javascript 文件，对于其他资源例如css，图片，或者其他的语法集比如jsx，是没有办法加载的。这就需要对应的loader将资源转化，加载进来。

比如，你的项目代码中，样式文件都使用了 sass 语法，是不能被浏览器识别的，这时候我们就需要使用对应的loader，来把 sass 语法转换成浏览器可以识别的css语法。

在 webpack 的配置中, loader 需要配置以下两个属性：

* test ，用于标识出应该被对应的 loader 进行转换的某个或某些文件。
* use ，表示进行转换时，应该使用哪个 loader。

webpack.config.js

```
const path = require('path');

const config = {
  output: {
    filename: 'my-first-webpack.bundle.js'
  },
  module: {
    rules: [
      { test: /\.txt$/, use: 'raw-loader' }
    ]
  }
};

module.exports = config;
```

以上配置中，对一个单独的 module 对象定义了 rules 属性，里面包含两个必须属性：test 和 use。这告诉 webpack 编译器(compiler) 如下信息：

	“嘿，webpack 编译器，当你碰到「在 require()/import 语句中被解析为 '.txt' 的路径」时，在你对它打包之前，先使用 raw-loader 转换一下。”

#### 使用loader

在你的应用程序中，有三种使用 loader 的方式：

* 配置（推荐）：在 webpack.config.js 文件中指定 loader。
* 内联：在每个 import 语句中显式指定 loader。
* CLI：在 shell 命令中指定它们。


##### 配置

module.rules 允许你在 webpack 配置中指定多个 loader。 这是展示 loader 的一种简明方式，并且有助于使代码变得简洁。同时让你对各个 loader 有个全局概览：

```
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              modules: true
            }
          }
        ]
      }
    ]
  }
```

##### 内联

可以在 import 语句或任何等效于 "import" 的方式中指定 loader。使用 ! 将资源中的 loader 分开。分开的每个部分都相对于当前目录解析。

```
import Styles from 'style-loader!css-loader?modules!./styles.css';
```

通过前置所有规则及使用 `!`，可以对应覆盖到配置中的任意 loader。

选项可以传递查询参数，例如 ?key=value&foo=bar，或者一个 JSON 对象，例如 ?{"key":"value","foo":"bar"}。

##### CLI

你也可以通过 CLI 使用 loader：

```
webpack --module-bind jade-loader --module-bind 'css=style-loader!css-loader'
```

这会对 .jade 文件使用 jade-loader，对 .css 文件使用 style-loader 和 css-loader。

#### loader 特性

* loader 支持链式传递。能够对资源使用流水线(pipeline)。一组链式的 loader 将按照 *相反的顺序* 执行。loader 链中的第一个 loader 返回值给下一个loader。(webpack 选择了函数式编程的方式，所以规定 use 数组中 loader 的执行顺序是从最后一个到第一个)
* 在最后一个 loader，返回 webpack 所预期的 JavaScript。
* loader 可以是同步的，也可以是异步的。
* loader 运行在 Node.js 中，并且能够执行任何可能的操作。
* loader 接收查询参数。用于对 loader 传递配置。
* loader 也能够使用 options 对象进行配置。
* 除了使用 package.json 常见的 main 属性，还可以将普通的 npm 模块导出为 loader，做法是在 package.json 里定义一个 loader 字段。
* 插件(plugin)可以为 loader 带来更多特性。
* loader 能够产生额外的任意文件。

loader 通过（loader）预处理函数，为 JavaScript 生态系统提供了更多能力。 用户现在可以更加灵活地引入细粒度逻辑，例如压缩、打包、语言翻译和其他更多。


### plugins

loader 被用于转换某些类型的模块，而插件则可以用于执行范围更广的任务。插件的范围包括，从打包优化和压缩，一直到重新定义环境中的变量。插件接口功能极其强大，可以用来处理各种各样的任务。插件目的在于解决 loader 无法实现的其他事。

想要使用一个插件，你只需要 require() 它，然后把它添加到 plugins 数组中。多数插件可以通过选项(option)自定义。你也可以在一个配置文件中因为不同目的而多次使用同一个插件，这时需要通过使用 new 操作符来创建它的一个实例。

插件（plugins）是用来拓展 Webpack 功能的，它们会在整个构建过程中生效，执行相关的任务。
loader 和 plugins 常常被弄混，但是他们其实是完全不同的东西，可以这么来说，loader 是在打包构建过程中用来处理源文件的（JSX，Scss，Less..），一次处理一个，插件并不直接操作单个文件，它直接对整个构建过程其作用。

webpack.config.js
```
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 通过 npm 安装
const webpack = require('webpack'); // 用于访问内置插件

const config = {
  module: {
    rules: [
      { test: /\.txt$/, use: 'raw-loader' }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({template: './src/index.html'})
  ]
};

module.exports = config;
```

### Mode

通过将mode参数设置为development，production或none，可以启用webpack的内置优化，这些优化对应于每个环境。

默认值为production。

```
module.exports = {
  mode: 'production'
};
```

或者从 CLI 参数中传递：

```
webpack --mode=production
```

支持以下字符串值：

| 选项 | 描述 |
| ----- | ----- |
| development | 会将 process.env.NODE_ENV 的值设为 development。启用 NamedChunksPlugin 和 NamedModulesPlugin。 |
| production | 会将 process.env.NODE_ENV 的值设为 production。启用 FlagDependencyUsagePlugin, FlagIncludedChunksPlugin, ModuleConcatenationPlugin, NoEmitOnErrorsPlugin, OccurrenceOrderPlugin, SideEffectsFlagPlugin 和 UglifyJsPlugin. |

### Browser Compatibility

webpack支持所有符合ES5标准的浏览器（不支持IE8及以下版本）。 webpack需要Promise和require.ensure。如果要支持旧版浏览器，则需要在使用这些表达式之前加载polyfill。


### 常用 loader

#### 样式

* css-loader : 解析css文件中代码，处理css中路径引用等
* style-loader : 将css模块作为样式导出到DOM中
* less-loader : 加载和转义less文件
* sass-loader : 加载和转义sass/scss文件
* stylus-loader
* postcss-loader : scss再处理
* autoprefixer

css-loader 和 style-loader，二者处理的任务不同，css-loader使你能够使用类似@import 和 url(...)的方法实现 require()的功能,style-loader将所有的计算后的样式加入页面中，二者组合在一起使你能够把样式表嵌入webpack打包后的JS文件中。

Sass 和 Less之类的预处理器是对原生CSS的拓展，它们允许你使用类似于variables, nesting, mixins, inheritance等不存在于CSS中的特性来写CSS，CSS预处理器可以这些特殊类型的语句转化为浏览器可识别的CSS语句，

#### 脚本转换编译

* script-loader : 在全局上下文中执行一次javascript文件，不需要解析
* babel-loader : 加载ES6 代码后使用Babel转义为ES5后浏览器才能解析
* ts-loader : 
* jsx-loader : 
* eslint-loader : 

#### Files文件

* url-loader : 多数用于加载图片资源,超过文件大小显示则返回data URL
* raw-loader : 加载文件原始内容(utf-8格式)，可以用来处理html
* file-loader :
* json-loader : 

#### 加载框架

* vue-loader : 加载和转义vue组件
* react-hot-loader : 动态刷新和转义react组件中修改的部分

### 常用插件

#### config类

* NormalModuleReplacementPlugin 匹配resourceRegExp，替换为newResource
* ContextReplacementPlugin 替换上下文的插件  
* IgnorePlugin 不打包匹配文件
* PrefetchPlugin 预加载的插件，提高性能
* ResolverPlugin 替换上下文的插件
* ContextReplacementPlugin 替换上下文的插件

#### optimize

* DedupePlugin 打包的时候删除重复或者相似的文件
* MinChunkSizePlugin 把多个小模块进行合并，以减少文件的大小
* LimitChunkCountPlugin 限制打包文件的个数
* MinChunkSizePlugin 根据chars大小，如果小于设定的最小值，就合并这些小模块，以减少文件的大小
* OccurrenceOrderPlugin 根据模块调用次数，给模块分配ids，常被调用的ids分配更短的id，使得ids可预测，降低文件大小，该模块推荐使用
* UglifyJsPlugin 压缩js
* ngAnnotatePlugin 使用ng-annotate来管理AngularJS的一些依赖
* CommonsChunkPlugin 多个 html共用一个js文件(chunk)

#### dependency injection

* DefinePlugin 定义变量，一般用于开发环境log或者全局变量
* ProvidePlugin 自动加载模块，当配置（$:'jquery'）例如当使用$时，自动加载 jquery

#### other

* HotModuleReplacementPlugin 模块热替换,如果不在dev-server模式下，需要记录数据，recordPath，生成每个模块的热更新模块
* ProgressPlugin 编译进度
* NoErrorsPlugin 报错但不退出webpack进程
* HtmlWebpackPlugin 生成html

## TODO 一个简单的 webpack 配置

## 参考

* [webpack究竟做了什么](https://segmentfault.com/a/1190000015973544)
* [Webpack是答案吗](http://refined-x.com/2017/06/16/Webpack%E6%98%AF%E7%AD%94%E6%A1%88%E5%90%97/)
* [webpack 常用plugin和loader](https://segmentfault.com/a/1190000005106383)

