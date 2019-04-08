
# 规范你的 Git Commit Message

## Quick Start

### 1. 全局安装commitizen & cz-conventional-changelog
`commitizen`是一个撰写合格`commit message`的工具，而`cz-conventional-changelog`适配器提供[conventional-changelog](https://github.com/conventional-changelog/conventional-changelog)标准（Angular标准）。基于不同需求，也可以使用不同适配器。
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

## 扩展阅读

[Angular规范](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines) `必读` 介绍Angular规范每个部分该写什么、该怎么写。

[@commitlint/config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional#type-enum) `必读` 介绍commitlint的校验规则，以及一些常见passes/fails情况。
