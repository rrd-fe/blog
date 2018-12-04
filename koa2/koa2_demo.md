## 基于koa2的服务端渲染框架

> koa2作为现在比较流行的node端web开发框架，由express的原班人马打造而成，与express相比较更加轻量级和易于学习，为了能够更好地学习koa2及其常见中间件，我们可以尝试去构建一个基于koa2的服务端渲染框架

#### 第一次迭代

我们新建文件夹并初始化项目

> npm init -y

下载koa依赖包

> npm i koa --save

新建index.js文件并创建基于服务端的前台页面和后台管理页面

```
const koa = require('koa');
const app = new koa();

app.use(async(ctx, next)=>{
    if(ctx.request.path === '/index'){
        ctx.response.body = '前台页面'
    }else if(ctx.response.path === '/admin'){
        ctx.response.body = '后台页面'
    }
})

app.listen(8080,()=>{
    console.log('app started at port 8080...');
})
```
启动服务访问http://localhost:8080/index 和 http://localhost:8080/admin；

我们发现这样书写路由即为不方便，一方面路由层次不够清晰，另一方面当路由相同但请求方式不同时候我们还得判断请求方式

#### 第二次迭代

针对上面路由多起来难处理的问题，我们可以安装koa-router来解决路由问题，下载koa-router

> npm i koa-router --save

重新书写项目如下
```
const koa = require('koa');
const app = new koa();
const Router = require('koa-router');
const router = new Router();

router.get('/index', (ctx, next)=>{
    ctx.response.body = '前台页面';
})

router.get('/admin', (ctx, next)=>{
    ctx.response.body = '后台管理'
})

//上传文件接口
router.post('/upload', (ctx, next)=>{
    ctx.response.body = JSON.stringify({
        a: 1,
        b: 2
    })
})

app.use(router.routes());

app.listen(8080,()=>{
    console.log('app started at port 8080...');
})
```

但我们发现项目大起来后，将路由文件放到index.js里面显得比较杂乱，我们可以新建```common/router.js```,将路由迁移到该文件中

此刻的目录结构如下：
```
|-- Project
    |-- index.js
    |-- package-lock.json
    |-- package.json
    |-- common
        |-- router.js
```
此时的index.js中更改后如下

```
const koa = require('koa');
const app = new koa();
const router = require('./common/router');


app.use(router.routes());
app.listen(8080,()=>{
    console.log('app started at port 8080...');
})
```
我们可以进一步把common/router.js中的的路由文件简化，新建controller文件夹，并对router.js文件进行改写，此刻目录结构如下：

```
|-- Project
    |-- index.js
    |-- package-lock.json
    |-- package.json
    |-- common
    |   |-- router.js
    |-- controller
        |-- admin.js
        |-- index.js
```

controller文件夹中新建home.js用来存放前台页面路由，admin.js存放后台页面路由，接口文件内容如下：

admin.js

```
let fn_admin = async (ctx, next)=>{
    ctx.response.body = '后台管理'
}

let fn_login = async (ctx, netx)=>{
    ctx.response.body = '我是登录页面'
}

//上传文件接口
let fn_upload = async (ctx, next)=>{
    ctx.response.body = JSON.stringify({
        a: 1,
        b: 2
    })
}

module.exports = {
    'GET /admin': fn_admin,
    'GET /login': fn_login,
    'POST /upload': fn_upload
}
```

home.js

```
let fn_index = async (ctx, next)=>{
    ctx.response.body = '前台页面';
}

let fn_look = async (ctx, netx)=>{
    ctx.response.body = '查看文件'
}

module.exports = {
    'GET /login': fn_index,
    'GET /look': fn_look
}
```

然后我们通过遍历controller文件夹，收集所有的路由函数，但在做这件事这前我们先把一些常用的路径挂载到global上面，以方便使用，在common/myglobal.js中进行挂载全局变量

目录结构如下：

```
|-- Project
    |-- index.js
    |-- package-lock.json
    |-- package.json
    |-- common
    |   |-- myglobal.js
    |   |-- router.js
    |-- controller
        |-- admin.js
        |-- index.js
```

myglobal.js文件内容如下：

```
const path = require('path');


let myPath = {
    'ROOT_PATH':{
        value: path.resolve(__dirname, '../'),
        writable: false,
    },
    'COMMON_PATH':{
        value: __dirname,
        writable: false,
    },
    'CONTROLLER_PATH':{
        value: path.resolve(__dirname, '../', 'controllers'),
        writable: false,
    },
};
//将常用路径挂载到全局
Object.defineProperties(global,myPath);
```

现在我们重写router.js，对controller文件夹进行遍历获取所有路由文件，挂载到router上面,````fs-extra是fs的扩展包，继承了fs的api并且对异步接口实现了promsie和sync写法``

```
const Router = require('koa-router');
const router = new Router();
const fs = require('fs-extra');


let files = fs.readdirSync(CONTROLLER_PATH);
let js_files = files.filter(e=>{
    return e.endsWith('.js')
});

for(let file of js_files){
    let mapping = require(CONTROLLER_PATH + '/' + file);
    for(let url in mapping){
        let urlArr = url.split(' ');
        switch(urlArr[0]){
            case 'GET':
               router.get(urlArr[1], mapping[url]);
            case 'POST':
               router.post(urlArr[1], mapping[url]);
        }
    }
}

module.exports = router;
```

#### 第三次迭代

作为一个传统的MVC模型，此刻的controller有了，但是还缺少view,也就是服务器端模板引擎，现在流行的模板引擎比较多，例如```koa-view```,```ejs```,```xtemplate```,```jade```,```swig```等等，大家有兴趣的可以去了解下他们的不同之处，选择一款适合项目的，我今天选用```nunjucks```， [点击去学习nunjucks](https://nunjucks.bootcss.com/templating.html#dump-object)

经过对nunjucks的学习，我们先对nunjucks进行安装下载

> npm i nunjucks --save

创建template/index.js，对nunjucks进行初始化配置

```
const nunjucks = require('nunjucks');

let env = new nunjucks.Environment(
        new nunjucks.FileSystemLoader(ROOT_PATH, {
            noCache: true,
            watch: true,
        }), {
            autoescape: true,
            throwOnUndefined: true
        });
module.exports = env;
```

接下来我们在template中新建文件目录和controller保持一致，目录结构如下:

```
|-- Project
    |-- index.js
    |-- package-lock.json
    |-- package.json
    |-- common
    |   |-- myglobal.js
    |   |-- router.js
    |-- controller
    |   |-- admin.js
    |   |-- home.js
    |-- template
        |-- index.js
        |-- admin
        |   |-- index
        |   |   |-- index.css
        |   |   |-- index.html
        |   |   |-- index.js
        |   |-- login
        |       |-- index.css
        |       |-- index.html
        |       |-- index.js
        |-- home
            |-- index
            |   |-- index.css
            |   |-- index.html
            |   |-- index.js
            |-- look
                |-- index.css
                |-- index.html
                |-- index.js
```

同时我们在common下面新建base.html作为其他模板的父模板，并在base.html引入公共的依赖：

```
<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="renderer" content="webkit">
        <meta name="format-detection" content="telephone=no"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>

        {% block header_content %}
            <meta name="keywords" content="">
            <meta name="description" content="">
            <title>{{ title }}</title>
        {% endblock %}

        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="/common/base.css">
        <script src="https://cdn.staticfile.org/react/16.4.0/umd/react.development.js"></script>
        <script src="https://cdn.staticfile.org/react-dom/16.4.0/umd/react-dom.development.js"></script>
        <script src="https://cdn.staticfile.org/babel-standalone/6.26.0/babel.min.js"></script>
        <script src='https://unpkg.com/axios/dist/axios.min.js'></script>
        <!--  输出css 文件  -->
        {% block block_head_css %}

        {% endblock %}

        <!--  输出js 文件  -->
        {% block block_head_js %}

        {% endblock %}

    </head>

    <body>


        <div class="main-content">

            {% block block_body %}
            {% endblock %}

        </div>

    </body>

</html>
```

这里我引入了初始化样式```base.css```和```react.js```,```babel.js```以及类ajax请求包```axios.js```;

然后我们开始在template文件夹下面书写登录页面如下；

```
{% extends 'common/base.html'%}

{% block header_content %}
    <meta name="keywords" content="">
    <meta name="description" content="">
    <title>后台登录页面</title>
{% endblock %}

{% block block_head_css %}

{% endblock %}

{% block block_head_js %}
    
{% endblock %}


{% block block_body %}
   <div>
      <div>
         <div>用户名：<input type="text" id='user'></div>
         <div>密码：<input type="password" id='pwd'></div>
         <div>登录</div>
      </div>
   </div>
{% endblock %}
```

同时对controller/admin文件进行重写

```
const env = require('../template/index');

let fn_admin = async (ctx, next)=>{
    ctx.response.body = '后台管理'
}

let fn_login = async (ctx, netx)=>{
    ctx.response.type = 'text/html';
    ctx.response.body = env.render('template/admin/login/index.html')
}

let fn_upload = async (ctx, next)=>{
    ctx.response.body = JSON.stringify({
        a: 1,
        b: 2
    })
}

module.exports = {
    'GET /admin': fn_admin,
    'GET /login': fn_login,
    'POST /upload': fn_upload
}
```

此刻我们启动项目访问http://localhost:8080/login 页面显示如下

![Alt text](./image/1.jpg)

#### 第四次迭代

此刻我们发现页面奇丑无比，而且也没有逻辑层，即便我们像下面这样引入也无济于事

```
{% block block_head_css %}
<link rel="stylesheet" href="/template/admin/login/index.css">
{% endblock %}

{% block block_head_js %}
<script src='/template/admin/login/index.js'></script>
{% endblock %}
```
同时我们发现父模板引入的base.css报错未找到文件
![Alt text](./image/2.jpg)

很显然是路径不对，此刻我们需要下载安装koa-static用于外部访问静态文件，进行下载安装

> npm i koa-static --save

同时我们引入该中间件

```
const koa = require('koa');
const app = new koa();
require('./common/myglobal');
const koaStatic = require('koa-static');
const router = require('./common/router');


app.use(router.routes());
app.use(koaStatic(ROOT_PATH));
app.listen(8080,()=>{
    console.log('app started at port 8080...');
})
```

继续对我们的登录页面进行完善,由于登录需要后端解析post数据，我们可以引入```koa-body```对数据进行解析，同时引入```koa-session```对登录态做简单处理

```
const koa = require('koa');
const app = new koa();
const session = require('koa-session');
require('./common/myglobal');
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const router = require('./common/router');

app.keys = ['some secret hurr'];
 
const CONFIG = {
  key: 'koa:sess', 
  maxAge: 10000,
  renew: false, 
};

app.use(session(CONFIG, app));
app.use(koaBody({
    multipart: true,
    formidable: {
        maxFileSize: 200*1024*1024    // 设置上传文件大小最大限制，默认2M
    }
}));
app.use(router.routes());
app.use(koaStatic(ROOT_PATH));
app.listen(8080,()=>{
    console.log('app started at port 8080...');
})
```
登录页面需要模板渲染接口以及登录验证接口
```
let fn_login = async (ctx, next)=>{
    ctx.response.type = 'text/html';
    ctx.response.body = env.render('template/admin/login/index.html')
}

let fn_userLogin = async (ctx, next)=>{

    let body = ctx.request.body;
    if(body.name === '15810444596' && body.pwd === 'wangwei123'){
        ctx.session.view = '123';
        ctx.response.body = JSON.stringify({
            status: 0,
            message: 'success',
            data: '登陆成功'
        });
    }else{
        ctx.response.body = JSON.stringify({
            status: -1,
            message: 'fail',
            data: '密码或用户名不对'
        });
    }
   
}
```
在登录成功后我们注入了10s的session;

登录页面如下：

![Alt text](./image/3.jpg)

然后我们书写登录完成需要跳转到的后台管理页面，该页面是一个图片上传的页面，由于本地练手所以没有安装数据库，直接以读写数据的形式储存信息，我们新建static文件夹用于接受上传的图片，同时建立data文件夹用于记录上传的图片，此刻目录结构如下：

```
|-- Project
    |-- index.js
    |-- package-lock.json
    |-- package.json
    |-- common
    |   |-- base.css
    |   |-- base.html
    |   |-- myglobal.js
    |   |-- router.js
    |-- controller
    |   |-- admin.js
    |   |-- home.js
    |-- data
    |   |-- cms.json
    |   |-- img.js
    |-- static
    |-- template
        |-- index.html
        |-- index.js
        |-- admin
        |   |-- index
        |   |   |-- index.css
        |   |   |-- index.html
        |   |   |-- index.js
        |   |-- login
        |       |-- index.css
        |       |-- index.html
        |       |-- index.js
        |-- home
            |-- index
            |   |-- index.css
            |   |-- index.html
            |   |-- index.js
            |-- look
                |-- index.css
                |-- index.html
                |-- index.js
```

书写上传图片页面所需要的上传接口以及文件信息读取接口：

```
let fn_upload = async (ctx, next)=>{
    let filePath = ctx.request.files.file.path;
    let fileName = `${new Date().getTime()}.${ctx.request.files.file.name.split('.')[1]}`;
    let storePath = `${STATIC_PATH}/${fileName}`;
    let responsePath = `/static/${fileName}`
    await fs.copy(filePath,storePath);
    let obj ={
        type: '1',
        name: fileName,
        url: responsePath
    };
    ctx.body = JSON.stringify(obj);
    fs.readFile(DATA_PATH + '/cms.json',(err, data)=>{
        let arr = JSON.parse(data.toString());
        arr.push(obj);
        fs.writeFile(DATA_PATH + '/cms.json',JSON.stringify(arr),(err)=>{
            if(err) throw new Error(err);
        })
    })
}

let fn_getData = async (ctx, next)=>{
    let data = fs.readJSONSync(DATA_PATH + '/cms.json');
    ctx.response.body = data;
}
```
后台文件上传页面如图

![Alt text](./image/4.jpg)

前台页面的书写类似，大家可以直接查看项目；

#### 第五次迭代

我们不难发现，平时有些接口和页面是不能让外部访问到的，有一些东西要在访问接口或者路由前就要处理掉，也就是我们平时增加的policy，比如访问后台登录页面，没有登录态我们要重定向到登录页，需要登录态访问的数据接口，未登录访问我们直接返回404

我们可以利用koa2的回流机制在请求进入前或者回应出去前做一些事情

比如我们做一个简单的游客访问后台上传文件页面的拦截

新建policy/login.js,同时在common/myglobal.js中进行policy的收集，并挂载到全局

```
//收集Policy
function getPolicy(){
   let files = fs.readdirSync(POLICY_PATH);
   let filter_files = files.filter(e=>{
       return e.endsWith('.js');
   })
   
   let policyObj = {};
   filter_files.forEach(e=>{
       policyObj[e] = require(POLICY_PATH+'/'+e)
   })
   return policyObj;
}

//将Policy挂载到全局
Object.defineProperty(global, 'policyObj',{
    value: getPolicy(),
    writable: false
});
```
然后新建common/policy.js用于路由添加拦截以及匹配某个路由需要的拦截进行执行

```
let filter = {
    'GET /upload': 'login.js'
}

module.exports = function(){
    return async(ctx, next)=>{
        let method = ctx.request.method;
        let url = ctx.request.url;
        let str = `${method} ${url}`;
        if(filter[str]){
          await policyObj[filter[str]](ctx, next);
        }else{
            await next();
        }      
    }
}
```

将policy添加到index.js中

```
const koa = require('koa');
const app = new koa();
const session = require('koa-session');
require('./common/myglobal');
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const policy = require('./common/policy');
const router = require('./common/router');

app.keys = ['some secret hurr'];
 
const CONFIG = {
  key: 'koa:sess', 
  maxAge: 10000,
  renew: false, 
};


app.use(policy());
app.use(session(CONFIG, app));
app.use(koaBody({
    multipart: true,
    formidable: {
        maxFileSize: 200*1024*1024    // 设置上传文件大小最大限制，默认2M
    }
}));
app.use(router.routes());
app.use(koaStatic(ROOT_PATH));
app.listen(8080,()=>{
    console.log('app started at port 8080...');
})
```

最终工程的目录结构如下

```
|-- Project
    |-- index.js                     koa挂载中间件以及服务启动
    |-- package-lock.json            依赖包版本锁定
    |-- package.json                 所需依赖
    |-- common                       公用文件夹
    |   |-- base.css                 公共样式
    |   |-- base.html                父模板文件
    |   |-- myglobal.js              全局挂载路径以及收集policy文件
    |   |-- policy.js                路由需要过滤的policy
    |   |-- router.js                装载路由
    |-- controller                   后端接口
    |   |-- admin.js                 后台管理接口
    |   |-- home.js                  前台管理接口
    |-- data                         数据存储
    |   |-- cms.json                 存储上传文件信息
    |   |-- img.js                   look页面渲染所需数据
    |-- policy                       plicy文件夹
    |   |-- auth.js                  用于未登录不可访问的接口拦截
    |   |-- login.js                 用于未登录不可访问页面拦截
    |-- static                       存放静态资源和上传的图片
    |-- template                     前端渲染模板
        |-- index.js                 nunjucks的初始化
        |-- admin                    后台页面模板
        |   |-- index
        |   |   |-- index.css        样式层
        |   |   |-- index.html       结构层
        |   |   |-- index.js         逻辑层
        |   |-- login
        |       |-- index.css
        |       |-- index.html
        |       |-- index.js
        |-- home                     前台页面模板
            |-- index
            |   |-- index.css
            |   |-- index.html
            |   |-- index.js
            |-- look
                |-- index.css
                |-- index.html
                |-- index.js

```

后面我们可以愉快的按需求在policy文件夹书写相应的policy,并且在common/policy.js添加需要过滤的路由

该项目主要用于学习koa2以及其中间件，同时也捎带对服务器端的渲染做了一些拓展，对于部分内容也没有进行太详细的拆分，写的也比较糙，不太会写文章还望大家见谅！！！