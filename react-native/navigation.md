# react-native navigation

## 类库的选择

关于react native 导航的类库非常的多。这里简单列一些都有哪些，已经我们最终的选择和原因。

* [native-navigation](https://github.com/airbnb/native-navigation) ： 由airbnb提供了一个导航方案，随着[airbnb全面放弃使用 react native 方案](https://medium.com/airbnb-engineering/sunsetting-react-native-1868ba28e30a) 这个类库也没有用在维护更新了，直接pass。

* [NavigatorIOS](https://facebook.github.io/react-native/docs/navigatorios)是RN官方团队推出针对iOS平台的导航，不过根据changelog[将会在RN 0.58版本中删除](https://github.com/react-native-community/react-native-releases/blob/master/CHANGELOG.md#the-slimmening-is-happening)，直接pass。

### react-navigation VS react-native-navigation

* native navigation or js navigation ？ 

https://medium.com/@ian.mundy/choosing-a-routing-library-for-react-native-604f97e58729
https://codeburst.io/react-native-navigation-patterns-9c2b6d15ddb3

## react-navigation 存在的问题

### iOS手势返回 ： 

    混合应用的时无法返回到native页面

### 类似iOS手势返回，左上角返回按钮如何处理

### pageResult、pagePause事件 （pageId）

    focus、blur无法满足正常的开发需求， 从RN页面调到 Native页面

### header 和 StatusBar 高度问题

https://juejin.im/post/5c45986be51d4505171c6e81
https://blog.whezh.com/react-native-statusbar/

### 关于 iPhone X适配

    SafeAreaView 

### 如何手动集成react-navigation

    Android 手动安装

    ios pod 安装 https://reactnative.cn/docs/linking-libraries-ios.html

## 参考资料

* [react-navigation-vs-react-native-navigation](https://blog.logrocket.com/react-navigation-vs-react-native-navigation-which-is-right-for-you-3d47c1cd1d63)
* [react-navigation-v1-to-v2](https://shift.infinite.red/upgrading-from-react-navigation-v1-to-v2-312d932329ba)
* [react-navigation-v2-to-v3](https://medium.com/@snakindiaconsultancy/upgrading-from-react-navigation-v2-to-v3-14f931016a6b)
* [react-native-navigation-solutions](https://medium.com/osedea/react-native-navigation-solutions-in-2018-6ff1dd7f6d20)
* [Choosing a Routing Library for React Native](https://medium.com/@ian.mundy/choosing-a-routing-library-for-react-native-604f97e58729)
* [React Native Navigation Patterns](https://codeburst.io/react-native-navigation-patterns-9c2b6d15ddb3)
