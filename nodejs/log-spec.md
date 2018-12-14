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

只使用 `FATAL`、`ERROR`、`WARN`、`INFO` 和 `DEBUG` 等级。

>* FATAL - 导致程序退出的严重系统级错误，不可恢复，当错误发生时，系统管理员需要立即介入，一般应用代码 **不** 使用。
>* ERROR - 运行时异常以及预期之外的错误，也需要立即处理，但紧急程度低于FATAL,当错误发生时，影响了程序的正确执行。需要注意的是这两种级别属于服务自己的错误，需要管理员介入，**用户输入出错不属于此分类**，请求后端、读文件、数据库等超时、返回错误结构，属于ERROR
>* WARN - 预期之外的运行时状况，表示系统可能出现问题。对于那些目前还不是错误，然而不及时处理也会变成错误的情况，也可以记为WARN，如磁盘过低。
>* INFO - 有意义的事件信息，记录程序正常的运行状态，比如收到请求，成功执行。通过查看INFO,可以快速定位WARN，ERROR, FATAL。INFO不宜过多，通常情况下不超过 DEBUG 的10%。
>* DEBUG - 与程序运行时的流程相关的详细信息以及当前变量状态。

### 日志格式/字段

日志格式统一采用 **JSON** ，便于 `ELK` 解析处理。

日志中的各个字段的值，都应该尽量使用 **英文** ，不使用中文。

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
    //事件类型：在 visit 的日志类型下，还会细分不同的事件，比如 client-req、client-res、 普通trace、请求后端service-start, service-end, service-err等。
    event: "trace",
    //客户端ID，追踪用户、设备会话。在web端，可以是长期的cookie；在APP端，可以是device-id等
    did: "",
    //本次请求的惟一ID，串联本次请求的所有相关日志
    req_id: "some-uuid-for-request",
    //本次请求的用户ID
    uid: "",
    //本次请求的客户端相关数据，通过  ctx.logger 打日志时，自动加上
    d: {
        url: "/some/path?include-query",
        //客户端ip
        ip: "10.138.10.1",
        //客户端的 userAgent
        ua: ""
    },

    //ERROR 级别日志，最好包含error相关信息，比如请求后端相关参数等
    err: {
        msg: "",
        stack: ""
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

### 什么时候打日志

开发者目前只关心 `visit` 类型的日志，即和某一次http请求相关联的日志。`desc`和`stat`类型的日志，统一由开发框架封装后实现，业务开发 **不用** 关心。下面讲的，都是针对 `visit` 类型的日志。

一次http请求，会打出一系列相关联的日志。在node层，通常一次请求，会进一步转发给N个后端服务，然后对后端数据进行一些处理、合并等操作，最后渲染页面或是输出JSON。因此，一次请求相关的日志，大体分为以下几种 `event`：

* `client-req`: client请求到达node层，统一由框架打日志，开发 **不** 关心
* `service-start`: node对某个后端服务发起请求，由通用请求库负责打日志，开发 **不** 关心
* `service-end`: node请求某个后端服务结束，由通用请求库负责打日志，开发 **不** 关心
* `service-err`: node请求后端服务异常，由通用请求库负责打日志，开发 **不** 关心
* `trace`: node中业务层打的日志，如果异常，能帮助定位本次请求相关问题
* `client-res`: 结束client的请求，打印本次请求的http code，本次请求处理时间等，由框架统一打，开发 **不** 关心

开发同学在打日志时，应该谨慎的选择级别，`INFO`(含)级别以上，都应该能对定位问题、具体业务统计需求有要求，才能使用。大部分情况下，可以使用 `DEBUG` 级别，线上 **不会** 开启`DEBUG`级别。

### 具体方法调用

针对打印 `visit`类型的日志，调用 `ctx.logger`(基于`Koa`的框架) 属性打日志，推荐参数都传递 `JSON`，具体方法如下：

```javascript
ctx.logger.debug({ msg: "", "a": "value", "k2": "v2"});
ctx.logger.info({msg: "xxx", anotherField: ""});
ctx.logger.warn({msg: "xxx", field1: "", field2: "v2"});
//ERROR级别日志，必须提供两个参数，第一个是 Error 对象，第二个参数是相关的其他字段
ctx.logger.error(err, { arg1: "value1", arg2: "value2"});
```

注意，基础数据中的`msg`字段，**禁止** 包含具体的上下文数据，和该日志相关的上下文数据，应该放在单独的字段中。比如，某个用户登录接口，希望统计调用次数，可以这样打印:

```javascript
ctx.logger.info({msg: "user login", mobile: "13612344321"});
```


## 参考资料

* [最佳日志实践（v2.0）](https://zhuanlan.zhihu.com/p/27363484)
* [Node 框架接入 ELK 实践总结](https://cloud.tencent.com/developer/article/1363118)
* [大搜车NodeJS日志规范化与分析监控](http://f2e.souche.com/blog/ri-zhi-gui-fan-hua-yu-fen-xi-jian-kong/)
* [请自查！这些优秀日志实践准则，你做到了几点？](https://dbaplus.cn/news-134-1658-1.html)
* [日志最佳实践](http://angelo-chan.github.io/2016/01/05/%E6%97%A5%E5%BF%97%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/)
* [When to use the different log levels](https://stackoverflow.com/questions/2031163/when-to-use-the-different-log-levels)
* [Java 日志管理最佳实践](https://www.ibm.com/developerworks/cn/java/j-lo-practicelog/index.html)
* [关于日志打印的几点建议以及非最佳实践](https://cloud.tencent.com/developer/article/1017043)
* [日志记录最佳实践](https://blog.csdn.net/xichenguan/article/details/46349063)
