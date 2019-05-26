
# 从零开始完成React Native 九宫格抽奖

本文将带着大家从零开始实现一个 React Native 版本的九宫格抽奖转盘，我们先看最终效果图

![](https://i.imgur.com/xurl9UM.gif)

可以直接使用[react-native-super-lottery](https://github.com/rrd-fe/react-native-super-lottery)组件开发抽奖功能。

## 一、布局

布局很简单，我们可以采用flex 3行布局，当然也可以 单行配合 flex-wrap 允许子控件自动折行实现。这里我们直接上代码

```jsx
const LotteryStyle = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  }
});

const img_width = 100; // 图片的宽度
const img_height = 80; // 图片的高度

// 观察上图的转盘，会发现存在三种类型的宫格
// 当前被高亮的宫格(增加了蒙层效果) , 正常的功能，以及正中心可以被点击的宫格
// 在真实的情况里，就需要根据 item、 index、 highLightIndex 等参数处理不同的宫格效果
// 具体可以参考本文最后开源的抽奖组件
function renderItem(item, index, highLightIndex) {
    const { url } = item;
    return <Image style={{ width, height }} source={{ uri: url }}/>;
}

<View style={LotteryStyle.container}>
    {
        data.map((item, index) => {
            return renderItem(item);
        })
    }
</View>  
```

## 动画

这里重点介绍一下如何实现转盘动画的效果，仔细观察会发现整个转盘动画可以分为三个阶段：

1. 抽奖开始转盘加速旋转阶段
2. 匀速旋转阶段（可能有、可能无，根据后端抽奖响应速度决定）
3. 转盘降速阶段，逐步停到中奖宫格上

速度的加速和衰减的曲线决定了转盘旋转的流畅程度。

实现原理：

**转盘的转动，可以采用 setTimeout 快速修改下一个应该高亮的宫格，从而达到转动的视觉效果**
**旋转的速度其实就是 setTimeout 的interval间隔，interval越大速度越慢**
因此转盘动画的流畅程度实际取决于 setTimeout interval 值变化的连续性

### 方案一：Tween.js 动画库

[Tween.js](http://www.createjs.cc/tweenjs/)是一个JavaScript的动画补间库，允许你以平滑的方式更改对象的属性或者某一个特殊的值。你只需告诉它什么属性要更改，当补间结束运行时它们应该具有哪些最终值，需要进过多长时间或者多少次数，补间引擎将负责计算从起始点到结束点任意时间点应该返回的值。

听起来正是我们想要的效果，我们可以如下定义加速、匀速、减速三个动画效果：


```js

function animate(): void{
    TWEEN.update();
}

// 转盘加速阶段 ： interval 经过20次 从初始值 100（启动速度） 降低到 40 (转盘最高速度) 
// interval 变化曲线为 TWEEN.Easing.Quadratic.In 
// 关于 Tween.js 各种曲线 数值变化 可以参考这里 https://sole.github.io/tween.js/examples/03_graphs.html
const speedUpTween = new TWEEN.Tween({ interval: 100 })
    .to({ interval: 40 }, 20)
    .easing(TWEEN.Easing.Quadratic.In)
    .onUpdate((object) => {
        // onUpdate 每次数值变化的回调， 可以拿到本次 interval 的值, 然后 setTimeout 开始动画
        setTimeout(() => {
            setHighLightIndex(highIndex + 1);
            animate();
        }, object.interval);
        currentSpeed = object.interval;
    })
    // 加速阶段完毕进入匀速阶段
    .onComplete(() => {
        speedUniformAnimate();
    })
    .start();

// 匀速运动
function speedUniformAnimate(): void{
    setTimeout(() => {
        // 如果没有拿到抽奖结果 转盘继续匀速转动
        if (lotteryResult) {
            setHighLightIndex(highIndex + 1);
            speedUniformAnimate();
        } else {
            // 匀速阶段完毕 开始降速
            speedDownTween.start();
        }
    }, currentSpeed);
}

// 降速阶段 从当前速度 currentSpeed 实际是 40 经过 8次衰减 降为 500，
// interval 变化曲线为 TWEEN.Easing.Quadratic.Out
const speedDownTween = new TWEEN.Tween({ interval: currentSpeed })
    .to({ interval: 500 }, 8)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate((object) => {
        setTimeout(() => {
            setHighLightIndex(highIndex + 1);
            animate();
        }, object.interval);
    });
```

上述Demo有两个问题：

因为 Tween动画 必须要指定目标值，但在降速阶段有可能经过8次减速 最终停止的位置并不是我们中奖宫格的位置。当然这个问题我们可以反向通过控制降速阶段的开始时间：**在匀速运动阶段，只有拿到抽奖结果并且距离中奖位置还有8格的时候才开始降速**

第二个问题是 如果转盘需要支持多次抽奖 speedUpTween、 speedDownTween 等预定义动画需要重新初始化，官方文档里并没有找到类似reset的方法，暂时只能重新生成一遍。

详细三阶段运行效果，可以查看[Demo](https://snack.expo.io/@wangcheng714/tween-demo)

### 方案二：手动模拟三个阶段

```js
/**
 * 转盘抽奖动画：
 * 1. 前 CYCLE_TIMES = 30 次， 每次速度递加 10ms，
 * 2. 之后 8 次 每次速递递减 20ms
 * 3. 中奖前一次速度减 80ms
 */
function startLottery() {
    this.setState({
        highLightIndex: currentIndex
    }, () => {
            this.currentIndex += 1;
            if (this.currentIndex > CYCLE_TIMES + 8 && this.luckyOrder === currentOrder) {
                clearTimeout(this.lotteryTimer);
                // 完成抽奖，展示奖品弹窗等
            } else {
                if (this.currentIndex < CYCLE_TIMES) {
                    //  CYCLE_TIMES = 30 次， 每次速度递加 10ms，
                    this.speed -= 10;
                } else if (this.currentIndex > CYCLE_TIMES + 8 && this.luckyOrder === -1) {
                    // 如果完成加速阶段 还没有拿到抽奖结果则继续匀速运动
                    this.speed -= 0;
                } else if (this.currentIndex > CYCLE_TIMES + 8 && this.luckyOrder === currentOrder + 1) {
                    // 中奖前一次降速 80 急停效果
                    this.speed += 80;
                } else {
                    this.speed += 20;
                }
                // 确保速度不能低于 50 ms
                if (this.speed < 50) {
                    this.speed = 50;
                }
                this.lotteryTimer = setTimeout(this.startLottery, this.speed);
            }
        }
    );
}
```

完成了布局和动画等核心功能，之后的封装组件、提供start、stop等抽奖函数就很简单了，这里不再详述。
