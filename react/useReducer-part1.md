
# 这一次彻底搞定 useReducer - reducer 基础篇

第一篇主要介绍 reducer 的概念，以及它的特点，对reducer、redux等比较熟悉的小伙伴可以直接看第二篇  useReducer 的使用场景以及和 useState 的对比。

reducer 的概念是伴随着 Redux 的出现逐渐在 JavaScript 中流行起来。但其实并不需要学习 Redux 去了解 Reducer。 简单来说 reducer 是一个函数，接收两个参数：当前的state、发生的动作 action，返回最新的state，下面是伪代码：

```js
    (state, action) => newState

    // 举个栗子
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

上面例子：state是一个number类型的数值，reducer根据action的类型（加、减）对应的修改 state，并返回最终的state。为了刚接触到reducer 概念的小伙伴更加容易理解，可以将 state 改为 count，但请始终牢记 count 仍然是 **state**

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

从上面的示例可以看到 reducer 本质就是一个纯函数，没有任何副作用。这意味着相同的输入（state、action），reducer函数无论执行多少遍始终会返回相同的输出（newState）。因此通过 reducer 函数很容易推测state 的变化，并且也更加容易单元测试。

```js
    expect(countReducer(1, { type: 'add' })).equal(2); // 成功
    expect(countReducer(1, { type: 'add' })).equal(2); // 成功
    expect(countReducer(1, { type: 'sub' })).equal(0); // 成功
```

### state 和 newState 的理解

state 是当前应用状态对象，没错就是我们熟知的 React 里面的 state。

在上面的例子中 state 是一个基础数据类型，但很多时候 state 可能会是一个复杂的 JavaScript 对象，如上例中 count 有可能只是 state 中的一个属性。参考[官方文档](https://reactjs.org/docs/hooks-reference.html#bailing-out-of-a-dispatch)的说法，React 使用 Object.is 进行 oldState 和 newState 比较，**因此永远不要直接修改参数中的 state 对象， state 对象是 immutable 的**。如下例我们可以使用 ES6 的结构赋值：

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

看上去很完美，但如果我们的 state 是多层嵌套，解构赋值实现就非常复杂：


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

对于这种复杂state的场景推荐使用[immer](https://github.com/immerjs/immer)等类库解决。

### action 理解

action：用来表示触发的行为，用type来表示(登录、登出、添加用户、删除用户等)，通常也会携带一些数据 payload（user等），我们用上面 addBook 的 action 为例：

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

至此基本介绍完了reducer相关的内容，简单总结一下：reducer 是一个利用 action 提供的信息，将 state 从 A 转换到 B 的一个纯函数，具有一下几个特点：

* 语法 ： (state, action) => newState
* Immutable ： 每次都返回一个 newState， 永远不要直接修改 state 对象
* Action ： 一个常规的Action 对象通常有 type 和 payload（可选） 组成
    * type ： 本次操作的类型，也是 reducer 条件判断的依据
    * payload ： 提供操作附带的数据信息

下篇文章我们会进入正题：如何使用useReducer简化我们的state管理。

最后惯例，欢迎大家star我们的[人人贷大前端团队博客](https://github.com/rrd-fe/blog)，所有的文章还会同步更新到[知乎专栏](https://www.zhihu.com/people/ren-ren-dai-da-qian-duan-ji-zhu-zhong-xin/activities) 和 [掘金账号](https://juejin.im/user/5cb690b851882532941dd5d9)，我们每周都会分享几篇高质量的大前端技术文章。

## 参考资料

* https://github.com/immerjs/immer
* https://reactjs.org/docs/context.html
* https://reactjs.org/docs/hooks-faq.html
* https://www.robinwieruch.de/react-usereducer-vs-usestate/
* https://www.robinwieruch.de/react-state-usereducer-usestate-usecontext/
