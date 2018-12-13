import ReactClass from "./ReactClass";
import ReactElement from "./ReactElement";

import ReactDOMTextComponent from "./ReactDOMTextComponent";
import ReactDOMComponent from "./ReactDOMComponent";
import ReactCompositeComponent from "./ReactCompositeComponent";

/**
 * 根据元素类型实例化一个具体的component
 * @param {*} node ReactElement
 * @return {*} 返回一个具体的component实例
 */
function instantiateReactComponent(node) {
  // 文本节点的情况
  if (typeof node === "string" || typeof node === "number") {
    return new ReactDOMTextComponent(node);
  }
  // 浏览器默认节点的情况
  if (typeof node === "object" && typeof node.type === "string") {
    // 注意这里，使用了一种新的component
    return new ReactDOMComponent(node);
  }
  // 自定义的元素节点
  if (typeof node === "object" && typeof node.type === "function") {
    // 注意这里，使用新的component,专门针对自定义元素
    return new ReactCompositeComponent(node);
  }
}

const React = {
  nextReactRootIndex: 0,
  /**
   * 创建 ReactClass
   * @param {*} spec 传入的对象
   */
  createClass: function(spec) {
    var Constructor = function(props) {
      this.props = props;
      this.state = this.getInitialState ? this.getInitialState() : null;
    };

    Constructor.prototype = new ReactClass();
    Constructor.prototype.constructor = Constructor;

    Object.assign(Constructor.prototype, spec);
    return Constructor;
  },
  /**
   * @param {*} type 元素的 component 类型
   * @param {*} config 元素配置
   * @param {*} children 元素的子元素
   */
  createElement: function(type, config, children) {
    var props = {};
    var propName;
    config = config || {};

    var key = config.key || null;

    for (propName in config) {
      if (config.hasOwnProperty(propName) && propName !== "key") {
        props[propName] = config[propName];
      }
    }

    var childrenLength = arguments.length - 2;
    if (childrenLength === 1) {
      props.children = Array.isArray(children) ? children : [children];
    } else if (childrenLength > 1) {
      var childArray = [];
      for (var i = 0; i < childrenLength; i++) {
        childArray[i] = arguments[i + 2];
      }
      props.children = childArray;
    }
    return new ReactElement(type, key, props);
  },
  /**
   * 接收一个React元素，和一个dom节点
   * @param {*} element React元素
   * @param {*} container 负责装载的dom
   */
  render: function(element, container) {
    // 实例化组件
    var componentInstance = instantiateReactComponent(element);
    // 组件完成dom装载
    var markup = componentInstance.mountComponent(React.nextReactRootIndex++);
    // 将装载好的 dom 放入 container 中
      container.innerHTML = markup
  }
};

export default React;
export { instantiateReactComponent };
