import {instantiateReactComponent} from './ReactMount';

function ReactDOMComponent(element){
	this._currentElement = element;
	this._rootNodeID = null;
}

ReactDOMComponent.prototype.mountComponent = function(rootID){
	this._rootNodeID = rootID;
  var props = this._currentElement.props;

  // 外层标签
  var tagOpen = "<" + this._currentElement.type;
  var tagClose = "</" + this._currentElement.type + ">";

  // 加上reactid标识
  tagOpen += " data-reactid=" + this._rootNodeID;

  // 拼接标签属性
  for (var propKey in props) {
    // 对于props 上的children和事件属性不做处理
    if (props[propKey] &&propKey != "children") {
      tagOpen += " " + propKey + "=" + props[propKey];
    }
  }
  // 渲染子节点dom
  var content = "";
  var children = props.children || [];

  var childrenInstances = []; // 保存子节点component 实例
  var that = this;
    if(children.length >1){
        for(var key in children){
            var child = children[key];
            var childComponentInstance = instantiateReactComponent(child);
            // 为子节点添加标记
            //childComponentInstance._mountIndex = key;
            childrenInstances.push(childComponentInstance);
            var curRootId = that._rootNodeID + "." + key;

            // 得到子节点的渲染内容
            var childMarkup = childComponentInstance.mountComponent(curRootId);

            // 拼接在一起
            content += " " + childMarkup;
        }
    }else{
        var textMarkup = children[0] || '';
        content += textMarkup;
    }



  // 保存component 实例
  this._renderedChildren = childrenInstances;

  // 拼出整个html内容
  return tagOpen + ">" + content + tagClose;
}

export default ReactDOMComponent;