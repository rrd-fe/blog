## 背景

在[上一篇](./motion-event.md)文章中，我们使用Animated.event和useNativeDriver，实现了顺滑的图片滑动效果。
但是之前的实现方式有一点不太好，就是需要在render中写一个无用的AnimatedMotionView，来实现Animated.event和Animated.Value的连接。那么有没有方法去掉这个无用的view，像一个RN的module一样使用我们的组件呢？

## 调研

Animated.event做的事情就是将event和Animated.Value关联起来，那么具体是如何实现的呢？

首先我们看一下`node_modules/react-native/Libraries/Animated/src/AnimatedImplementation.js`中`createAnimatedComponent`的实现，里面调用到`attachNativeEvent`这个函数，然后调用到native:
```
NativeAnimatedAPI.addAnimatedEventToView(viewTag, eventName, mapping);
```
我们看看native代码中这个函数是怎么实现的：
```
- (void)addAnimatedEventToView:(nonnull NSNumber *)viewTag
                     eventName:(nonnull NSString *)eventName
                  eventMapping:(NSDictionary<NSString *, id> *)eventMapping
{
  NSNumber *nodeTag = [RCTConvert NSNumber:eventMapping[@"animatedValueTag"]];
  RCTAnimatedNode *node = _animationNodes[nodeTag];
......
  NSArray<NSString *> *eventPath = [RCTConvert NSStringArray:eventMapping[@"nativeEventPath"]];

  RCTEventAnimation *driver =
    [[RCTEventAnimation alloc] initWithEventPath:eventPath valueNode:(RCTValueAnimatedNode *)node];

  NSString *key = [NSString stringWithFormat:@"%@%@", viewTag, eventName];
  if (_eventDrivers[key] != nil) {
    [_eventDrivers[key] addObject:driver];
  } else {
    NSMutableArray<RCTEventAnimation *> *drivers = [NSMutableArray new];
    [drivers addObject:driver];
    _eventDrivers[key] = drivers;
  }
}
```
eventMapping中的信息最终构造出一个eventDriver，这个driver最终会在我们native构造的RCTEvent调用sendEvent的时候调用到：
```
- (void)handleAnimatedEvent:(id<RCTEvent>)event
{
  if (_eventDrivers.count == 0) {
    return;
  }

  NSString *key = [NSString stringWithFormat:@"%@%@", event.viewTag, event.eventName];
  NSMutableArray<RCTEventAnimation *> *driversForKey = _eventDrivers[key];
  if (driversForKey) {
    for (RCTEventAnimation *driver in driversForKey) {
      [driver updateWithEvent:event];
    }

    [self updateAnimations];
  }
}
```

等等，那么那个viewTag和eventName的作用，就是连接起来变成了一个key？What?

![黑人问号脸](./images/hrwhl.jpeg)

这个标识RN中的view的viewTag最后只是变成一个唯一字符串而已，那么我们是不是可以不需要这个view，只需要一个唯一的viewTag就可以了呢？

顺着这个思路，我们再看看生成这个唯一的viewTag。我们看一下JS加载UIView的代码
```
mountComponent: function(
  transaction,
  hostParent,
  hostContainerInfo,
  context,
) {
  var tag = ReactNativeTagHandles.allocateTag();

  this._rootNodeID = tag;
  this._hostParent = hostParent;
  this._hostContainerInfo = hostContainerInfo;
...
  UIManager.createView(
    tag,
    this.viewConfig.uiViewClassName,
    nativeTopRootTag,
    updatePayload,
  );
...
  return tag;
}
```
我们可以使用ReactNativeTagHandles的allocateTag方法来生成这个viewTag。

到此为止，我们就可以使用AnimatedImplementation中的attachNativeEvent方法来连接Animated.event和Animated.Value了，不必需要在render的时候添加一个无用的view。


## Reference

[https://facebook.github.io/react-native/blog/2017/02/14/using-native-driver-for-animated](https://facebook.github.io/react-native/blog/2017/02/14/using-native-driver-for-animated)

[https://www.raizlabs.com/dev/2018/03/react-native-animations-part1/](https://www.raizlabs.com/dev/2018/03/react-native-animations-part1/)

[https://www.jianshu.com/p/7aa301632e4c](https://www.jianshu.com/p/7aa301632e4c)