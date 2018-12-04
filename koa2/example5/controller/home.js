const env = require('../template/index');
const img = require('../data/img');

let fn_index = async (ctx, next)=>{
    ctx.response.type = 'text/html';
    ctx.response.body = env.render('template/home/index/index.html')
}

let fn_look = async (ctx, next)=>{
    if(ctx.params.pageNo){
        let pageNo = ctx.params.pageNo;
        ctx.response.type = 'text/html';
        ctx.response.body = env.render('template/home/look/index.html',{data:img[pageNo]})
    }  
}

let fn_notfound = async (ctx, next)=>{
    ctx.response.type = 'text/html';
    ctx.response.body = env.render('template/home/notfound/index.html')
}


module.exports = {
    'GET /': fn_index,
    'GET /look/:pageNo': fn_look,
    'GET /notfound':fn_notfound
}