/**
 * ReactElement 就是虚拟节点的概念
 * @param {*} key 虚拟节点的唯一标识，后期可以进行优化
 * @param {*} type 虚拟节点类型，type可能是字符串（'div', 'span'），也可能是一个function，function时为一个自定义组件
 * @param {*} props 虚拟节点的属性
 */

function ReactElement(type, key, props) {
  this.type = type;
  this.key = key;
  this.props = props;
}

export default ReactElement;
