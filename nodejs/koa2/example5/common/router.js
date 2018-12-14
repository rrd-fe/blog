const Router = require('koa-router');
const router = new Router();
const fs = require('fs-extra');


let files = fs.readdirSync(CONTROLLER_PATH);
let js_files = files.filter(e=>{
    return e.endsWith('.js')
});

for(let file of js_files){
    let mapping = require(CONTROLLER_PATH + '/' + file);
    for(let url in mapping){
        let urlArr = url.split(' ');
        switch(urlArr[0]){
            case 'GET':
               router.get(urlArr[1], mapping[url]);
            case 'POST':
               router.post(urlArr[1], mapping[url]);
        }
    }
}

module.exports = router;