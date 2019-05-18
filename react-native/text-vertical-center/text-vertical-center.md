# Text 垂直居中问题

最近发现 `React Native` (以下称RN)里，`<Text>` 的 **文字垂直居中** ，有很多小问题，有必要总结一下。

提前说明下，这里使用的 RN 版本是： **0.57**

提前说明下，这里使用的 RN 版本是： **0.57**

提前说明下，这里使用的 RN 版本是： **0.57**

通常在 `web/html/css` 开发中，**单行文字** 垂直居中，一般都可以通过 `height == lineHeight` 来实现。但是在 RN 里，出来的效果连差强人意都还差点，明显的上下间距不同，更别说 `Text` 嵌套的居中了。

## Text 能否作为flex容器

在搜索 `Text` 垂直居中的过程中，发现有些文章里，在 `Text` 上使用了 `justifyContent: center` 这样的属性。这个属性应该是用在 **flex容器** 上面的，所以在demo里，测试了下 `Text` 能否通过 `display: flex` 升级为 flex容器。实验证明，`Text` 不能作为 flex容器，因此，使用 `justifyContent` 应该也是没有作用的。

## Text fontFamily是否支持多个值

`Text`的字体 `fontFamily`，也和 `web` 上有较大区别。`web`上可以在`css`中给`fontFamily`设置多个值，包括各种备选方案；但是在 `RN`里，`fontFamily` **只支持一个值** ，不能设置多个！

## Text支持的style

通过官方文档[text#style](https://facebook.github.io/react-native/docs/text#style)，有几个样式会涉及到文本的垂直居中：`lineHeight` `includeFontPadding` `textAlignVertical`。其中，`includeFontPadding` 和 `textAlignVertical` 只支持 `android` 系统。

`android`系统支持的 `includeFontPadding`和`textAlignVertical`，如果`Text`上设置了`lineHeight`，那么前面两个样式将不生效！

## 单行文字垂直居中

单行文字垂直居中，应该是最简单的情况。比如 `height: 26, fontSize: 20`，来测试各种样式的组合情况。

具体测试demo，在这个expo上：[https://snack.expo.io/@rrdfe/text-vertical-center-case](https://snack.expo.io/@rrdfe/text-vertical-center-case)

直接和`web`一样，通过 `height == lineHeight` 来垂直居中，`android`下文字会 **偏下**，`ios`上，文字会 **偏上** 。

根据测试demo，目前要实现比较理想的效果，基本只能用 `View`嵌套`Text`，通过 `flex` 布局来垂直居中，比如这样写：

```javascript
const styles = {
    con: {
        height: 26,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    text: {
        fontSize: 20,
        //不写下面两个，Android系统上文字会偏下
        includeFontPadding: false,
        textAlignVertical: 'center',    
    }
};

//later in render
<View style={styles.con}>
    <Text style={styles.text}>文字内容</Text>
</View>
```

## 多行文字垂直居中

根据上述demo，多行文字也是用 `View` 嵌套 `Text` 来居中布局。

## 多个相邻Text垂直居中

同样通过 `View` 嵌套多个 `Text`，是用 `flex` 来垂直对齐。

## Text 嵌套垂直居中

在 **Text嵌套** 的情况下，要在单行内，让所有文本垂直居中，没找到方法实现……目前看来，如果要在 `Text` 嵌套的情况下，实现垂直居中，需要拆成上面的多个相邻`Text`元素来实现居中对齐了……

## Text Image 垂直居中

经常有需要，在一个高度内，文字旁边有个小icon，需要垂直居中对齐，也是通过 `View`包含 `Text` 和 `Image` 来实现的。

## 相关链接

* [RN Text fontFamily只支持一个值](https://github.com/facebook/react-native-website/issues/800)
