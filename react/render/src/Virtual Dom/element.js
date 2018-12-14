

let hasOwnProperty = Object.prototype.hasOwnProperty;
const REACT_ELEMENT_TYPE = typeof Symbol === 'function' && Symbol['for'] && Symbol['for']('react.element') || 0xeac7;
let ReactElement = function (type, key, ref, self, source, owner, props) {
    var element = {
        $$typeof: REACT_ELEMENT_TYPE,
        type: type,
        key: key,
        ref: ref,
        props: props,
        _owner: owner
    };
    return element;
}
const RESERVED_PROPS = {
    key: true,
    ref: true,
    __self: true,
    __source: true
};

ReactElement.createElement = function(type,config,children) {

    let props = {};
    let key = null;
    let ref = null;
    let self = null;
    let source = null;

    if(config != null){
        if(config.ref !== undefined){
            ref = config.ref;
        }
        if (config.ref !== undefined) {
            key = '' + config.key;
        }

        self = config.__self === undefined ? null : config.__self;
        source = config.__source === undefined ? null : config.__source;

        for (let propName in config) {
            if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                props[propName] = config[propName];
            }
        }
    }
    // 入参的前两个为type和config，后面的就都是children参数了。故需要减2
    let childrenLength = arguments.length - 2;
    if (childrenLength === 1) {
        // 只有一个参数时，直接挂到children属性下
        props.children = Array.isArray(children) ? children : [children];


    } else if (childrenLength > 1) {
        // 不止一个时，放到array中，然后将array挂到children属性下
        var childArray = Array(childrenLength);
        for (var i = 0; i < childrenLength; i++) {
            childArray[i] = arguments[i + 2];
        }
        props.children = childArray;
    }

    const ReactCurrentOwner = null;
    return ReactElement(type, key, ref, self, source, ReactCurrentOwner, props);
}

export {ReactElement};