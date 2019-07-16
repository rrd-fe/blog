# React Native 自定义下拉刷新组件 PullToRefresh



**针对猴急一些的同学**，可以先在这个 [Expo网站在线运行下demo看看效果](https://snack.expo.io/@sophister/custom-pull-to-refresh-header) 。

完整的代码，在 [Github仓库](https://github.com/sophister/react-native-pull-to-refresh-custom) 。



**下拉刷新**，是一个很常见的交互方式。React-Native(以下简称RN)内置的 `FlatList` 是支持下拉刷新组件的，通过设置 [refreshControl](https://facebook.github.io/react-native/docs/virtualizedlist#refreshcontrol) 属性即可。通常我们不仅仅需要定制下拉组件，还需要在下拉过程中，下拉组件执行一些动画，比如在我们场景下，公司logo会随着下拉的幅度，不同的笔画还是显现出颜色。这就需要我们的下拉组件，知道当前下拉的幅度，以此来计算我们动画执行的进度。显然，RN官方的 `refreshControl`并不能满足我们的需求。

看到有两个已经存在的开源包 [react-native-pull-refresh](https://github.com/NadiKuts/react-native-pull-refresh) 和 [react-native-ptr-control](https://github.com/woowalker/react-native-ptr-control) ，基本都有2年左右历史了，而且我也确实没看懂，为什么要用到 **两个** `ScrollView` 嵌套来实现。

直观上来看，我应该只需要有一个 `ScrollView` 就可以了，我监听下拉距离，重新render自定义的下拉组件。嗯，按照这个思路，尝试撸一个试试。



## 一步步实现自定义下拉



首先，我们提供的是一个容器(命名为 `PullToRefresh` 吧 )，内部是用户通过 `children` 传进来的 `FlatList`，这样也方便用户修改，在需要自定义下拉刷新的场景下，用我们这个容器把已经存在的 `FlatList` 包起来就可以了，改动也挺小。当然，因为是自定义下拉刷新header，肯定还需要用户把自定义的下拉刷新header组件传进来，就命名为 `props.HeaderComponent` 吧，到这一步，我们容器内render出来的DOM结构，大概是这样的：

```javascript
<View>
  <Animated.View><HeaderComponent /></Animated.View>
	<FlatList />
</View>
```

 最外层的 `View` 的展示区域，和用户自己的 `FlatList` 完全一样。那么问题来了，我们的下拉刷新 HeaderComponent 在默认情况下，应该是不可见的，是在用户下拉过程中，逐渐的从上到下进入容器的可视区域。那就默认把 HeaderComponent 绝对定位到容器可视区域的外边吧，可是往上移动多大呢，这就需要用户告诉我们容器一个下拉组件的高度了，`props.headerHeight` ，到这一步，容器渲染出来的样式大概如下：

```javascript
<View>
  <Animated.View style={{position: 'absolute', top: - this.props.headerHeight}}>
    <HeaderComponent />
  </Animated.View>
	<FlatList />
</View>
```

完成了初始的DOM结构样式，接下来容器下拉时机的问题。

首先，什么时候用户下拉，是触发我们容器的下拉操作，而不是内部的 FlatList 的默认下拉呢？这个好像比较直接，当内部的 FlatList 已经下拉到顶部，不能再继续下拉时，用户的下拉动作，就应该触发容器的下拉。那么，我们就需要知道内部的 FlatList 的当前下拉位置，这可以通过 FlatList 的 `onScroll` 属性来获取当前 FlatList 的滚动距离。

什么时机触发容器的下拉确定了，那在容器下拉过程中，我们需要更新哪些组件呢？1) 自定义header组件肯定要更新，将最新的下拉距离传给header组件。2) 如果只是将header组件往下移动，我们的 FlatList 不动，那么自定义header会遮挡住 FlatList 的内容，这不是我们想要的；因此，在容器下拉过程中，内部的 FlatList 位置也需要响应的往下移动。

如果我们用容器的 `state.containerTop` 这个 `Animated.Value` 来保存当前容器下拉的距离，那么目前我们容器render的DOM结果大概如下： 

```javascript
const headerStyle = {
  position: 'absolute',
  left: 0,
  width: '100%',
  top: -this.props.headerHeight,
  transform: [{ translateY: this.state.containerTop }],
};
<View>
  <Animated.View style={[{ flex: 1, transform: [{ translateY: this.state.containerTop }] }]}>
  	<FlatList />
  </Animated.View>
  <Animated.View style={headerStyle}>
  	<HeaderComponent />
  </Animated.View>
</View>
```

这样，基本就完成了容器下拉过程中，自定义header和内部的FlatList同步下拉了。

下拉动作实现了，那下拉到什么位置，可以触发刷新呢？这就需要用户再传递一个触发刷新的下拉距离，就叫 `props.refreshTriggerHeight` 吧，当用户松开时，如果当前下拉距离 >= `props.refreshTriggerHeight` ，就会调用用户传入的刷新函数  `props.onRefresh` 。通常，用户如果下拉的距离比较大，松开手指时触发了刷新动作，这时候会整个组件会先回跳到一个刷新中的位置，这个位置，用户可以通过 `props.refreshingHoldHeight` 来指定。`props.refreshTriggerHeight` 和 `props.refreshingHoldHeight` 都是可选的，如果用户不传，默认为 `props.headerHeight`。



## One More Thing



上面其实还省略了一些工作，最重要的，就是在容器下拉过程中，怎么把下拉距离(下拉进度)传给用户的自定义 HeaderComponent ？上面容器上的 `state.containerTop` 其实就是当前容器下拉距离，只不过这是一个 `Animated.Value` ，我们 **不能** 读取到它当前的值。因此，我在容器上添加了一个 **实例属性** `this.containerTranslateY` 来保存当前容器下拉的距离，我们会监听 `state.containerTop` 值的变化，在回调函数里，修改 `this.containerTranslateY`。

等等！！`containerTranslateY`为什么没有放到容器的 `state` 上呢？不应该是 `this.state.containerTranslateY` 么？？嗯，刚开始我确实是放在 `state` 上的，然后在用户下拉容器过程中，通过在容器上 `setState`，触发容器重新render，然后把 `containerTranslateY` 传递过header。但是，这样通过容器上 `setState` 触发header更新的方式，在我测试中，发现页面会比较卡顿。因此，在用户下拉容器过程中，并**没有**去修改容器的 `state` ，而是通过 **方法调用** 的命令方式，将用户当前下拉距离传给了header组件。这里可能还可以怎么优化一下吧。I'm not sure.

因此，用户的自定义header组件，**必须** 暴露一个实例方法 `setProgress` 来接收容器下拉过程中的一些参数，目前这个方法的签名是这样的：

```javascript
// pullDistance 表示容器下拉的距离；percent 代表下拉的进度,[0, 1]
setProgress({pullDistance, percent}){}
```

完整的 header 组件demo，请参考 [expo上的运行demo](https://snack.expo.io/@sophister/custom-pull-to-refresh-header) 。



## The End



最后，听说，**微交互动画**，使用 [lottie](https://github.com/react-native-community/lottie-react-native) 和 RN 更配哦。

本来想尝试用 AE 做一个公司logo的 `lottie` 动画的，奈何没hold住……

完整的代码在github上：[https://github.com/sophister/react-native-pull-to-refresh-custom](https://github.com/sophister/react-native-pull-to-refresh-custom) 。



## 相关链接



* [React Native PanResponder官方文档](https://facebook.github.io/react-native/docs/panresponder) 
* [PanResponder demo in Navigator](https://snack.expo.io/@spencercarli/basic-javascript-navigator-example) 
* [使用 Animated.event 自动映射ScrollView的滚动位置](https://facebook.github.io/react-native/docs/animated.html#handling-gestures-and-other-events) 
* [lottie-react-native](https://github.com/react-native-community/lottie-react-native) 





​    ——— 时2019年7月14日下午14:07 竣工于帝都望京