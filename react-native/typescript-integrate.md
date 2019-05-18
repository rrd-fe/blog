
# RN 集成 TypeScript方案和问题大全

这篇文章主要讨论 ReactNative 中如何集成 TypeScript，以及我们遇到的一些问题总结。关于为什么要用TypeScript，已经有很多文章分析，这里不就在介绍了。

其实关于如何集成TS，RN官方有一篇[博客](https://facebook.github.io/react-native/blog/2018/05/07/using-typescript-with-react-native)介绍了接入方案，但在参照接入过程中发现针对老工程部分迁移TS、以及新版本RN并不适用。

## 集成方案

目前RN 集成 TypeScript 有两个方案

方案一： 借助第三方编译插件[react-native-typescript-transformer](https://github.com/ds300/react-native-typescript-transformer)

方案二： RN 0.57 版本之后将 babel [升级到了 V7](https://github.com/react-native-community/react-native-releases/blob/master/CHANGELOG.md#changes-existing-functionality-that-is-now-different-4)， Babel 从V7开始支持 TypeScript 编译，详情介绍参考[这里](https://devblogs.microsoft.com/typescript/typescript-and-babel-7/)，但关于babel 内置支持的TypeScript 有以下几个问题需要我们注意：

1. babel 只负责将 TS 代码编译为JS，并没有进行类型校验，这意味着即使我们代码类型写错了也能编译通过，没有任何提示。
2. 有一些 TS 特性babel不支持：

        namespaces
        enums

下面我们详细介绍下不同 RN 版本如何引入TS支持：

### < 0.57版本

我们在上面介绍过，对于 RN 版本低于 0.57 的，只能使用react-native-typescript-transformer, 参考[官方文档](https://github.com/ds300/react-native-typescript-transformer)有很详细的步骤指导。

### > 0.57版本

对于RN版本大于0.57的如果是新项目直接执行下面命令

        react-native init MyAwesomeProject --template typescript

如果是老项目迁移TS，因为新版本使用 babel 编译TS，babel 编译并没有读取tsconfig.json中的配置，具体可以参考[这个issues](https://github.com/babel/babel/issues/9028)，所以我们需要将相关配置转移到 babel.config.js 如下：

        yarn add metro-react-native-babel-preset @babel/plugin-transform-runtime  babel-plugin-module-resolver typescript --dev

        yarn add --dev @types/react @types/react-native --dev

        // babel.config.js
        module.exports = {
            "presets": [
                "module:metro-react-native-babel-preset",
            ],
            "plugins": [
                // 解决TS中的 module 引用问题，下面会详细说明
                ["module-resolver", {
                    "root": ["./src"],
                    "extensions": [".js", ".ts", ".tsx", ".ios.js", ".android.js"]
                }],
                "@babel/plugin-transform-runtime",
            ],
        }

当然我们也可以在大于 0.57 版本中继续使用 react-native-typescript-transformer 方式支持 TS，具体的实现步骤[参考这里](https://github.com/ds300/react-native-typescript-transformer#step-3-configure-the-react-native-packager)。
    

### 其他方案

* https://github.com/callstack/haul

## 常见问题汇总

### React Hook 中使用 TypeScript

https://medium.com/@jrwebdev/react-hooks-in-typescript-88fce7001d0d

### TS中使用绝对路径

TS官方支持在 tsconfig 中使用 --baseUrl、--paths 等参数允许我们使用绝对路径引用其他模块，但我们按照官方配置使用会有如下错误：


        error: bundling failed: Error: Unable to resolve module `page/passport/component/index` from `/Users/wangcheng/work/we/rrd-react-native/src/page/passport/login/component/AccountLoginPage.tsx`: Module `page/passport/component/index` does not exist in the Haste module map

        This might be related to https://github.com/facebook/react-native/issues/4968
        To resolve try the following:
        1. Clear watchman watches: `watchman watch-del-all`.
        2. Delete the `node_modules` folder: `rm -rf node_modules && npm install`.
        3. Reset Metro Bundler cache: `rm -rf /tmp/metro-bundler-cache-*` or `npm start -- --reset-cache`.
        4. Remove haste cache: `rm -rf /tmp/haste-map-react-native-packager-*`.
            at ModuleResolver.resolveDependency (/Users/wangcheng/work/we/rrd-react-native/node_modules/@react-native-community/cli/node_modules/metro/src/node-haste/DependencyGraph/ModuleResolution.js:183:15)
            at ResolutionRequest.resolveDependency (/Users/wangcheng/work/we/rrd-react-native/node_modules/@react-native-community/cli/node_modules/metro/src/node-haste/DependencyGraph/ResolutionRequest.js:52:18)
            at DependencyGraph.resolveDependency (/Users/wangcheng/work/we/rrd-react-native/node_modules/@react-native-community/cli/node_modules/metro/src/node-haste/DependencyGraph.js:283:16)
            at Object.resolve (/Users/wangcheng/work/we/rrd-react-native/node_modules/@react-native-community/cli/node_modules/metro/src/lib/transformHelpers.js:261:42)
            at dependencies.map.result (/Users/wangcheng/work/we/rrd-react-native/node_modules/@react-native-community/cli/node_modules/metro/src/DeltaBundler/traverseDependencies.js:399:31)
            at Array.map (<anonymous>)
            at resolveDependencies (/Users/wangcheng/work/we/rrd-react-native/node_modules/@react-native-community/cli/node_modules/metro/src/DeltaBundler/traverseDependencies.js:396:18)
            at /Users/wangcheng/work/we/rrd-react-native/node_modules/@react-native-community/cli/node_modules/metro/src/DeltaBundler/traverseDependencies.js:269:33
            at Generator.next (<anonymous>)
            at asyncGeneratorStep (/Users/wangcheng/work/we/rrd-react-native/node_modules/@react-native-community/cli/node_modules/metro/src/DeltaBundler/traverseDependencies.js:87:24)

其实原因很简单，之前也有提到过，babel 编译期间并没有读取tsconfig，我们的 --baseUrl、--paths 等并没有生效。在babel中我们怎么使用绝对路径引用模块呢， 使用插件[babel-plugin-module-resolver](https://github.com/tleunen/babel-plugin-module-resolver)。我们参考文档如下配置：

        "plugins": [
            ["module-resolver", {
                "root": ["./src"],
                "extensions": [".js", ".ts", ".tsx", ".ios.js", ".android.js"],
            }],
            "@babel/plugin-transform-runtime",
        ]

遗憾的是按照上面的配置之后，仍然有报错。然后我们在issues里面找到了[相关问题](https://github.com/tleunen/babel-plugin-module-resolver/issues/332)，目前有一个解决方案是在需要作为绝对路径引入的目录增加一个package.json。举个例子：

        // 我们希望如下引用
        import { slider } from 'component/slider';

        // 在component目录增加 package.json
        {
            "name": "component"
        }

至此终于可以在TS中使用绝对路径引入模块了。

### TS 中引入 ESLint

### 关于 TypeScript 中 defaultProps

* class component 的 default props, TS 3.0 以后支持类的静态属性 defaultProps

        interface PageProps {
            foo?: string;
            bar: string;
        }

        export class PageComponent extends React.Component<PageProps, {}> {
            public static defaultProps = {
                foo: "default"
            };

            public render(): JSX.Element {
                return (
                    <span>Hello, { this.props.foo.toUpperCase() }</span>
                );
            }
        }

* function component的 defaultProps， 组件需要是 StatelessComponent

        interface PageProps {
            foo?: string;
            bar: number;
        }

        const PageComponent: StatelessComponent<PageProps> = (props) => {
            return (
                <span>Hello, {props.foo}, {props.bar}</span>
            );
        };

        PageComponent.defaultProps = {
            foo: "default"
        };

### metro & babel

我们在TS配置中涉及到了 metro.config.js、.babelrc、tsconfig等一系列的配置文件，这里简单总结下他们之间的关系。

[metro](https://facebook.github.io/metro/docs/en/concepts)：是 Facebook 开发的一个专门为React Native 提供 JS的 bundler，作用和前端中的webpack类似， 也有人尝试[使用metro作为前端的编译打包工具](https://medium.com/@TbsTimm/using-metro-as-a-web-bundler-32ec18cc751c)。 metro 通过调用 babel 提供将ES6、JSX、TS等编译成 ES5的JS代码。

## 参考文档

[typescript-and-babel-7](https://devblogs.microsoft.com/typescript/typescript-and-babel-7/)
[react-native-typescript-transformer](https://github.com/ds300/react-native-typescript-transformer)
[need react-native-typescript-transformer anymore](https://github.com/ds300/react-native-typescript-transformer/issues/86)
[TypeScript Module resolution](http://www.typescriptlang.org/docs/handbook/module-resolution.html)
[default-property-in-typescript](https://stackoverflow.com/questions/37282159/default-property-value-in-react-component-using-typescript/37282264#37282264)
[metro 简介](https://facebook.github.io/metro/docs/en/concepts)
[Using Metro as a web bundler](https://medium.com/@TbsTimm/using-metro-as-a-web-bundler-32ec18cc751c)
[absolute-paths-for-react-native-typescript](https://medium.com/val-punk/absolute-paths-for-create-react-native-app-expo-typescript-d32942b4b230)