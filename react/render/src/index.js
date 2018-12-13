import React from "./React";


/**
 * ReactDOMTextComponent组件
 */
// var TextComponent = "hello world!";
// var root = document.getElementById("root");
//
// React.render(TextComponent, root);

/**
 * ReactDOMComponent组件
 */
// function sayHello() {
//   alert("hello");
// }
// var div = React.createElement("div", {}, "jason");
// var DOMComponent = React.createElement(
//   "div",
//   { key: "jason", age: 22, onclick: sayHello },
//   "hello worlds!",
//   div
// );


/**
 * ReactCompositeComponent组件
 */
//var TextComponent = "hello world!";

// var DOMComponent = React.createElement(
//     "div", { key: "jason", age: 22, }, "hello worlds!",
//     React.createElement("div", {}, "jason")
// );



var CommentBox = React.createClass({
    render: function() {
        return (
            <ul class="ul">
                <li class="li-one">NO1list<b>a</b></li>
                <li class="li-two">NO2list<b>b</b></li>
                <li class="li-three">NO3list<b>c</b></li>
            </ul>
        );
    }
});

var CommentList = React.createElement(CommentBox);
var root = document.getElementById("root");

React.render(CommentList, root);
