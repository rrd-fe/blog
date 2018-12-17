module.exports = async (ctx, next)=>{
    if(ctx.session.view){
        await next();
    }else{
        ctx.response.redirect('/notfound')
    }
}