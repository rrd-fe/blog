## console.log之外
[原文地址](https://medium.com/@mattburgess/beyond-console-log-2400fdf4a9d8)

**使用console.log输出变量并不是调试js的全部。看起来很明显我将要帮助调试器干坏事，但实际上不是。**

告诉做JS的人应该使用浏览器的调试器似乎很酷，而且这当然是有时间和地方的。但大多数时候你仅仅想看执行代码的特定部分或者一个变量是什么，而不是消失在RxJS代码库和Promise库核心。

然而，console.log是有它的地方的。很多人没有意识到console它自己除了基本的log之外还有许多可选项。适当使用这些函数可以使调试更容易、更快、更直观。

### console.log()
在旧的console.log有一些惊艳但不受期待的函数。当多数人把它当做`console.log(object)`来用，你也可以这样做`console.log(object, otherObject, string)`并且它会整齐的输出，偶尔很方便。

不止这些，还有另一个格式: `console.log(msg, values)`。这很像C/PHP中的sprintf。
```javascript
console.log('I like %s but I do not like %s.', 'Skittles', 'pus');
```

将会完整的按照你的预期输出
```javascript
I like Skittles but I do not like pus.
```

常见的占位符是%o(字符o)，能传递一个对象，%s能传递一个字符串, %d专门用来传递整型或数字。
![console_obj](http://pjvfp4f51.bkt.clouddn.com/console_obj.png)


另一个有趣的%c，但你的好处可能有所不同。它实际上是css值的占位符:
```javascript
console.log('I am a %cbutton', 'color: white; background-color: orange; padding: 2px 5px; border-radius: 2px');
```
![css_holder](http://pjvfp4f51.bkt.clouddn.com/css_holder.png)

这些值会影响到后面的任何内容上，没有结束标记会有点奇怪。但你可以将它变得像这样。
```javascript
console.log('I am a %cbutton%c but I am not', 'color: white;background-color: orange; padding: 2px 5px; border-radius: 2px', 'color: auto;background-color: none; padding:none;border-radius:none')
```
![console_btn](http://pjvfp4f51.bkt.clouddn.com/console_btn.png)

它不优雅，也不是特别有用。 当然，这不是一个真正的按钮。
![console_btn_last](http://pjvfp4f51.bkt.clouddn.com/console_btn_last.png)

### console.dir()
在大多数情况下，它和console.log非常像，虽然它看起来有点不同。
![console.dir](http://pjvfp4f51.bkt.clouddn.com/console.dir.png)

展开小箭头将显示与上面对象相同的详细信息，这也可以从console.log版本中看到。 当事情发生更大的分歧并变得更有趣时，就是当你看到html元素时。

```javascript
let e = document.getElementsByClassName('main-content')[0];
```
我已经打开了一些元素，这清楚地显示了DOM结构，我们可以通过它来导航。但是`console.dir(element)`给我们提供了惊人的不同输出。

![console.dir.element](http://pjvfp4f51.bkt.clouddn.com/console.dir.element.png)

这是一种查看元素更加客观的方式。有时候这就是你真正想要的东西，更像是检查元素的事情。

### console.warn()
可能是最明显的就是直接替换console.log()，你可以用完全相同的方式使用console.warn()。唯一真正的区别是输出有点黄色。具体来说，输出处于警告级别而不是信息级别，因此浏览器将稍微区别对待它。这使其在杂乱输出中更明显的效果。

但是，有一个更大的优势。 因为输出的是警告而不是信息，所以你可以过滤掉所有console.log()并仅保留console.warn()。这对于偶尔会在浏览器中输出大量无用废话的应用程序尤其有用。清理杂乱的输出可以让你更容易地查看。

### console.table()
令人惊讶的是，这并不是众所周知，但是console.table()函数旨在比抛出原始对象数组更简洁的方式来显示表格数据。

一个例子，这儿是数据清单:

```javascript
const transactions = [{
  id: "7cb1-e041b126-f3b8",
  seller: "WAL0412",
  buyer: "WAL3023",
  price: 203450,
  time: 1539688433
},
{
  id: "1d4c-31f8f14b-1571",
  seller: "WAL0452",
  buyer: "WAL3023",
  price: 348299,
  time: 1539688433
},
{
  id: "b12c-b3adf58f-809f",
  seller: "WAL0012",
  buyer: "WAL2025",
  price: 59240,
  time: 1539688433
}];
```

如果我们使用console.log()来抛出上面的数据，我们得到一些非常无用的输出。

小箭头让你点击并打开数组，当然，但这并不是我们想要的『一目了然』。

显然console.table(data)的输出更有帮助。
![console.table](http://pjvfp4f51.bkt.clouddn.com/console.table.png)

这里要注意的是这是乱序的 - 最右边的列标题上的箭头显示了原因。 我点击该列可以进行排序。找到列的最大或最小，或者只是对数据进行不同方式的查看。 顺便说一句，该功能仅显示一些列而没有做其他操作。它始终可用。

console.table()仅有最大处理1000行数据的能力，所以它可能不适合所有数据集。

### console.assert()
经常被错过有用的功能，函数assert()与log()相同，但仅在第一个参数为false的情况下。 如果第一个参数为真，它什么都不做。

这对于有循环（或几个不同的函数调用）并且只有一个显示特定行为的情况特别有用。 基本上它和下面这样做是一样的。

```javascript
if (object.whatever === 'value') {
  console.log(object);
}
```

需要澄清的是，当我说“相同”时，我最好说这与做到这一点相反的一面。 所以你需要相反的条件。

因此，让我们假设上面的一个值是在时间戳中使用null或0，这会搞砸我们格式化日期的代码。

```javascript
console.assert(tx.timestamp, tx);
```

当与任何有效的事务对象一起使用时，它只是跳过去。但是破坏的那个会触发我们的日志记录，因为时间戳是0或null，这是假的。

有时我们想要更复杂的条件。例如，我们已经看到用户WAL0412的数据存在问题，并且只想显示来自它们的事务。这是直观的解决方案。
```javascript
console.assert(tx.buyer === 'WAL0412', tx);
```
这看起来正确，但不起作用。请记住，条件必须是假的...我们要断言，而不是过滤。
```javascript
console.assert(tx.buyer !== 'WAL0412', tx);
```
这将做我们想要的。买方不是WAL0412的任何交易在该条件下都是正确的，只留下那些。 或者......不是。

像其中的一些，console.assert()并不总是特别有用。但在特定情况下它可以是一个优雅的解决方案。

### console.count()
另一个小应用，count作为一个简单n计数器，可选择作为一个命名计数器。
```javascript
for(let i = 0; i < 10000; i++) {
  if(i % 2) {
    console.count('odds');
  }
  if(!(i % 5)) {
    console.count('multiplesOfFive');
  }
  if(isPrime(i)) {
    console.count('prime');
  }
}
```

这不是有用的代码，有点抽象。此外，我不打算演示isPrime函数，只是假设它有效。

我们得到的基本上应该是一个列表
```
odds: 1
odds: 2
prime: 1
odds: 3
multiplesOfFive: 1
prime: 2
odds: 4
prime: 3
odds: 5
multiplesOfFive: 2
...
```

等等。这对于你可能只是转储索引的情况很有用，或者你希望保留一个（或多个）运行计数。

你也可以像这样使用console.count()，不带参数。这样做可以将其称为默认值。

如果你愿意，还可以使用相关的console.countReset()函数来重置计数器。

### console.trace()
调用栈跟踪，以下几个例子比较简单，故不再转述原文，直接贴出例子。
```javascript
export default class CupcakeService {
    
  constructor(dataLib) {
    this.dataLib = dataLib;
    if(typeof dataLib !== 'object') {
      console.log(dataLib);
      console.trace();
    }
  }
  ...
}
```

### console.time()
```javascript
const slowFunction = number =>  {
  console.time('slowFunction');
  // something slow or complex with the numbers. 
  // Factorials, or whatever.
  console.timeEnd('slowFunction');
}
console.time();

for (i = 0; i < 100000; ++i) {
  slowFunction(i);
}
console.timeEnd();
```

### console.group()
现在我们可能是在console输出最复杂和最高级的区域。分组可以使你分组一些东西。特别是能让你嵌套一些东西。它擅长的地方在于显示存在代码中的结构。

```javascript
// this is the global scope
let number = 1;
console.group('OutsideLoop');
console.log(number);
console.group('Loop');
for (let i = 0; i < 5; i++) {
  number = i + number;
  console.log(number);
}
console.groupEnd();
console.log(number);
console.groupEnd();
console.log('All done now');
```
![group](http://pjvfp4f51.bkt.clouddn.com/group.png)
