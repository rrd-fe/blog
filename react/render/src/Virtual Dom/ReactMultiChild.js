//差异数组
let queueList = [];
function makeMove(child, afterNode, toIndex) {
    return {
        type: "MOVE_EXISTING",
        content: null,
        fromIndex: child._mountIndex,
        fromNode: ReactReconciler.getHostNode(child),
        toIndex: toIndex,
        afterNode: afterNode
    };
}


function makeRemove(child, node) {
    return {
        type: "REMOVE_NODE",
        content: null,
        fromIndex: child._mountIndex,
        fromNode: node,
        toIndex: null,
        afterNode: null
    };
}
function makeInsertMarkup(markup, afterNode, toIndex) {
    // NOTE: Null values reduce hidden classes.
    return {
        type: "INSERT_MARKUP",
        content: markup,
        fromIndex: null,
        fromNode: null,
        toIndex: toIndex,
        afterNode: afterNode
    };
}

const ReactMultiChild = {
    //模拟diff比较
    updateChildren : function(nextChildren){
        const prevChildren = this._currentElement;

        if(!nextChildren && !prevChildren){
            return;
        }
        //代表到达的新的节点的index
        let nextIndex = 0;
        
        let lastIndex = 0;
        let nextMountIndex = 0;

        const lastPlacedNode = null;
        let updates = null;
        //循环新的树
        for (name in nextChildren) {
            if (!nextChildren.hasOwnProperty(name)) {
                continue;
            }
            const prevChild = prevChildren['rootId'];
            const nextChild = nextChildren['rootId'];
            //相同的话，说明是使用的同一个component,所以我们需要做移动的操作
            if(prevChild === nextChild){
                //移动操作 需要判断index
                updates = this.moveChild(prevChild, lastPlacedNode, nextIndex, lastIndex);
                queueList.push(updates)
                lastIndex = Math.max(prevChild._mountIndex, lastIndex);
                prevChild._mountIndex = nextIndex;
            }else{
                //新增
                if(prevChild){
                    lastIndex = Math.max(prevChild._mountIndex, lastIndex);
                }

                nextMountIndex++;

            }
            nextIndex++;
        }

        //移除
        let removedNodes = {};
        for (name in removedNodes) {
            if (removedNodes.hasOwnProperty(name)) {
                //updates = enqueue(updates, this._unmountChild(prevChildren[name], removedNodes[name]));
            }
        }
        // if (updates) {
        //     processQueue(this, updates);
        // }
        this._renderedChildren = nextChildren;
    },
    moveChild: function (child, afterNode, toIndex, lastIndex) {
        if (child._mountIndex < lastIndex) {
            return makeMove(child, afterNode, toIndex);
        }
    },
    createChild: function (child, afterNode, mountImage) {
        return makeInsertMarkup(mountImage, afterNode, child._mountIndex);
    },
    removeChild: function (child, node) {
        return makeRemove(child, node);
    },
    _updateChildren: function (nextNestedChildrenElements, transaction, context) {
        var prevChildren = this._renderedChildren;
        var removedNodes = {};
        var mountImages = [];
        var nextChildren = this._reconcilerUpdateChildren(prevChildren, nextNestedChildrenElements, mountImages, removedNodes, transaction, context);
        if (!nextChildren && !prevChildren) {
            return;
        }
        var updates = null;
        var name;
        // `nextIndex` will increment for each child in `nextChildren`, but
        // `lastIndex` will be the last index visited in `prevChildren`.
        var nextIndex = 0;
        var lastIndex = 0;
        // `nextMountIndex` will increment for each newly mounted child.
        var nextMountIndex = 0;
        var lastPlacedNode = null;
        for (name in nextChildren) {
            if (!nextChildren.hasOwnProperty(name)) {
                continue;
            }
            var prevChild = prevChildren && prevChildren[name];
            var nextChild = nextChildren[name];
            if (prevChild === nextChild) {
                updates = enqueue(updates, this.moveChild(prevChild, lastPlacedNode, nextIndex, lastIndex));
                lastIndex = Math.max(prevChild._mountIndex, lastIndex);
                prevChild._mountIndex = nextIndex;
            } else {
                if (prevChild) {
                    // Update `lastIndex` before `_mountIndex` gets unset by unmounting.
                    lastIndex = Math.max(prevChild._mountIndex, lastIndex);
                    // The `removedNodes` loop below will actually remove the child.
                }
                // The child must be instantiated before it's mounted.
                updates = enqueue(updates, this._mountChildAtIndex(nextChild, mountImages[nextMountIndex], lastPlacedNode, nextIndex, transaction, context));
                nextMountIndex++;
            }
            nextIndex++;
            lastPlacedNode = ReactReconciler.getHostNode(nextChild);
        }
        // Remove children that are no longer present.
        for (name in removedNodes) {
            if (removedNodes.hasOwnProperty(name)) {
                updates = enqueue(updates, this._unmountChild(prevChildren[name], removedNodes[name]));
            }
        }
        if (updates) {
            processQueue(this, updates);
        }
        this._renderedChildren = nextChildren;

        if (process.env.NODE_ENV !== 'production') {
            setChildrenForInstrumentation.call(this, nextChildren);
        }
    },
}

function updateChildren(){

}