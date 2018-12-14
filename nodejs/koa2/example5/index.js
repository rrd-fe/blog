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