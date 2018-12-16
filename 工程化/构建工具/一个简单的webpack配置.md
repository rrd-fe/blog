
为了让你了解程序的整体架构，这里展示一个简单的项目树：

```
├── example.env
├── package.json
├── postcss.config.js
├── src
│   ├── css
│   │   ├── app.pcss
│   │   ├── components
│   │   │   ├── global.pcss
│   │   │   ├── typography.pcss
│   │   │   └── webfonts.pcss
│   │   ├── pages
│   │   │   └── homepage.pcss
│   │   └── vendor.pcss
│   ├── fonts
│   ├── img
│   │   └── favicon-src.png
│   ├── js
│   │   ├── app.js
│   │   └── workbox-catch-handler.js
│   └── vue
│       └── Confetti.vue
├── tailwind.config.js
├── templates
├── webpack.common.js
├── webpack.dev.js
├── webpack.prod.js
├── webpack.settings.js
└── yarn.lock
```


在核心配置文件方法，包括：

* env—— webpack-dev-server特定于开发环境的设置，不需要在git中检查
* webpack.settings.js —— 一个JSON-ish设置文件，我们需要在项目之间编辑的唯一文件
* webpack.common.js —— 相同类型的构建放在统一设置文件
* webpack.dev.js —— 设置本地开发各个构建
* webpack.prod.js —— 设置生产环境各个构建
让我们从修改我们的package.json开始入手：
```
{
    "name": "example-project",
    "version": "1.0.0",
    "description": "Example Project brand website",
    "keywords": [
        "Example",
        "Keywords"
    ],
    "homepage": "https://github.com/example-developer/example-project",
    "bugs": {
        "email": "someone@example-developer.com",
        "url": "https://github.com/example-developer/example-project/issues"
    },
    "license": "SEE LICENSE IN LICENSE.md",
    "author": {
        "name": "Example Developer",
        "email": "someone@example-developer.com",
        "url": "https://example-developer.com"
    },
    "browser": "/web/index.php",
    "repository": {
        "type": "git",
        "url": "git+https://github.com/example-developer/example-project.git"
    },
    "private": true,
```

复制代码这里没什么有趣的东西，只是包含了我们网站的元信息，就像package.json规范中所述。
```
"scripts": {
    "dev": "webpack-dev-server --config webpack.dev.js",
    "build": "webpack --config webpack.prod.js --progress --hide-modules"
},
```

复制代码上述脚本代表了我们为项目提供的两个主要构建步骤：

* dev —— 只要我们修改了项目的代码，启动该配置后，它会使用webpack-dev-server来实现热模块替换（HMR），内存编译以及其他细节处理。
* build —— 当我们进行生产部署时，它会执行所有花哨以及耗时的事情，例如Critical CSS、JavaScript压缩等。

我们只需要在命令行执行以下操作：
如果我们使用的是yarn，输入yarn dev或者yarn build；如果使用的是npm，输入npm run dev或者npm run build。这些是你唯一需要使用的两个命令。
请注意，不仅可以通过--config配置，我们还可以传入单独的配置文件进行配置。这样我们可以将webpack配置分解为单独的逻辑文件，因为与生产环境构建相比，我们将为开发环境的构建做很多不同的事情。

```
"browserslist": {
        "production": [
            "> 1%",
            "last 2 versions",
            "Firefox ESR"
        ],
        "legacyBrowsers": [
            "> 1%",
            "last 2 versions",
            "Firefox ESR"
        ],
        "modernBrowsers": [
            "last 2 Chrome versions",
            "not Chrome < 60",
            "last 2 Safari versions",
            "not Safari < 10.1",
            "last 2 iOS versions",
            "not iOS < 10.3",
            "last 2 Firefox versions",
            "not Firefox < 54",
            "last 2 Edge versions",
            "not Edge < 15"
        ]
    },
```


