const path = require('path');
const fs = require('fs-extra');

let myPath = {
    'ROOT_PATH':{
        value: path.resolve(__dirname, '../'),
        writable: false,
    },
    'COMMON_PATH':{
        value: __dirname,
        writable: false,
    },
    'CONTROLLER_PATH':{
        value: path.resolve(__dirname, '../', 'controller'),
        writable: false,
    },
    'TEMPLATE_PATH':{
        value: path.resolve(__dirname, '../', 'template'),
        writable: false,
    },
    'STATIC_PATH':{
        value: path.resolve(__dirname, '../', 'static'),
        writable: false
    },
    'DATA_PATH':{
        value: path.resolve(__dirname, '../', 'data'),
        writable: false
    },
    'POLICY_PATH':{
        value: path.resolve(__dirname, '../', 'policy'),
        writable: false
    }
};
// //将常用路径挂载到全局
Object.defineProperties(global,myPath);


//收集Policy
function getPolicy(){
   let files = fs.readdirSync(POLICY_PATH);
   let filter_files = files.filter(e=>{
       return e.endsWith('.js');
   })
   
   let policyObj = {};
   filter_files.forEach(e=>{
       policyObj[e] = require(POLICY_PATH+'/'+e)
   })
   return policyObj;
}

//将Policy挂载到全局
Object.defineProperty(global, 'policyObj',{
    value: getPolicy(),
    writable: false
});