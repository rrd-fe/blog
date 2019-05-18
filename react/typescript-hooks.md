
# TypeScript 中使用React Hook

从 React V 16.8.0 和 React Native 0.59.0 版本开始, 引入了React Hook的概念。React Hook 在开发支持就考虑到了类型，所以很多Hook函数可以直接推断出他们的参数、返回值等类型，但也有一些场景需要我们显示声明类型。阅读本文前你需要了解React Hook 的基本用法，[参考这里](https://reactjs.org/docs/hooks-intro.html)。下面会总结一下我们如何在 TypeScript 中使用React Hook。

### useState

大多数情况下，useState 的类型可以从初始化值推断出来。但当我们初始化值为 null、undefined或者对象以及数组的时候，我们需要制定useState的类型。

        // 可以推断 age 是 number类型
        const [age, setAge] = useState(20);

        // 初始化值为 null 或者 undefined时，需要显示指定 name 的类型
        const [name, setName] = useState<string>();

        // 初始化值为一个对象时
        interface People {
            name: string;
            age: number;
            country?: string;
        }
        const [owner, setOwner] = useState<People>({name: 'rrd_fe', age: 5});

        // 初始化值是一个数组时
        const [members, setMembers] = useState<People[]([]);

### useEffect

useEffect 用来在组件完成渲染之后增加副作用(side effect)，可以返回一个函数，用来做一些状态还原、移除listener等 clean up的操作。不需要处理返回值，所以可以不指定他的类型。useLayoutEffect类似。

        useEffect(() => {
            const listener = addEventListener(name, callback);
            return () => {
                removeEventListener(listener)
            }
        }, [name, callback]);

### useMemo、useCallback

对于 useMemo 和 useCallback 我们可以从函数的返回值中推断出来他们返回的类型，需要显示指定。

        const age = 12;
        // 推断 doubleAge 是 number类型
        const doubleAge = useMemo(() => {
            return age * 2;
        }, [age]);

        // 推断 addTen 类型是 (initValue: number) => number
        const addTen = useCallback((initValue: number) => {
            return initValue + 10;
        });

### useRef

useRef 有两种比较典型的使用场景：

场景一： 和 hook 之前的 ref 类似，用来关联一个 Dom节点或者 class component 实例，从而可以直接操作 Dom节点 或者class component 的方法。 通常会给 ref 的 readonly 属性 current 初始化为 null，直到 ref 关联到组件上。 通常我们需要指定 useRef 的类型，参考如下:

        const RRDTextInput = () => {
            const inputRef = useRef<TextInput>(null);
            return <TextInput ref={inputRef} placeholder="人人贷大前端" />;
        }

场景二：使用 ref 替代 class component 中的[实例属性](https://reactjs.org/docs/hooks-faq.html#is-there-something-like-instance-variables)，这种场景我们可以从初始化值中推断出类型，current 也是可修改的。

        // 推断 current 是 number 类型
        const age = useRef(2);

### useReducer

useReducer 可以认为是简配版的redux，可以让我们把复杂、散落在四处的useState，setState 集中到 reducer中统一处理。类似我们同样可以从reducer 函数(state逻辑处理函数)中推断出useReducer 返回的 state 和 dispatch 的 action类型，所以无需在显示的声明，参考如下实例：

        type ReducerAction =
            | { type: 'switchToSmsLogin' | 'switchToAccountLogin' }
            | {
                type: 'changePwdAccount' | 'changeSmsAccount';
                payload: {
                    actualAccount: string;
                    displayAccount: string;
                };
            };

        interface AccountState {
            loginWithPwd: boolean;
            pwdActualAccount: string;
            pwdDisplayAccount: string;
            smsActualAccount: string;
            smsDisplayAccount: string;
        }

        function loginReducer(loginState: AccountState, action: ReducerAction): AccountState {
            switch (action.type) {
                case 'switchToAccountLogin':
                    return {
                        ...loginState,
                        pwdActualAccount: loginState.smsActualAccount,
                        pwdDisplayAccount: loginState.smsDisplayAccount,
                        loginWithPwd: !loginState.loginWithPwd,
                    };
                // 密码登陆页账号发生变化
                case 'changePwdAccount':
                    return {
                        ...loginState,
                        pwdActualAccount: action.payload.actualAccount,
                        pwdDisplayAccount: action.payload.displayAccount,
                    };
                default:
                    return loginState;
            }
        }

        // 可以从 loginReducer 推断出
        // loginState 的类型 满足 AccountState interface
        // dispatchLogin 接受的参数满足 ReducerAction 类型
        const [loginState, dispatchLogin] = useReducer(loginReducer, initialState);

        dispatchLogin({ type: 'switchToAccountLogin' });
        dispatchLogin({
            type: 'changePwdAccount',
            payload: {
                actualAccount,
                displayAccount,
            },
        });

        // 错误： 不能将 logout 类型赋值给 type
        dispatchLogin({ type: 'logout' });
        // 错误： { type: 'changePwdAccount' } 类型缺少 payload属性
        dispatchLogin({ type: 'changePwdAccount' });

### useImperativeHandle

useImperativeHandle 是 hook 中提供的允许我们 ref 一个function component 的方案，也是 Hook 在 TypeScript 中使用最复杂的场景。 我们先来看下面的Demo，一个RN转盘组件：

        // 第一步：定义转盘抽奖组件对外暴露的接口 start、stop
        export interface WheelHandles {
            startLottery(): void;
            stopLottery(
                luckyIndex: number,
                stopCallback: () => void,
            ): void;
        }

        // 第二步：将转盘组件声明为 RefForwardingComponent 类型， 可以接受一个 ref props
        // ref props 是通过 forwarding-refs 实现 https://reactjs.org/docs/forwarding-refs.html
        const PrizeWheel: RefForwardingComponent<WheelHandles, Props> = (props, ref): => {

            function startLottery(): void {
                // 开始抽奖逻辑
            }

            function stopLottery(luckyIndex: number, stopCallback: () => void): void {
                // 停止抽奖逻辑
            }

            // 第三步： 通过 useImperativeHandle 实现对外提供预定义好的接口
            // useImperativeHandle 的 第一个 ref 参数， 我们可以从useRef(第四步会用到)推断出来
            // 第二个函数 return 内容， 可以从 WheelHandles推断出 不需要显示声明 
            // 例如： 我们如果只实现的 startLottery， TypeScript 编译期间就会报错
            useImperativeHandle(ref, () => {
                return {
                    startLottery,
                    stopLottery,
                };
            });

            return (
                // 抽奖组件
            )
        }

        // 第四步 useRef 引用转盘对象， 并调用 startLottery 开始抽奖
        const lotteryRef = useRef<PrizeWheelHandles>(null);

        <PrizeWheel
            ref={lotteryRef}
            data={lotteryInfo}
        />

        lotteryRef.current.startLottery();

### 其他

useContext、useDebugValue 暂时没有用到，后续在补充。