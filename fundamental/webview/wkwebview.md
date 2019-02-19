### WKWebview

#### UIWebview和WKWebview的区别
iOS存在的h5容器主要包括UIWebView和WKWebView，两者支持的版本不同，WKWebView只适用iOS8以上的系统。

> UIWebView的优缺点

1. UIWebView由于系统本身存在的问题可能导致内存泄漏；
2. UIWebView支持缓存和NSURLProtocol 拦截;
3. 用UIWebView加载大数据资源时，内存峰值、内存都会暴增，同时CPU电量消耗也较高。

> WKWebView的优缺点

1. WKWebView网页加载速度有提升，更快（占用内存可能只有 UIWebView 的1/3~1/4)；
2. 提供加载网页进度的属性;
3. 没有缓存，对UIWebViewDelegate中的方法拆分的更为细致了，如果对于缓存不是很高的页面，可以采用WKWebView，能够有更好的用户体验;
4. WKWebView不支持缓存和NSURLProtocol 拦截;
5. 拥有高达60FPS滚动刷新率及内置手势;
6. 高效的app和web信息交换通道。


#### 能否解决升级风险(有哪些问题)
**最主要的问题**
1. wkwebview没法携带Cookie
2. 全局拦截缓存问题


*以下是几篇具有代表性的文章*
参考资料：
[WKWebView 和 Cookie 的那些坑](https://zhuanlan.zhihu.com/p/31382581)
[WKWebView 不支持 NSURLProtocol 吗](https://www.jianshu.com/p/55f5ac1ab817)
[WKWebView 那些坑](https://zhuanlan.zhihu.com/p/24990222)