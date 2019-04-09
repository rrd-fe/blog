

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

* [规范你的 Git Commit Message](#规范你的-git-commit-message)
	* [Quick Start](#quick-start)
		* [1. 全局安装commitizen & cz-conventional-changelog](#1-全局安装commitizen-cz-conventional-changelog)
		* [2. 项目内安装commitlint & husky](#2-项目内安装commitlint-husky)
		* [3. 配置](#3-配置)
		* [4. 使用](#4-使用)
	* [commit规范在rrd-fe落地使用情况](#commit规范在rrd-fe落地使用情况)
		* [1. type](#1-type)
		* [2. scope](#2-scope)
		* [3. body](#3-body)
		* [4. break changes](#4-break-changes)
		* [5. affect issues](#5-affect-issues)
	* [扩展阅读](#扩展阅读)

<!-- /code_chunk_output -->

# 规范你的 Git Commit Message

## Quick Start

### 1. 全局安装commitizen & cz-conventional-changelog
`commitizen`是一个撰写合格`commit message`的工具，而`cz-conventional-changelog`适配器提供[conventional-changelog](https://github.com/conventional-changelog/conventional-changelog)标准（约定式提交标准）。基于不同需求，也可以使用不同适配器。
```
npm install -g commitizen cz-conventional-changelog
echo '{ "path": "cz-conventional-changelog" }' > ~/.czrc
```
安装完毕后，可直接使用`git cz`来取代`git commit`。

全局模式下，需要 `~/.czrc` 配置文件, 为`commitizen`指定`Adapter`。

### 2. 项目内安装commitlint & husky
`commitlint`负责用于对`commit message`进行格式校验，`husky`负责提供更易用的`git hook`。

`Use npm`
```
npm i -D husky @commitlint/config-conventional @commitlint/cli
```

`Use yarn`
```
yarn add husky @commitlint/config-conventional @commitlint/cli -D
```
### 3. 配置
`创建commitlint.config.js`
```
# In the same path as package.json

echo 'module.exports = {extends: ["@commitlint/config-conventional"]};' > ./commitlint.config.js
```
`引入husky`
```
# package.json

...,
"husky": {
    "hooks": {
      "commit-msg": "commitlint -e $GIT_PARAMS"
    }
}
```
### 4. 使用

执行`git cz`进入interactive模式，根据提示依次填写
```
1.Select the type of change that you're committing 选择改动类型 (<type>)

2.What is the scope of this change (e.g. component or file name)? 填写改动范围 (<scope>)

3.Write a short, imperative tense description of the change: 写一个精简的描述 (<subject>)

4.Provide a longer description of the change: (press enter to skip) 对于改动写一段长描述 (<body>)

5.Are there any breaking changes? (y/n) 是破坏性修改吗？默认n (<footer>)

6.Does this change affect any openreve issues? (y/n) 改动修复了哪个问题？默认n (<footer>)
```

生成的commit message格式如下：
```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

填完后，`husky`会调用`commitlint`对message进行格式校验，规定`type`及`subject`为必填项。

任何`git commit`指令的`option`都能用在 `git cz`指令上, 例如`git cz -a`


## commit规范在rrd-fe落地使用情况

### 1. type

约定了`feat`、`fix`两个`主要type`，以及docs、style、build、refactor、revert五个`特殊type`，其余type暂不使用。
```
# 主要type
feat:     增加新功能
fix:      修复bug

# 特殊type
docs:     只改动了文档相关的内容
style:    不影响代码含义的改动，例如去掉空格、改变缩进、增删分号
build:    构造工具的或者外部依赖的改动，例如webpack，npm
refactor: 代码重构时使用
revert:   执行git revert打印的Message

# 暂不使用type
test:     添加测试或者修改现有测试
perf:     提高性能的改动
ci:       与CI（持续集成服务）有关的改动
chore:    不修改src或者test的其余修改
```

当一次改动包括`主要type`与`特殊type`时，统一采用`主要type`。

### 2. scope

约定scope也为必填项，用于描述改动的范围，格式为项目名/模块名，例如：
`node-pc/common` `rrd-h5/activity`，而`we-sdk`不需指定模块名。
如果修改多个模块，则需拆分成多次commit。

### 3. body

body一般场景不作要求，但是重大需求、更新等必须添加body来作详细描述，主要描述`改动之前的情况`及`修改动机`。

### 4. break changes
涉及break changes的改动必须指明该项，类似接口参数减少、接口删除、迁移等。

### 5. affect issues
需打通jira与gitlab。
参考文档：https://docs.gitlab.com/ee/user/project/integrations/jira.html

## 扩展阅读

[conventional commits](https://www.conventionalcommits.org/zh/v1.0.0-beta.3/) `必读` 介绍约定式提交标准

[Angular标准](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines) `必读` 介绍Angular标准每个部分该写什么、该怎么写。

[@commitlint/config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional#type-enum) `必读` 介绍commitlint的校验规则config-conventional，以及一些常见passes/fails情况。