/**
 * Created by daifei on 2018/12/11
 * 复合组件类型 类
 */
import {instantiateReactComponent} from './ReactMount';

function ReactCompositeComponent(element){
    // 存放元素element对象
    this._currentElement = element;
    // 存放唯一标识
    this._rootNodeID = null;
    // 存放对应的ReactClass的实例
    this._instance = null;
}


/**
 * 初始化当前组件 render markup  并注册事件监听
 * @param rootID
 *
 */
ReactCompositeComponent.prototype.mountComponent = function(rootID){
     this._rootNodeID = rootID;

  // 当前元素属性
  var publicProps = this._currentElement.props;
  // 对应的ReactClass
  var ReactComponent = this._currentElement.type;

  var inst = new ReactComponent(publicProps);
  this._instance = inst;

  // 保留对当前 component的引用
  inst._reactInternalInstance = this;

  // 调用 ReactClass 实例的render 方法，返回一个element或者文本节点
  var renderedElement = this._instance.render();

  var renderedComponentInstance = instantiateReactComponent(renderedElement);
  this._renderedComponent = renderedComponentInstance; //存起来留作后用

  var renderedMarkup = renderedComponentInstance.mountComponent(this._rootNodeID);


  return renderedMarkup;
}

export default ReactCompositeComponent;
