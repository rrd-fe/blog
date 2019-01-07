let fn_index = async (ctx, next)=>{
    ctx.response.body = '前台页面';
}

let fn_look = async (ctx, netx)=>{
    ctx.response.body = '查看文件'
}

module.exports = {
    'GET /index': fn_index,
    'GET /look': fn_look
}