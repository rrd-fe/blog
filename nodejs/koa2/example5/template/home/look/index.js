$(function(){
    $('.buttonNext').on('click',function(){
        let pageSize = +location.pathname.slice(6);
        pageSize++;
        if(pageSize>=15){pageSize=1};
        location.href = '/look/'+pageSize;
    })
    $('.buttonPre').on('click',function(){
        let pageSize = +location.pathname.slice(6);
        pageSize--;
        if(pageSize<=0){pageSize=14};
        location.href = '/look/'+pageSize;
    })
})