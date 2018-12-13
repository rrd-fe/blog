# nodejs 日志规范


## 问题

* node日志不规范，打日志太随意
* 没有良好的日志格式、约定的字段，在ELK里不能很好的解析&检索
* 由于node对接的后端服务化，调用链不清晰，定位问题困难
* 数据部门对node日志的使用，没有明确的记录。node修改了日志，导致统计数据异常


## 目标

* 规范日志打印字段&格式，便于ELK检索
* 增强node上下游(nginx/后端)日志格式，加入惟一requestId，方便微服务下定位问题
* 统计应用运行情况，性能数据
* 维护数据部门对node日志的使用情况


## 实现方案

### 日志类型

参考一些日志的最佳实践，目前将node日志分为如下几种类型：

* `desc`: 系统启动、运行过程中，打的日志，表明系统的一些启动日志、启动参数等，也包含在 不能 捕获到http上下文的时候，打的日志
* `stat`: 系统性能统计日志，应用会定时收集一些性能信息，便于查询应用当前状态
* `visit`: 每个http请求相关的日志，会包含惟一的 requestId，定位该请求相关的所有日志


### 日志级别

只使用 FATAL、ERROR、WARN、INFO 和 DEBUG 等级。

* FATAL - 导致程序退出的严重系统级错误，不可恢复，当错误发生时，系统管理员需要立即介入，一般应用代码 **不** 使用。
* ERROR - 运行时异常以及预期之外的错误，也需要立即处理，但紧急程度低于FATAL,当错误发生时，影响了程序的正确执行。需要注意的是这两种级别属于服务自己的错误，需要管理员介入，**用户输入出错不属于此分类**，请求后端、读文件、数据库等超时、返回错误结构，属于ERROR
* WARN - 预期之外的运行时状况，表示系统可能出现问题。对于那些目前还不是错误，然而不及时处理也会变成错误的情况，也可以记为WARN，如磁盘过低。
* INFO - 有意义的事件信息，记录程序正常的运行状态，比如收到请求，成功执行。通过查看INFO,可以快速定位WARN，ERROR, FATAL。INFO不宜过多，通常情况下不超过 DEBUG 的10%。
* DEBUG - 与程序运行时的流程相关的详细信息以及当前变量状态。

### 日志格式/字段

日志格式统一采用 **JSON** ，便于 `ELK` 解析处理。

日志具体字段，分为 基础数据 + 扩展数据。基础数据，是底层日志框架自带的，所有日志都会包含。扩展数据，不同类型的日志，包含不同的字段。

#### 日志基础数据

目前使用的 `node-bunyan` 日志库，[官方文档](https://github.com/trentm/node-bunyan#core-fields)，基础字段包含如下：

* v: integer 。bunyan的日志版本号
* level: integer。日志级别对应的数字
* name: string。服务名
* hostname: string。主机名
* pid: integer。进程号
* time: string。**UTC** 格式的日期
* msg: string。日志主体信息

#### 日志扩展数据

下面定义的各个数据类型的扩展数据，**不是** 全部的字段，仅包含该日志类型下，必需的字段。这些必需的扩展字段，需要在 `ELK` 中建立索引，方便定位各种问题。

1. `desc`类型日志，扩展字段：TODO
2. `stat`类型日志，扩展字段：TODO
3. `visit`类型日志，扩展字段：

```javascript
{
    /////////////  基础数据  ////////
    v: 1,
    level: 20,
    ///////////// 扩展字段  ////////
    // 标志日志类型
    scope: "visit",
    //事件类型：在 visit 的日志类型下，还会细分不同的事件，比如 普通info、请求后端service等。目前先只用 info ，请求后端日志暂时不打
    event: "info",
    //客户端ID，追踪用户、设备会话。在web端，可以是长期的cookie；在APP端，可以是device-id等
    did: "",
    //本次请求的惟一ID，串联本次请求的所有相关日志
    req_id: "some-uuid-for-request",
    //本次请求的用户ID
    uid: "",
    //本次请求的客户端相关数据
    d: {
        url: "/some/path?include-query",
        //客户端ip
        ip: "10.138.10.1",
        //客户端的 userAgent
        ua: ""
    },

    //调用后端服务相关参数和响应
    service_req: {
        host: "",
        path: "",
        payload: {}
    },
    service_res: {
        //http状态码
        http_code: 200,
        //响应时间
        tm: 100,
        //响应的body
        body: "",
        //异常信息
        err: ""
    }
}
```


## 参考资料

* [最佳日志实践（v2.0）](https://zhuanlan.zhihu.com/p/27363484)
* [Node 框架接入 ELK 实践总结](https://cloud.tencent.com/developer/article/1363118)
* [请自查！这些优秀日志实践准则，你做到了几点？](https://dbaplus.cn/news-134-1658-1.html)
* [日志最佳实践](http://angelo-chan.github.io/2016/01/05/%E6%97%A5%E5%BF%97%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/)
* [When to use the different log levels](https://stackoverflow.com/questions/2031163/when-to-use-the-different-log-levels)
* [Java 日志管理最佳实践](https://www.ibm.com/developerworks/cn/java/j-lo-practicelog/index.html)
* [关于日志打印的几点建议以及非最佳实践](https://cloud.tencent.com/developer/article/1017043)
* [日志记录最佳实践](https://blog.csdn.net/xichenguan/article/details/46349063)
