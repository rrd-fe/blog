/**
 * Created by daifei on 2018/11/27
 */
// 'use strict';

 //import React, { Component } from 'react';

 //import ReactDOM from 'react-dom';





"use strict";
import React from './Virtual Dom/React';
import ReactDom from './Virtual Dom/ReactDom';



class Ele extends React.Component{
    constructor(props){
        super(props);
    }
    onChange(){
        console.log(1111);
    }
    render(){
        return(
            <ul id='ul'>
                <li class='list'>Item1<b>384</b>677</li>
                <li class='list'>Item2<b>345</b>677</li>
                <li class='list'>Item1<b>346</b>677</li>
            </ul>

        )
    }
}
const Box = React.createElement(Ele)
ReactDom.render(<Ele/>,document.getElementById('root'));




