const env = require('../template/index');
const fs = require('fs-extra');

let fn_admin = async (ctx, next)=>{
    ctx.response.body = env.render('template/admin/index/index.html')
}

let fn_login = async (ctx, next)=>{
    ctx.response.type = 'text/html';
    ctx.response.body = env.render('template/admin/login/index.html')
}

let fn_userLogin = async (ctx, next)=>{

    let body = ctx.request.body;
    if(body.name === 'wangwei' && body.pwd === 'wangwei123'){
        ctx.session.view = '123';
        ctx.response.body = JSON.stringify({
            status: 0,
            message: 'success',
            data: '登陆成功'
        });
    }else{
        ctx.response.body = JSON.stringify({
            status: -1,
            message: 'fail',
            data: '密码或用户名不对'
        });
    }
   
}




let fn_upload = async (ctx, next)=>{
    let filePath = ctx.request.files.file.path;
    let fileName = `${new Date().getTime()}.${ctx.request.files.file.name.split('.')[1]}`;
    let storePath = `${STATIC_PATH}/${fileName}`;
    let responsePath = `/static/${fileName}`
    await fs.copy(filePath,storePath);
    let obj ={
        type: '1',
        name: fileName,
        url: responsePath
    };
    ctx.body = JSON.stringify(obj);
    fs.readFile(DATA_PATH + '/cms.json',(err, data)=>{
        let arr = JSON.parse(data.toString());
        arr.push(obj);
        fs.writeFile(DATA_PATH + '/cms.json',JSON.stringify(arr),(err)=>{
            if(err) throw new Error(err);
        })
    })
}

let fn_getData = async (ctx, next)=>{
    let data = fs.readJSONSync(DATA_PATH + '/cms.json');
    ctx.response.body = data;
}

module.exports = {
    'GET /admin': fn_admin,
    'GET /login': fn_login,
    'POST /userLogin': fn_userLogin,
    'POST /upload': fn_upload,
    'GET /getdata': fn_getData,
}