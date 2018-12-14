import {ReactElement} from './element';

import ReactDOMComponent from './ReactDOMComponent';
import ReactDOMTextComponent from './ReactDOMTextComponent';
import ReactCompositeComponent from './ReactCompositeComponent';


//比较两个createElement 返回是否需要更新
function shouldUpdateReactComponent(prevElement, nextElement) {
    var prevEmpty = prevElement === null || prevElement === false;
    var nextEmpty = nextElement === null || nextElement === false;
    if (prevEmpty || nextEmpty) {
        return prevEmpty === nextEmpty;
    }

    var prevType = typeof prevElement;
    var nextType = typeof nextElement;
    if (prevType === 'string' || prevType === 'number') {
        return nextType === 'string' || nextType === 'number';
    } else {
        return nextType === 'object' && prevElement.type === nextElement.type && prevElement.key === nextElement.key;
    }
}

const ReactMount = {
    nextNodeIndex :0,
    render: function (nextElement, container, callback) {
       const nextWrappedElement = instantiateReactComponent(nextElement);
       const currentelement = nextWrappedElement._currentelement;
       //const rootID = nextWrappedElement._rootNodeID;
        
       const markup = nextWrappedElement.mountComponent(ReactMount.nextNodeIndex++);
       container.innerHTML = markup;
       if (callback) {
            callback.call(component);
        }

    }
}

/**
 * 根据给node typeof 判断是啥类型的组件 然后去生成对应类型组件
 * @param node
 * @returns {*}
 */
function instantiateReactComponent(node) {
    let instance;
    if (node === null || node === false) {
        //创建空组件
        instance = new ReactEmptyComponent(node);
    } else if (typeof node === 'object') {
        // 组件对象，包括DOM原生的和React自定义组件
        var element = node;

        // 根据ReactElement中的type字段区分
        if (typeof element.type === 'string') {
            // type为string则表示DOM原生对象，比如div span等。可以参看上面babel转译的那段代码
            instance = new ReactDOMComponent(element);
        } else {
            // React自定义组件
            instance = new ReactCompositeComponent(element);
        }

    } else if (typeof node === 'string' || typeof node === 'number') {
        // 元素是一个string时，对应的比如<span>123</span> 中的123
        // 本质上它不是一个ReactElement，但为了统一，也按照同样流程处理，称为ReactDOMTextComponent
        instance = new ReactDOMTextComponent(node);
    }

    // 初始化参数，这两个参数是DOM diff时用到的
    instance._mountIndex = 0;
    instance._mountImage = null;

    return instance;
}



/**
 * 根据元素类型实例化一个具体的component
 * @param {*} node ReactElement
 * @return {*} 返回一个具体的component实例
 */
// function instantiateReactComponent(node) {
//     // 文本节点的情况
//     if (typeof node === "string" || typeof node === "number") {
//         return new ReactDOMTextComponent(node);
//     }
//     // 浏览器默认节点的情况
//     if (typeof node === "object" && typeof node.type === "string") {
//         // 注意这里，使用了一种新的component
//         return new ReactDOMComponent(node);
//     }
//     // 自定义的元素节点
//     if (typeof node === "object" && typeof node.type === "function") {
//         // 注意这里，使用新的component,专门针对自定义元素
//         return new ReactCompositeComponent(node);
//     }
// }


export {ReactMount,instantiateReactComponent}