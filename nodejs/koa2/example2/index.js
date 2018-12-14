const koa = require('koa');
const app = new koa();
require('./common/myglobal');

const router = require('./common/router');


app.use(router.routes());
app.listen(8080,()=>{
    console.log('app started at port 8080...');
})