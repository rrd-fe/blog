
# React Native Text Input踩过的一些坑

* autofocus

        问题 ： input autofocus 会导致ios 在进入页面的时候键盘闪一下或者还没有进入页面键盘就出来了
        解决 ： 目前只能setTimeout 延迟设置autofocus
        issues ： https://github.com/wix/react-native-navigation/issues/2622


* 关于Input的一些体验优化

https://reactnative.cn/docs/improvingux/#configure-text-inputs

https://medium.com/react-native-training/todays-react-native-tip-keyboard-issues-in-scrollview-8cfbeb92995b

