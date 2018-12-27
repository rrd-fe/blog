
class Upload extends React.Component{
    constructor(props){
        super(props)
        this.change = this.change.bind(this);
        this.upload = this.upload.bind(this);
        this.table = this.table.bind(this);
        this.file = null;
        this.state={arr:[], name: ''}
    }
    
   componentWillMount(){
       axios.get('/getdata').then(res=>{
           if(res.status === 200){
             this.setState({arr: res.data})
           }  
       })
   }

   change(e){
        this.file = new FormData();
        this.file.append("file",e.target.files[0]);
        this.setState({name: e.target.files[0]['name']})
    }
    
   upload(){
       let _this = this;
        if(!this.file){alert('请添加文件');return};
        axios.post('/upload',this.file,{
            headers: {'Content-Type': 'multipart/form-data'}
        }
        ).then(res=>{
           alert('上传文件成功');
           let arr = [..._this.state.arr];
           arr.push(res.data);
           _this.setState({arr: arr})
        })
    }
    
    table(){
      let arr = this.state.arr;
      if(arr && arr.length>0){
         return  arr.map((e, index)=>{  return <tr key={index}>
                                        <td className='t1'>{e.type == 1 ? '图片' : 'csv'}</td>
                                        <td className='t2'>{e.name}</td>
                                        <td className='t3'><a href={e.url} target='_blank'>查看图片</a> </td>
                                 </tr>
         })
        
      }
    }

    render(){
        return <div>
               <div className='box'>
                   <div className='file'>
                     选择文件
                     <input type="file" onChange={this.change} ref='files'/>
                   </div>
                    <div className='show'>{this.state.name}</div>
                    <div onClick={this.upload} className='file'>上传文件</div>
               </div>
               <div className='table' border='1'>
                   <table>
                       <thead>
                        <tr>
                            <th className='t1'>类型</th>
                            <th className='t2'>名称</th>
                            <th className='t3'>查看</th>
                        </tr>
                       </thead>
                       <tbody>
                           {this.table()}
                       </tbody>
                    
                   </table>
               </div>
        </div>
    }
}



ReactDOM.render(
    <Upload />,
    document.getElementById('root')
  );

