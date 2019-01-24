
# React Native Text Input踩过的一些坑

* autofocus

        问题 ： input autofocus 会导致ios 在进入页面的时候键盘闪一下或者还没有进入页面键盘就出来了
        解决 ： 目前只能setTimeout 延迟设置autofocus
        issues ： https://github.com/wix/react-native-navigation/issues/2622