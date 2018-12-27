const env = require('../template/index');
const img = require('../data/img');

let fn_index = async (ctx, next)=>{
    ctx.response.body = '前台页面';
}

let fn_look = async (ctx, netx)=>{
    if(ctx.params.pageNo){
        let pageNo = ctx.params.pageNo;
        ctx.response.type = 'text/html';
        ctx.response.body = env.render('template/home/look/index.html',{data:img[pageNo]})
    }  
}

module.exports = {
    'GET /index': fn_index,
    'GET /look/:pageNo': fn_look
}