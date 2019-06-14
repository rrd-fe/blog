
# 这一次彻底搞定 useReducer - useContext使用

欢迎回到我们的useReducer系列第三篇，如果这是你第一次看到这个系列，推荐先看看前两篇：

[useReducer-基础概念篇]()
[useReducer-使用篇]()

上篇文章结尾中提到过使用useReducer，可以帮助我们集中式的处理复杂的state管理。但如果我们的页面很复杂，拆分成了多层多个组件，我们如何在子组件触发这些state变化呢，比如在LoginButton触发登录失败操作？ 

这篇文章会介绍如何使用另外一个高阶Hook-useContext去解决这些问题。

`useContext`从名字上就可以看出，它是以Hook的方式使用React Context。这里简单介绍`Context`的概念和使用方式，更多Context的知识可以参考[官方文档](https://reactjs.org/docs/context.html)。

## context 介绍

下面这段定义来自原官方文档：

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
  const theme = useContext('ThemeContext');
  render() {
    return <Button theme={theme} />;
  }
}
```

关于`Context`还有一个比较重要的点是：当Context Provider的value发生变化是，他的所有子级消费者都会rerender。

## useContext版login

看完上面Demo可能很多小伙伴已经知道将useReducer和useContext结合使用了，就是将dispatch函数作为context的value，共享给页面的子组件。

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
        return ( 
            <LoginContext.Provider value={{dispatch}}>
                <...>
                <LoginButton />
            </LoginContext.Provider>
        )
    }
    function LoginButton() {
        const dispatch = useContext('LoginContext');
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

可以看到在useReducer中使用Context，通过context可以把dispatch函数提供给组件树中的所有组件使用
，而不用通过回调函数的方式一层层传递。

使用Context比回调函数的优势：

1. 对比回调函数的自定义命名，Context的Api更加明确，我们可以更清晰的知道哪些组件使用了dispatch，应用中的数据流动和变化。这也是React一直以来单向数据流的优势。

2. 更好的性能：如果使用回调函数作为参数传递的话，因为每次render函数都会变化，也会导致子组件rerender。当然我们可以使用[useCallback解决这个问题](https://reactjs.org/docs/hooks-faq.html#how-to-read-an-often-changing-value-from-usecallback)，但相比`useCallback`React官方更推荐使用useReducer，因为React会保证dispatch始终是稳定的，不会因为rerender而引起变化。

更多信息可以参考官方的FQA：

[how-to-avoid-passing-callbacks-down](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down)

[how-to-read-an-often-changing-value-from-usecallback](https://reactjs.org/docs/hooks-faq.html#how-to-read-an-often-changing-value-from-usecallback)

## 总结

至此useReducer系列三篇就全部结束了，我们简单回顾一下：

* 如果你的页面`state`很简单，可以直接使用`useState`
* 如果你的页面`state`比较复杂（state是一个对象或者state非常多散落在各处）请使用userReducer
* 如果你的页面组件层级比较深，并且需要子组件触发`state`的变化，可以考虑useReducer + useContext

## 参考资料

* https://github.com/immerjs/immer
* https://reactjs.org/docs/context.html
* https://reactjs.org/docs/hooks-faq.html
* https://www.robinwieruch.de/react-usereducer-vs-usestate/
* https://www.robinwieruch.de/react-state-usereducer-usestate-usecontext/
