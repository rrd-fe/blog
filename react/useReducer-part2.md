# 这一次彻底搞定 useReducer - 使用篇

[useReducer-基础概念篇]()
[useReducer-使用篇]()
[useReducer-配合useContext使用]()

[React Hook](https://reactjs.org/docs/hooks-intro.html)功能正式发布之后，允许在function component中使用state和副作用（useEffect）。官方提供了两种state管理的hook：useState、useReducer。下面我们会通过一系列Demo逐步说明如何使用useReducer管理state。

### useState版login 

```js
    function LoginPage() {
        const [name, setName] = useState(''); // 用户名
        const [pwd, setPwd] = useState(''); // 密码
        const [isLoading, setIsLoading] = useState(false); // 是否展示loading，发送请求中
        const [error, setError] = useState(''); // 错误信息
        const [isLoggedIn, setIsLoggedIn] = useState(false); // 是否登录

        const login = (event) => {
            event.preventDefault();
            setError('');
            setIsLoading(true);
            login({ name, pwd })
                .then(() => {
                    setIsLoggedIn(true);
                    setIsLoading(false);
                })
                .catch((error) => {
                    // 登录失败: 显示错误信息、清空输入框用户名、密码、清除loading标识
                    setError(error.message);
                    setName('');
                    setPwd('');
                    setIsLoading(false);
                });
        }
        return ( 
            //  返回页面JSX Element
        )
    }
```

上面Demo我们定义了5个state描述当前页面的状态，在login函数中登录成功、失败进行了一系列复杂了state设置。可以想象随着需求越来越复杂更多的state加入到页面，更多的setState分散在各处，很容易设置错误或者遗漏，维护这样的老代码更是一个噩梦。

### useReducer版login

下面看看如何使用useReducer改造这段代码，先简单介绍下useReducer。

```js
    const [state, dispatch] = useReducer(reducer, initState);
```

[useReducer](https://reactjs.org/docs/hooks-reference.html#usereducer)接收两个参数：

第一个参数：reducer函数，没错就是我们上一篇文章介绍的，第二个参数：初始化state。返回最新的state和dispatch函数（用来触发reducer函数，计算对应的state）。按照官方的说法：对于复杂的state操作逻辑，嵌套的state的对象，推荐使用useReducer。

听起来比较抽象我们先看一个简单的例子：

```js
    // 官方 useReducer Demo
    // 应用的初始化
    const initialState = {count: 0};

    // state的reducer处理函数
    function reducer(state, action) {
        switch (action.type) {
            case 'increment':
              return {count: state.count + 1};
            case 'decrement':
               return {count: state.count - 1};
            default:
                throw new Error();
        }
    }

    function Counter() {
        const [state, dispatch] = useReducer(reducer, initialState);
        return (
            <>
                // useReducer会根据dispatch的action，返回最终的state，并触发rerender
                Count: {state.count}
                // dispatch 用来接收一个 action参数「reducer中的action」，用来触发reducer函数，更新最新的状态
                <button onClick={() => dispatch({type: 'increment'})}>+</button>
                <button onClick={() => dispatch({type: 'decrement'})}>-</button>
            </>
        );
    }
```

下面一起看看如何使用useReducer改造上面的login demo：

```js
    const initState = {
        name: '',
        pwd: '',
        isLoading: false,
        error: '',
        isLoggedIn: false,
    }
    function loginReducer(state, action) {
        switch(action.type) {
            case 'login':
                return {
                    ...state,
                    isLoading: true,
                    error: '',
                }
            case 'success':
                return {
                    ...state,
                    isLoggedIn: true,
                    isLoading: false,
                }
            case 'error':
                return {
                    ...state,
                    error: action.payload.error,
                    name: '',
                    pwd: '',
                    isLoading: false,
                }
            default: 
                return state;
        }
    }
    function LoginPage() {
        const [state, dispatch] = useReducer(loginReducer, initState);
        const { name, pwd, isLoading, error, isLoggedIn } = state;
        const login = (event) => {
            event.preventDefault();
            dispatch({ type: 'login' });
            login({ name, pwd })
                .then(() => {
                    dispatch({ type: 'success' });
                })
                .catch((error) => {
                    dispatch({
                        type: 'error'
                        payload: { error: error.message }
                    });
                });
        }
        return ( 
            //  返回页面JSX Element
        )
    }
```

乍一看useReducer改造后的代码反而更长了，但很明显第二版有更好的可读性，我们也能更清晰的了解state的变化逻辑。

可以看到login函数现在更清晰的表达了用户的意图，login、success、error。LoginPage不需要关心如何处理这几种行为，那是loginReducer需要关心的，表现和业务分离。

另一个好处是所有的state处理都集中到了一起，使得我们对state的变化更有掌控力，同时也更容易复用state逻辑变化代码，比如我们其他操作也需要触发login error状态，只需要**dispatch({ type: 'error' })**。

useReducer 可以让我们将`what`和`how`分开。比如点击了登录按钮，我们要做的就是发起登陆操作`dispatch({ type: 'login' })`，登出按钮就发起登出操作`dispatch({ type: 'logout' })`，所有和`how`相关的代码都在reducer中维护，组件中只需要思考`What`，让我们的代码可以像用户的行为一样，更加清晰。

除此之外还有一个好处，我们在前文提过Reducer其实一个UI无关的纯函数，useReducer的方案是的我们更容易构建自动化测试用例。

## 总结

最后我们总结一下这篇文章的一些主要内容：使用reducer的场景

* 如果你的`state`是一个数组或者对象
* 如果你的`state`变化很复杂，经常一个操作需要修改很多state
* 如果你希望构建自动化测试用例来保证程序的稳定性
* 如果你需要在深层子组件里面去修改一些状态（关于这点我们下篇文章会详细介绍）
* 如果你用应用程序比较大，希望UI和业务能够分开维护


这篇文章我们介绍了使用useReducer，帮助我们集中式的处理复杂的state管理。但如果我们的页面很复杂，拆分成了多层多个组件，我们如果在子组件触发这些state变化呢，比如在LoginButton触发登录操作？ 我们将在下篇文章介绍如何处理复杂组件树结构的reducer共享问题，欢迎大家关注我们。

## 参考链接

* https://github.com/immerjs/immer
* https://reactjs.org/docs/context.html
* https://reactjs.org/docs/hooks-faq.html
* https://www.robinwieruch.de/react-usereducer-vs-usestate/
* https://www.robinwieruch.de/react-state-usereducer-usestate-usecontext/