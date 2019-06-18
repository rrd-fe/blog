
# 这一次彻底搞定 useReducer - useContext使用

[useReducer-基础概念篇](https://github.com/rrd-fe/blog/blob/master/react/useReducer-part1.md)
[useReducer-使用篇](https://github.com/rrd-fe/blog/blob/master/react/useReducer-part2.md)
[useReducer-配合useContext使用](https://github.com/rrd-fe/blog/blob/master/react/useReducer-part3.md)

欢迎回到我们的useReducer系列第三篇，如果这是你第一次看到这个系列，推荐先看看前两篇：

上篇文章结尾提到过使用useReducer，可以帮助我们集中式的处理复杂的state管理。但如果我们的页面很复杂，拆分成了多层多个组件，我们如何在子组件触发这些state变化呢，比如在LoginButton触发登录失败操作？ 

这篇文章会介绍如何使用另外一个高阶Hook-useContext去解决这些问题。

`useContext`从名字上就可以看出，它是以Hook的方式使用React Context。先简单介绍`Context`的概念和使用方式，更多Context的知识可以参考[官方文档](https://reactjs.org/docs/context.html)。

## context 介绍

下面这段定义来自官方文档：

    Context is designed to share data that can be considered “global” for a tree of React components, such as the current authenticated user, theme, or preferred language. 

简单来说`Context`的作用就是对它所包含的组件树提供全局共享数据的一种技术，talk is cheep 我们直接看官方Demo：

```js
// 第一步：创建需要共享的context
const ThemeContext = React.createContext('light');

class App extends React.Component {
  render() {
    // 第二步：使用 Provider 提供 ThemeContext 的值，Provider所包含的子树都可以直接访问ThemeContext的值
    return (
      <ThemeContext.Provider value="dark">
        <Toolbar />
      </ThemeContext.Provider>
    );
  }
}
// Toolbar 组件并不需要透传 ThemeContext
function Toolbar(props) {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

function ThemedButton(props) {
  // 第三步：使用共享 Context
  const theme = useContext(ThemeContext);
  render() {
    return <Button theme={theme} />;
  }
}
```

关于`Context`还有一个比较重要的点是：当Context Provider的value发生变化是，他的所有子级消费者都会rerender。

## useContext版login

看完上面Demo，我们在回过头思考如何利用`context`去解决我们问中开头提到的子孙类组件出发reducer状态变化。没错，就是将dispatch函数作为context的value，共享给页面的子组件。

```js
    // 定义初始化值
    const initState = {
        name: '',
        pwd: '',
        isLoading: false,
        error: '',
        isLoggedIn: false,
    }
    // 定义state[业务]处理逻辑 reducer函数
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
    // 定义 context函数
    const LoginContext = React.createContext();
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
        // 利用 context 共享dispatch
        return ( 
            <LoginContext.Provider value={{dispatch}}>
                <...>
                <LoginButton />
            </LoginContext.Provider>
        )
    }
    function LoginButton() {
        // 子组件中直接通过context拿到dispatch，出发reducer操作state
        const dispatch = useContext(LoginContext);
        const click = () => {
            if (error) {
                // 子组件可以直接 dispatch action
                dispatch({
                    type: 'error'
                    payload: { error: error.message }
                });
            }
        }
    }
```

可以看到在useReducer结合useContext，通过context把dispatch函数提供给组件树中的所有组件使用
，而不用通过props添加回调函数的方式一层层传递。

使用Context相比回调函数的优势：

1. 对比回调函数的自定义命名，Context的Api更加明确，我们可以更清晰的知道哪些组件使用了dispatch、应用中的数据流动和变化。这也是React一直以来单向数据流的优势。

2. 更好的性能：如果使用回调函数作为参数传递的话，因为每次render函数都会变化，也会导致子组件rerender。当然我们可以使用[useCallback解决这个问题](https://reactjs.org/docs/hooks-faq.html#how-to-read-an-often-changing-value-from-usecallback)，但相比`useCallback`React官方更推荐使用useReducer，因为React会保证dispatch始终是不变的，不会引起consumer组件的rerender。

更多信息可以参考官方的FQA：

[how-to-avoid-passing-callbacks-down](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down)

[how-to-read-an-often-changing-value-from-usecallback](https://reactjs.org/docs/hooks-faq.html#how-to-read-an-often-changing-value-from-usecallback)

## 总结

至此useReducer系列三篇就全部结束了，我们简单回顾一下：

* 如果你的页面`state`很简单，可以直接使用`useState`
* 如果你的页面`state`比较复杂（state是一个对象或者state非常多散落在各处）请使用userReducer
* 如果你的页面组件层级比较深，并且需要子组件触发`state`的变化，可以考虑useReducer + useContext

最后惯例，欢迎大家star我们的[人人贷大前端团队博客](https://github.com/rrd-fe/blog)，所有的文章还会同步更新到[知乎专栏](https://www.zhihu.com/people/ren-ren-dai-da-qian-duan-ji-zhu-zhong-xin/activities) 和 [掘金账号](https://juejin.im/user/5cb690b851882532941dd5d9)，我们每周都会分享几篇高质量的大前端技术文章。如果你喜欢这篇文章，希望能动动小手给个赞。

## 参考资料

* https://github.com/immerjs/immer
* https://reactjs.org/docs/context.html
* https://reactjs.org/docs/hooks-faq.html
* https://www.robinwieruch.de/react-usereducer-vs-usestate/
* https://www.robinwieruch.de/react-state-usereducer-usestate-usecontext/
* https://kentcdodds.com/blog/application-state-management-with-react
