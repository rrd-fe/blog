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