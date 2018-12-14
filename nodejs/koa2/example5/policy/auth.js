module.exports = async (ctx, next)=>{
    if(ctx.session.view){
        await next();
    }else{
        ctx.response.body = JSON.stringify({
            status: '-1',
            message: '未登录，无权访问',
            data:""
        })
    }
}