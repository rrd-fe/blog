
# koa2基本用法

> koa是由express的幕后原班人马打造的基于Node.js平台的下一代web开发框架，致力于成为 web 应用和 API 开发领域中的一个更小、更富有表现力、更健壮的基石。

#### koa的优点

- 摒弃了express的callback写法，采用Async新特性，使代码看起来更加优雅简洁；
- 是一个不绑定任何中间件的干干净净的裸框架，如果说express是大而全，那么koa就是小而精；
- 对stream的支持度很高，并且对错误处理更加友好。

#### koa的安装

> Koa 依赖 node v7.6.0 或 ES2015及更高版本和 async 方法支持.

你可以使用自己喜欢的版本管理器快速安装支持的 node 版本：

<font color='green'>nvm install 7</font>

<font color='green'> npm i koa</font>

<font color='green'>node my-koa-app.js</font>

#### koa的基本用法

必修的 hello world 应用:
```
const Koa = require('koa');
const app = new Koa();

app.use(async ctx => {
  ctx.body = 'Hello World';
});

app.listen(3000);
```

Koa 中间件以更传统的方式级联，Koa 调用“下游”，然后控制流回“上游”，接收到请求首先执行1号中间件，遇到next()暂停当前中间件，继续执行2号中间件，2号执行遇到next()暂停执行，执行3号中间件，执行完3号以冒泡的形式回流到上游，依次执行2号和1号未执行完的部分
```
const Koa = require('koa')
const app = new Koa()

//1号
app.use(async(ctx, next)=>{
    ctx.body = `<span>1号→</span>`;
    await next();
    ctx.body += `<span>5号</span>`;
})
//2号
app.use(async(ctx, next)=>{
    ctx.body += `<span>2号→</span>`;
    await next();
    ctx.body += `<span>4号→</span>`;
})
//3号
app.use(async(ctx, next)=>{
    ctx.body += `<span>3号→</span>`;
})

app.listen(8080, ()=>{
    console.log('server is running...')
})
```
执行结果：1号→2号→3号→4号→5号

#### app.listen(...)
这里的 app.listen(port, callback) 方法只是以下方法的语法糖:
```
const http = require('http');
const Koa = require('koa');
const app = new Koa();
http.createServer(app.callback()).listen(port, callback);
```
这意味着您可以将同一个应用程序同时作为 HTTP 和 HTTPS 或多个地址：

```
const Koa = require('koa')
const app = new Koa()
const https = require('https');
const http = require('http');

app.use(async(ctx, next)=>{
    ctx.body = `<h1>Hello World!</h1>`;
})


http.createServer(app.callback()).listen(8080);
http.createServer(app.callback()).listen(8081);
// https.createServer(app.callback()).listen(8080);
```
#### app.callback()
返回适用于 http.createServer() 方法的回调函数来处理请求。你也可以使用此回调函数将 koa 应用程序挂载到 Connect/Express 应用程序中。

```
const express = require('express');
const server = express();
const koa = require('koa');
const app = new koa();

app.use(async(ctx, next)=>{
    ctx.body ='hello world!'
})

server.get('/', app.callback()).listen(8080)
```
#### app.use(function)
将给定的中间件方法添加到此应用程序。[中间件列表：https://github.com/koajs/koa/wiki#middleware](https://github.com/koajs/koa/wiki#middleware)

#### app.keys=

设置签名的 Cookie 密钥。

例如，以下是可以接受的：
```
app.keys = ['im a newer secret', 'i like turtle'];
app.keys = new KeyGrip(['im a newer secret', 'i like turtle'], 'sha256');
```
```
const Koa = require('koa')
const app = new Koa()

app.keys = ['im a newer secret', 'i like turtle'];

app.use(async(ctx, next)=>{
    if(ctx.cookies.get('name')){
        console.log(ctx.cookies.get('name'))
    }else{
        ctx.cookies.set('name', 'tobi', { signed: true });
    }   
    ctx.body = `<h1>Hello World!</h1>`;
}).listen(8080)
```
#### app.context 
context是ctx的原型，可以在其上面挂在一些方法或者属性

例如，要从 ctx 添加对数据库的引用：
```
app.context.db = db();

app.use(async ctx => {
  console.log(ctx.db);
});
```
#### 错误处理
默认情况下将错误通过process.stderr输出到终端，需要自行处理错误，例如打印错误日志，可以添加一个‘error’的事件侦听器
```
app.on('error', err => {
  log.error('server error', err)
});
```
#### context上面挂载的方法和属性

- ```request:```Node的request对象
<table border="1" style='text-align:left'>
  <tr style='text-align:center'>
      <th style='text-align:center;'>API</th>
      <th style='text-align:center;'>作用</th>
   
  </tr>
  <tr>
    <td>request.header/request.headers</td>
    <td>获取请求头部</td>
  </tr>
<tr>
    <td>request.header=/request.headers=</td>
    <td>设置请求标头部</td>
  </tr>
  <tr>
    <td>request.method</td>
    <td>设置方法</td>
  </tr>
   <tr>
    <td>request.length</td>
    <td>以数字返回请求的 Content-Length，或 undefined</td>
  </tr>
    <tr>
    <td>request.url</td>
    <td>获取请求的url</td>
  </tr>
    <tr>
    <td>request.originalUrl</td>
    <td>获取请求的原始url</td>
  </tr>
    <tr>
    <td>request.url=</td>
    <td>设置请求 URL, 对 url 重写有用</td>
  </tr>
     <tr>
    <td>request.origin</td>
    <td>获取URL的来源，包括 protocol 和 host</td>
  </tr>
    <tr>
    <td>request.href</td>
    <td>获取完整的URL，包括 protocol 和 host以及参数</td>
  </tr>
    <tr>
    <td>request.path</td>
    <td>获取请求路径名</td>
  </tr>
   <tr>
    <td>request.path=</td>
    <td>设置请求路径名，并在存在时保留查询字符串</td>
  </tr>
    <tr>
    <td>request.querystring</td>
    <td>根据 ? 获取原始查询字符串</td>
  </tr>
   <tr>
    <td>request.querystring=</td>
    <td>设置原始查询字符串</td>
  </tr>
   <tr>
    <td>request.search</td>
    <td>使用?原始查询字符串</td>
  </tr>
    <tr>
    <td>request.search=</td>
    <td>设置原始查询字符串</td>
  </tr>
  <tr>
    <td>request.host</td>
    <td>获取当前主机{hostname:port}</td>
  </tr>
   <tr>
    <td>request.hostname</td>
    <td>获取主机名</td>
  </tr>
    <tr>
    <td>request.URL</td>
    <td>获取WHATWG解析的URL对象</td>
  </tr>
   <tr>
    <td>request.type</td>
    <td>获取请求的Content-Type</td>
  </tr>
   <tr>
    <td>request.charset</td>
    <td>在存在时获取请求字符集，或者undefined</td>
  </tr>
  <tr>
    <td>request.query</td>
    <td>获取解析的查询字符串对象，没有查询字符串的时候返回空对象</td>
  </tr>
   <tr>
    <td>request.query=</td>
    <td>将查询字符串设置为给定对象</td>
  </tr>
   <tr>
    <td>request.fresh</td>
    <td>检查请求的缓存内容是否没有更改，返回boolean</td>
  </tr>
     <tr>
    <td>request.stale</td>
    <td>检查请求的缓存内容是否被更改，返回boolean</td>
  </tr>
    <tr>
    <td>request.protocol</td>
    <td>返回请求的协议</td>
  </tr>
   <tr>
    <td>request.secure</td>
    <td>通过 ctx.protocol == "https" 来检查请求是否通过 TLS 发出</td>
  </tr>
    <tr>
    <td>request.ip</td>
    <td>请求远程地址</td>
  </tr>
    <tr>
    <td>request.ips</td>
    <td>当 X-Forwarded-For 存在并且 app.proxy 被启用时，这些 ips 的数组被返回，从上游 - >下游排序。 禁用时返回一个空数组</td>
  </tr>
     <tr>
    <td>request.subdomains</td>
    <td>将子域返回为数组</td>
  </tr>
    <tr>
    <td>request.is(types...)</td>
    <td>检查传入请求是否包含 Content-Type 头字段， 并且包含任意的 mime type。如果没有请求主体，返回 null。 如果没有内容类型，或者匹配失败，则返回 false。 反之则返回匹配的 content-type。</td>
  </tr>
    <tr>
    <td>request.accepts(types)</td>
    <td>检查给定的 type(s) 是否可以接受，如果 true，返回最佳匹配，否则为 false。 type 值可能是一个或多个 mime 类型的字符串，如 application/json，扩展名称如 json，或数组 ["json", "html", "text/plain"]。</td>
  </tr>
     <tr>
    <td>request.acceptsEncodings(encodings)</td>
    <td>检查 encodings 是否可以接受，返回最佳匹配为 true，否则为 false。 请注意，您应该将identity 作为编码之一！</td>
  </tr>
    <tr>
    <td>request.acceptsCharsets(charsets)</td>
    <td>检查 charsets 是否可以接受，在 true 时返回最佳匹配，否则为 false。</td>
  </tr>
   <tr>
    <td>request.acceptsLanguages(langs)</td>
    <td>检查 langs 是否可以接受，如果为 true，返回最佳匹配，否则为 false。</td>
  </tr>
    <tr>
    <td>request.idempotent</td>
    <td>检查请求是否是幂等的。</td>
  </tr>
    <tr>
    <td>request.socket</td>
    <td>返回请求套接字</td>
  </tr>
   <tr>
    <td>request.get(field)</td>
    <td>返回请求标头</td>
  </tr>
</table>

- ```response:```Node的reponse对象



<table border="1" style='text-align:left'>
  <tr style='text-align:center'>
      <th style='text-align:center;'>API</th>
      <th style='text-align:center;'>作用</th>
   
  </tr>
  <tr>
    <td>response.header/response.headers</td>
    <td>响应标头对象</td>
  </tr>
<tr>
    <td>response.socket</td>
    <td>请求套接字</td>
  </tr>
  <tr>
    <td>response.status</td>
    <td>获取响应状态</td>
  </tr>
   <tr>
    <td>response.status=</td>
    <td>设置响应状态（响应状态查看附表）</td>
  </tr>
    <tr>
    <td>response.message</td>
    <td>获取响应的状态消息</td>
  </tr>
    <tr>
    <td>response.message=</td>
    <td>将响应的状态消息设置为给定值</td>
  </tr>
    <tr>
    <td>response.length=</td>
    <td>将响应的 Content-Length 设置为给定值</td>
  </tr>
     <tr>
    <td>response.length</td>
    <td>以数字返回响应的 Content-Length</td>
  </tr>
    <tr>
    <td>response.body</td>
    <td>获取响应主体</td>
  </tr>
    <tr>
    <td>response.body=</td>
    <td>将响应主体设置为string/Buffer/Stream/Object||ArrayJSON-字符串化/null无内容响应</td>
  </tr>
   <tr>
    <td>response.get(field)</td>
    <td>不区分大小写获取响应标头字段值 field</td>
  </tr>
    <tr>
    <td>response.set(field,value)</td>
    <td>设置响应头部field到value</td>
  </tr>
   <tr>
    <td>response.append(field, value)</td>
    <td>用值 val 附加额外的标头 field</td>
  </tr>
   <tr>
    <td>response.set(fields)</td>
    <td>用一个对象设置多个响应标头fields</td>
  </tr>
    <tr>
    <td>response.remove(field)</td>
    <td>删除标头 field</td>
  </tr>
  <tr>
    <td>response.type</td>
    <td>获取响应 Content-Type 不含参数 "charset"</td>
  </tr>
   <tr>
    <td>response.type=</td>
    <td>设置响应 Content-Type 通过 mime 字符串或文件扩展名</td>
  </tr>
    <tr>
    <td>response.is(types...)</td>
    <td>非常类似 ctx.request.is(). 检查响应类型是否是所提供的类型之一。这对于创建操纵响应的中间件特别有用</td>
  </tr>
   <tr>
    <td>response.redirect(url, [alt])</td>
    <td>执行 [302] 重定向到 url</td>
  </tr>
   <tr>
    <td>response.attachment([filename])</td>
    <td>将 Content-Disposition 设置为 “附件” 以指示客户端提示下载。(可选)指定下载的 filename。
</td>
  </tr>
  <tr>
    <td>response.headerSent</td>
    <td>检查是否已经发送了一个响应头。 用于查看客户端是否可能会收到错误通知</td>
  </tr>
   <tr>
    <td>response.lastModified</td>
    <td>将 Last-Modified 标头返回为 Date, 如果存在</td>
  </tr>
   <tr>
    <td>response.lastModified=</td>
    <td>将 Last-Modified 标头设置为适当的 UTC 字符串。您可以将其设置为 Date 或日期字符串。</td>
  </tr>
     <tr>
    <td>response.etag=</td>
    <td>设置包含 " 包裹的 ETag 响应， 请注意，没有相应的 response.etag getter</td>
  </tr>
    <tr>
    <td>response.vary(field)</td>
    <td>在 field 上变化</td>
  </tr>
   <tr>
    <td>response.flushHeaders()</td>
    <td>刷新任何设置的标头，并开始主体</td>
  </tr>
</table>

<table border="1" style='text-align:left'>
  <tr style='text-align:center'>
      <th style='text-align:center;' colspan=6>响应状态码</th>
  </tr>
 <tr>
 <td>100</td>
 <td>continue</td>
 <td>307</td>
 <td>temporary redirect</td>
 <td>417</td>
 <td>expectation failed</td>
</tr> <tr>
 <td>101</td>
 <td>switching protocols</td>
 <td>308</td>
 <td>permanent redirect</td>
 <td>418</td>
 <td>I'm a teapot</td>
</tr> <tr>
 <td>102</td>
 <td>processing</td>
 <td>400</td>
 <td>bad request</td>
 <td>422</td>
 <td>unprocessable entity</td>
</tr> <tr>
 <td>200</td>
 <td>ok</td>
 <td>401</td>
 <td>unauthorized</td>
 <td>423</td>
 <td>locked</td>
</tr> <tr>
 <td>201</td>
 <td>created</td>
 <td>402</td>
 <td>payment required</td>
 <td>424</td>
 <td>failed dependency</td>
</tr> <tr>
 <td>202</td>
 <td>accepted</td>
 <td>403</td>
 <td>forbidden</td>
 <td>426</td>
 <td>upgrade required</td>
</tr> <tr>
 <td>203</td>
 <td>non-authoritative information</td>
 <td>404</td>
 <td>not found</td>
 <td>428</td>
 <td>precondition required</td>
</tr> <tr>
 <td>204</td>
 <td>no content</td>
 <td>405</td>
 <td>method not allowed</td>
 <td>429</td>
 <td>too many requests</td>
</tr> <tr>
 <td>205</td>
 <td>reset content</td>
 <td>406</td>
 <td>not acceptable</td>
 <td>431</td>
 <td>request header fields too large</td>
</tr> <tr>
 <td>206</td>
 <td>partial content</td>
 <td>407</td>
 <td>proxy authentication required</td>
 <td>500</td>
 <td>internal server error</td>
</tr> <tr>
 <td>207</td>
 <td>multi-status</td>
 <td>408</td>
 <td>request timeout</td>
 <td>501</td>
 <td>not implemented</td>
</tr> <tr>
 <td>208</td>
 <td>already reported</td>
 <td>409</td>
 <td>conflict</td>
 <td>502</td>
 <td>bad gateway</td>
</tr> <tr>
 <td>226</td>
 <td>im used</td>
 <td>410</td>
 <td>gone</td>
 <td>503</td>
 <td>service unavailable</td>
</tr> <tr>
 <td>300</td>
 <td>multiple choices</td>
 <td>411</td>
 <td>length required</td>
 <td>504</td>
 <td>gateway timeout</td>
</tr> <tr>
 <td>301</td>
 <td>moved permanently</td>
 <td>412</td>
 <td>precondition failed</td>
 <td>505</td>
 <td>http version not supported</td>
</tr> <tr>
 <td>302</td>
 <td>found</td>
 <td>413</td>
 <td>payload too large</td>
 <td>506</td>
 <td>variant also negotiates</td>
</tr> <tr>
 <td>303</td>
 <td>see other</td>
 <td>414</td>
 <td>uri too long</td>
 <td>507</td>
 <td>insufficient storage</td>
</tr> <tr>
 <td>304</td>
 <td>not modified</td>
 <td>415</td>
 <td>unsupported media type</td>
 <td>508</td>
 <td>loop detected</td>
</tr> <tr>
 <td>305</td>
 <td>use proxy</td>
 <td>416</td>
 <td>range not satisfiable</td>
 <td>510</td>
 <td>not extended</td>
</tr>
</tr> <tr>
 <td>511</td>
  <td colspan=5>network authentication required</td>
</tr>
</table>

- ```state:```配置全局变量，ctx.state配置的全局变量我们不仅可以在其他的路由页面使用，我们还可以在全局模板使用.
- ```app:```应用程序实例引用
- ```cookies.get(name, [options]):```用于获取cookie值
- ```cookies.set(name, value, [options]):```设置cookie,下面是options
  - maxAge 一个数字表示从 Date.now() 得到的毫秒数
  - signed cookie 签名值
  - expires cookie 过期的 Date
  - path cookie 路径, 默认是'/'
  - domain cookie 域名
  - secure 安全 cookie
  - httpOnly 服务器可访问 cookie, 默认是 true
  - overwrite 一个布尔值，表示是否覆盖以前设置的同名的 cookie (默认是 false). 如果是 true, 在同一个请求中设置相同名称的所有 Cookie（不管路径或域）是否在设置此Cookie 时从 Set-Cookie 标头中过滤掉。

- ``` throw([status], [msg], [properties]):```用于抛出服务器错误，默认为500
- ```ctx.assert(value, [status], [msg], [properties]):```当 !value 时，Helper 方法抛出类似于 .throw() 的错误。
- ```respond:```为了绕过 Koa 的内置 response 处理，你可以显式设置 ctx.respond = false;。 如果您想要写入原始的 res 对象而不是让 Koa 处理你的 response，请使用此参数。

[学习资料：廖雪峰koa入门](https://www.liaoxuefeng.com/wiki/001434446689867b27157e896e74d51a89c25cc8b43bdb3000/001471087582981d6c0ea265bf241b59a04fa6f61d767f6000)

[官方文档地址：https://koa.bootcss.com](https://koa.bootcss.com/)