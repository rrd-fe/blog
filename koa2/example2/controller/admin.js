let fn_admin = async (ctx, next)=>{
    ctx.response.body = '后台管理'
}

let fn_login = async (ctx, netx)=>{
    ctx.response.body = '我是登录页面'
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