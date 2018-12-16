$(function(){
    $('#login').on('click',function(){
        let name = $('#user').val();
        let pwd = $('#pwd').val();
        if(name && pwd){
          axios.post('/userLogin',{name, pwd}).then(res=>{
              if(res.data.status === 0){
                  location.href = '/admin'
              }else{
                  alert('密码或用户名不对')
              }
          }).catch(err=>{
              console.log(err)
          })
        }else{alert('密码或用户名不能为空')}
    })
})