let filter = {
    'GET /admin': 'login.js',
    'GET /getdata': 'auth.js',
    'POST /upload': 'auth.js'
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