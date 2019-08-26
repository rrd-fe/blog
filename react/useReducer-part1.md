
# 基于Hook的React状态管理系列-基础篇

`useReducer`是React提供的一个高级Hook，它不像useEffect、useState、useRef等必须hook一样，没有它我们也可以正常完成需求的开发，但useReducer可以使我们的代码具有更好的可读性、可维护性、可预测性。

下面我们会分三篇文章详细介绍如何在项目中使用`useReducer`：

* 第一篇：主要介绍JavaScript中`reducer`的概念以及它的特点，对reducer、redux等比较熟悉的小伙伴可以跳过本篇
* 第二篇：主要介绍`useReducer`的使用方式和它的场景，以及useReducer带来的好处
* 第三篇：会进一步介绍复杂项目、复杂页面中的useReducer使用

### 什么是reducer

`reducer`的概念是伴随着Redux的出现逐渐在JavaScript中流行起来。但我们并不需要学习Redux去了解Reducer。简单来说 reducer是一个函数`(state, action) => newState`：接收当前应用的state和触发的动作action，计算并返回最新的state。下面是一段伪代码：

```js
    // 举个栗子 计算器reducer，根据state（当前状态）和action（触发的动作加、减）参数，计算返回newState
    function countReducer(state, action) {
        switch(action.type) {
            case 'add':
                return state + 1;
            case 'sub':
                return state - 1;
            default: 
                return state;
        }
    }
```

上面例子：state是一个number类型的数值，reducer根据action的类型（加、减）对应的修改state，并返回最终的state。为了刚接触到`reducer`概念的小伙伴更容易理解,可以将state改为count，但请始终牢记count仍然是**state**。

```js
    function countReducer(count, action) {
        switch(action.type) {
            case 'add':
                return count + 1;
            case 'sub':
                return count - 1;
            default: 
                return count;
        }
    }
```

### reducer 的幂等性

从上面的示例可以看到`reducer`本质是一个纯函数，没有任何UI和副作用。这意味着相同的输入（state、action），reducer函数无论执行多少遍始终会返回相同的输出（newState）。因此通过reducer函数很容易推测state的变化，并且也更加容易单元测试。

```js
    expect(countReducer(1, { type: 'add' })).equal(2); // 成功
    expect(countReducer(1, { type: 'add' })).equal(2); // 成功
    expect(countReducer(1, { type: 'sub' })).equal(0); // 成功
```

### state 和 newState 的理解

`state`是当前应用状态对象，可以理解就是我们熟知的React里面的state。

在上面的例子中state是一个基础数据类型，但很多时候state可能会是一个复杂的JavaScript对象，如上例中count有可能只是 state中的一个属性。针对这种场景我们可以使用ES6的结构赋值：

```js
    // 返回一个 newState (newObject)
    function countReducer(state, action) {
        switch(action.type) {
            case 'add':
                return { ...state, count: state.count + 1; }
            case 'sub':
                return { ...state, count: state.count - 1; }
            default: 
                return count;
        }
    }
```

关于上面这段代码有两个重要的点需要我们记住：

1. reducer处理的state对象必须是`immutable`，这意味着永远不要直接修改参数中的state对象，reducer函数应该每次都返回一个新的state object

2. 既然reducer要求每次都返回一个新的对象，我们可以使用ES6中的[解构赋值方式](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)去创建一个新对象，并复写我们需要改变的state属性，如上例。

看上去很完美，但如果我们的state是多层嵌套，解构赋值实现就非常复杂：

```js
    function bookReducer(state, action) {
        switch(action.type) {
            // 添加一本书
            case 'addBook':
                return {
                    ...state,
                    books: {
                        ...state.books,
                        [bookId]: book,
                    }
                };
            case 'sub':
                // ....
            default: 
                return state;
        }
    }
```

对于这种复杂state的场景推荐使用[immer](https://github.com/immerjs/immer)等immutable库解决。

### state为什么需要immutable？

* reducer的幂等性

我们上文提到过reducer需要保持幂等性，更加可预测、可测试。如果每次返回同一个state，就无法保证无论执行多少次都是相同的结果

* React中的state比较方案

React在比较`oldState`和`newState`的时候是使用Object.is函数，如果是同一个对象则不会触发组件的rerender。
可以参考官方文档[bailing-out-of-a-dispatch](https://reactjs.org/docs/hooks-reference.html#bailing-out-of-a-dispatch)。

### action 理解

action：用来表示触发的行为。

1. 用type来表示具体的行为类型(登录、登出、添加用户、删除用户等)
2. 用payload携带的数据（如增加书籍，可以携带具体的book信息），我们用上面addBook的action为例：

```js
    const action = {
        type: 'addBook',
        payload: {
            book: {
                bookId,
                bookName,
                author,
            }
        }
    }
    function bookReducer(state, action) {
        switch(action.type) {
            // 添加一本书
            case 'addBook':
                const { book } = action.payload;
                return {
                    ...state,
                    books: {
                        ...state.books,
                        [book.bookId]: book,
                    }
                };
            case 'sub':
                // ....
            default: 
                return state;
        }
    }
```

## 总结

至此基本介绍完了reducer相关的内容，简单总结一下：`reducer`是一个利用`action`提供的信息，将`state`从A转换到B的一个纯函数，具有一下几个特点：

* 语法：(state, action) => newState
* Immutable：每次都返回一个newState， 永远不要直接修改state对象
* Action：一个常规的Action对象通常有type和payload（可选）组成
    * type： 本次操作的类型，也是 reducer 条件判断的依据
    * payload： 提供操作附带的数据信息

下篇文章我们会进入正题：如何使用useReducer简化我们的state管理。

最后惯例，欢迎大家star我们的[人人贷大前端团队博客](https://github.com/rrd-fe/blog)，所有的文章还会同步更新到[知乎专栏](https://www.zhihu.com/people/ren-ren-dai-da-qian-duan-ji-zhu-zhong-xin/activities) 和 [掘金账号](https://juejin.im/user/5cb690b851882532941dd5d9)，我们每周都会分享几篇高质量的大前端技术文章。如果你喜欢这篇文章，希望能动动小手给个赞。

## 参考资料

* https://github.com/immerjs/immer
* https://reactjs.org/docs/context.html
* https://reactjs.org/docs/hooks-faq.html
* https://www.robinwieruch.de/react-usereducer-vs-usestate/
* https://www.robinwieruch.de/react-state-usereducer-usestate-usecontext/
* https://kentcdodds.com/blog/application-state-management-with-react
