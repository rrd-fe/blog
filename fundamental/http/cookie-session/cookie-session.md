# cookie 和 session

## cookie

存储在客户端(通常是浏览器)的一坨字符串，可以包含多个 `key-value` 组合，不同的 `key-value` 之间，用 分号(;) 分隔。

### cookie的属性

* value: cookie的值，在JS里通常应该使用 `encodeURIComponent` 之后再存储
* domain: cookie应该被存储在哪个域名下
* path: cookie存储在对应的 `path` 下
* Expires: 过期日期
* Max-Age: 存活时间，多少秒
* httpOnly: **不能** 被 `document.cookie` 访问到
* secure: 只在 `https` 下传输
* SameSite:


### session cookie

`session cookie`不是 `session`，还是 `cookie`，指的是 **没有** 设置过期时间的 `cookie`，MDN描述如下：

>The maximum lifetime of the cookie as an HTTP-date timestamp. See Date for the detailed format. If not specified, the cookie will have the lifetime of a session cookie. A session is finished when the client is shut down meaning that session cookies will get removed at that point. However, many web browsers have a feature called session restore that will save all your tabs and have them come back next time you use the browser. Cookies will also be present and it's like you had never actually closed the browser.


### signed cookie

`express` 和 `koa` 里默认使用 `cookie` 第三方库，有一个签名的功能，在设置cookie的时候，可以指定该cookie是否需要签名。防止恶意用户伪造、篡改cookie的值。

###　浏览器发送规则

浏览器在请求某个服务时，会遍历在该服务下，存储的所有cookie，找到 **满足条件** 的cookie，添加到本次请求的 `requst header`里。匹配条件，就是根据每个cookie，在被设置时，指定的一系列属性。比如 `domain` 会判断本次请求的域名是否 **从属于** cookie指定的域名；`path` 会判断本次请求的 path，是否 **从属于** cookie指定的path；`secure`，判断本次请求是否是 `https`；`SameSite`，TODO……

可以看到，每次浏览器发起请求时，都会带上满足条件的所有cookie，因此，也就有下面这个问题：

### 静态资源独立域名

一些大公司，会把 **静态资源** 使用的域名，独立出来，不和业务服务使用同一个域名。由于业务通常会在域名下，写入比较多的各种cookie，比如session、比如登录态相关、比如跟踪用户、统计页面PV/UV，这就导致，在一次请求体重，cookie就占据了很大一部分数据量，影响服务整体响应时间。针对静态资源来讲，一般用不上这些cookie，大部分情况是，下 **强缓存** 在CDN，因此，为了进一步提升静态资源加载速度，会单独把静态资源使用的域名拆出来，甚至 一级域名 也和主业务 **不同**，比如 百度主业务使用 `www.baidu.com`，但是百度引用的静态资源，使用的是 `ss1.bdstatic.com` 域名，连一级域名都不同，大部分场景下，应该能干掉所有的cookie。


## session

存储在 **服务器** 上的一坨东西，可以是任何格式。一个session，指一个会话，通常指一个浏览器内，用户在某个系统上，存储的一些信息。session是和具体的client关联的，因此，服务端需要依赖client请求中，传到服务端的某个key，来匹配上对应的session。在web里，通常会使用 cookie 来匹配对应的session。

session通常情况下，会设置一个过期时间，这个是在服务端session的过期时间，通常情况下，这个过期时间，也就是该session对应的cookie过期时间。

### session 存储

存储位置：session是服务端存储的一坨东西，那就需要有一个地方来存储session，比如 进程的内存、磁盘的文件、数据库(redis)等。

由于现在后端服务，一般都采用分布式部署，会部署在多台机器，多个进程，为了保持session一致性，通常会把session保存在外部的公共存储中，比如 `redis`。

存储格式：session可以存储为任意格式，比如 `node.js`里，通常会使用 `JSON` 格式来存储；在 `java` 里，之前看是用的别的格式。

### 登录态

通常，用户登录态会保存在session中，比如，简单的做法，将当前登录用户的用户ID，保存在session里。在每一次接收到请求时，先查询redis里的session值，然后判断session中是否有用户ID，有就认为当前用户已登录，可以根据用户ID，去数据库、后端服务等地方，查询详细的用户信息。


## 总结

类别|cookie|session
:--|:--|:--
存储位置|客户端(浏览器)|服务端
存储格式|有相应的规范|没有具体限制
安全性|暴露到了客户端，不应该存储敏感数据|可以存放敏感数据
大小限制|各浏览器一般有4K的大小限制?|无限制，但会消耗服务端存储资源


## 相关资料

* [MDN Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
* [Cookie 维基百科](https://zh.wikipedia.org/wiki/Cookie)
* [rfc6265](https://tools.ietf.org/html/rfc6265)
