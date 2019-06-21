# 深入理解JavaScript的类型转换

## 前言

> JavaScript作为一门弱类型语言，我们在每天的编写代码过程中，无时无刻不在应用着值类型转换，但是很多时候我们只是在单纯的写，并不曾停下脚步去探寻过值类型转换的内部转换规则，最近通过阅读你不知道的JavaScript中篇，对js的值类型转换进行了更加深入的学习，在此分享给大家参考学习。

## 概念

将值从一种类型转换为另一种类型通常称为类型转换，主要发生在静态语言的编译阶段；强制类型转换则发生在动态语言的运行阶段；JavaScript作为一门典型的动态弱类型语言自然而然采用的是强制类型转换（即隐式强制类型转换和显式强制类型转换）；在js的强制类型转换总是返回标量基本类型值，如字符串、布尔、数字，不会返回对象和函数

```
var a = 42;
var b = a + '';//隐式强制类型转换
var c = String(a);//显式强制类型转化
```

## 前情提要

在阅读后面的内容之前，我们首先要明白下面几个概念，以方便对后续内容的理解

- **封装对象** ：eg:var a = new String('abc'),a被叫做封装了基本类型的封装对象，还原一个封装对象的值，可以调用valueOf方法；

基本类型的几乎所有方法并非来自本身，而是来自于封装对象的原型对象，例如下面例子

```
const a = 1.2;
console.log(a.toFixed(0));//1
```
基本类型数字并不存在toFixed方法，只是在访问该方法时候，js自动封装基本类型为对应的封装对象，再去访问该封装对象的原型上对应的方法，等同于下面例子

```
const a = 1.2;
console.log(new Number(a).__proto__.toFixed());//0
```
- **ToPrimitive抽象操作**：该操作主要是将对象类型转换为基本类型，首先检查某个对象是否有valueOf属性，如果有则返回该对象的valueOf的值，否则调用该对象的toString属性并返回值（如果valueOf返回的不是基本类型则调用toString方法，例如数组的valueOf返回的还是数组，所有ToPrimitive会默认调用toString方法）；


## 抽象值操作

### ToString负责处理非字符串到字符串的强制类型转换，规则如下：

- 1.null转换为'null',undefined转换为'undefined',其他基本类型都调用基本类型的包装对象属性toString()并返回值。

```
const a = 123;
const _a = new Number(123);
console.log(String(a), _a.toString());//'123' '123'
const b = true;
const _b = new Boolean(true);
console.log(String(b), _b.toString());//'true' 'true'
```

- 2.数字的字符串化遵循通用规则，但是极小极大数字使用指数形式

```
const a = 1.07*1000*1000*1000*1000*1000*1000*1000;
console.log(String(a));//'1.07e+21'
```

- 3.对于普通对象来说，除非自行定义，否则toString()返回Object.prototype.toString()的值,其他对象有自己的toString()方法则调用自己的该方法

```
const b = {};
console.log(String(b));//[object object]
```

- 4.数组的默认toString()方法进行了重新定义，将所有单元字符串化以后再用‘,’连接起来

```
const a = [1, 2, 3];
console.log(String(a));//'1,2,3'
```

- 5.JSON字符串化

    - 5-1.JSON字符串化和toString的效果基本相同，只不过序列化的结果总是字符串

    - 5-2.JSON对于不安全的值（undefined，function(){}，symbol）直接忽略，数组中则以null填充

    - 5-3.对象循环引用直接报错，正则表达式序列化为｛｝

### ToNumber负责处理非数字到数字的强制类型转换，规则如下：

- 1.true转换为1，false转换为0，undefined转换为NaN，null转换为0

```
console.log(Number(null));//0
console.log(Number(undefined));//NaN
console.log(Number(true));//1
console.log(Number(false));//0
```

- 2.对字符串的处理遵循数字常量的相关规定/语法，处理失败时返回NaN

```
console.log(Number('123'));//123
console.log(Number('0b111'));//7
console.log(Number('0o123'));//83
console.log(Number('0x123'));//291
console.log(Number('123a'));//NaN
console.log(Number('a123'));//NaN
```

- 3.对象（包括数组）会首先按照ToPrimitive抽象操作被转换为相应的基本类型值，再按照前两条规则处理；如果某个对象即不存在valueOf方法也不存在toString方法，则会产生TypeError错误（例如Object.create(null)不存在以上两种方法）

```
const arr = [1, 2, 3];
console.log(Number(arr));//NaN
console.log(Number(arr.toString()));//NaN


const num = new Number(123);
console.log(Number(num));//123
console.log(Number(num.valueOf()));//123

const bool = new Boolean(true);
console.log(bool.valueOf());//true
console.log(Number(bool));//1
console.log(Number(bool.valueOf()));//1

const obj1 = {
  toString:()=>"21"
}

const obj2 = {
  valueOf:()=>"42",
  toString:()=>"21"
}

const obj3 = {
  a:1
}
console.log(Number(obj1));//21
console.log(Number(obj2));//42
console.log(obj3.toString());//[object Object]
console.log(Number(obj3));//NaN


const obj = Object.create(null);
console.log(Number(obj));//TypeError
```
上述obj1,obj2分别调用toString和valueOf方法，obj3调用原型上的toString()方法

### ToBoolean负责处理非布尔值到布尔值的强制类型转换，规则如下：

- 可以被转换为false的值（undefined，null，false， +0、-0和NaN，''）

- 除条件1的其他都被转换为true（切记：封装对象均被转为true）

## 显式强制类型转换

### 字符串和数字之间的显式转换

- 通过window下面的内建函数String()和Number()来实现（遵循上述抽象值操作）

- toString()的显式转换过程为先隐式的将基本类型转为封装对象，再对该对象调用toString方法

- 一元运算符+和-来转换，例如+a显式的将c转换为数字

- 位运算NOT的显式转换
    - 第一步：位运算NOT将非数字和数字转换为32位数字
    - 第二步：将该数字求负值并减1
    - indexOf优雅写法（返回-1的这种现象称为抽象渗漏，即代码暴露了底层的实现细节）
    - 截除数字值得小数部分比Math.floor()更加靠谱（Math.floor对负数的截取和~不同）
```
const a = true;
console.log(~a === -Number(a)-1)//true

//indexOf优雅写法
const b = 'abc';
if(~b.indexOf('d')){
  console.log('存在d')
}else{
  console.log('不存在d')
}

//数字的小数部分截除
const d = 3.14;
const e = -3.14;
console.log(Math.floor(d), ~~d);//3 3
console.log(Math.floor(e), ~~e);//-4 -3
```

### 显式解析数字字符串

解析字符串中的数字和强制将字符串转换为数字返回的结果都是数字；但是解析允许字符串中含有非数字，解析按从左到右的顺序，如果遇到非数字就停止解析；而转换不允许出现非数字字符，否则会失败并返回NaN。

- parseInt()和parseFloat分别用来解析整数和浮点数,传入的值必须是字符串，如果是非字符串会被隐式转换为字符串再解析

注意点：es5之前parseInt()遇到0开头的字符串数字（比如时间hour='09'）会被按照八进制处理,需要在第二个参数传入10解决，es5之后0开头的能能字符串化为八进制的按八进制解析不能的按10进制解析；


```
//现将a转为字符串'1,2,3'
const a = [1, 2, 3];
console.log(parseInt(a));//1
console.log(parseFloat(a));//1

//现将true转为字符串'true'
console.log(parseInt(true));//NaN
console.log(parseFloat(true));//NaN

//现将3.14转为字符串'3.14'
console.log(parseInt(3.14));//3
console.log(parseFloat(3.14));//3.14

console.log(String(new Date()));//'Wed Jun 12 2019 21:23:59 GMT+0800'
console.log(parseInt(new Date()));//NaN
console.log(parseFloat(new Date()));//NaN

//关于es6之前八进制写法的解析
console.log(parseInt(09));//9
console.log(parseFloat(09));//9
console.log(parseInt(010));//8
console.log(parseFloat(010));//8
```

- parseInt()的一些奇怪现象

```
parseInt(1/0, 19);//18
//其实相当于parseInt(Infinity, 19);其中Infinity的I在十九进制数中为18

parseInt(0.000008);//0
//字符串化为0.00008后进行解析

parseInt(0.0000008);//8
//字符化为8e-7后进行解析（详见抽象ToNumber）

parseInt(0x10);//16
String(0x10);//16
parseInt(0b10);//2
String(0b10);//2
parseInt(0o10);//8
String(0o10);//8
parseInt(012);//10
String(012);//10
//其实现在es6规定了二进制、八进制和十六进制的表示法
//以上三个字符串均先被String()化为字符串再进行解析
```

### 显式转换为布尔值

- 通过全局方法Boolean()强制转换，遵循抽象值操作中的ToBolean

- !!进行强制转换，遵循抽象值操作中的ToBolean


## 隐式强制类型转换

### 隐式强制类型转换为字符串

 - 一元运算符加号（+）首先把非基本类型通过ToPrimitive抽象操作转换为基本类型，如果加号中的两项有一项是字符串，另一项则进行ToString操作，进行字符串拼接，如果是布尔值加数字，则对布尔进行ToNumber操作再求和

```
const a = 1;
console.log(a + true);//2
//等同于
console.log(a + Number(true));//2

console.log([1, 2] + [1, 2]); //1,21,2
//等同于
console.log([1, 2].toString() + [1, 2].toString()); //1,21,2


console.log({} + []);//[object Object]
console.log([] + {});//[object Object]
console.log({}.toString());//[object Object]
console.log([].toString());//''
```

- 隐式强制类型转换为数字，通过一元运算符-、/、*转换，遵循ToNumber的抽象值操作规则

```
console.log('3.14' - '0');//3.14
console.log([2] - [1]);//1
//等同于
console.log([2].toString() - [1].toString());//1
```
                       

### 隐式强制类型转换为布尔值

以下均遵循ToBolean抽象值操作

- if(..)语句中的条件判断表达式

- for(..;..;..)语句的第二个条件判断表达式

- while(..)和do..while(..)的条件判断表达式

- ?:中的条件判断表达式

- 逻辑运算符||和&&左边的操作数（a||b等同于a?a:b，a&&b等同于a?b:a）

### 符号的强制类型转换

Symbol不能被强制转换为数字（显式和隐式都会产生错误），但可以被强制转换为布尔值（显式和隐式结果都为true）

## 宽松相等和严格相等

> ==允许在相等的比较中进行强制类型转换，===则不能允许，并不是==检查值是否相等，===检查值和类型是否相等

### 严格相等的两种特殊情况

- NaN不等于NaN；

- +0等于-0；

### 宽松相等之间的隐式转换

1.字符串和数字之间的相等比较

- (1) 如果 Type(x) 是数字，Type(y) 是字符串，则返回 x == ToNumber(y) 的结果。 

- (2) 如果 Type(x) 是字符串，Type(y) 是数字，则返回 ToNumber(x) == y 的结果。

```
const [a, b] = ['42', 42];
console.log(a == b);//true
//等同于
console.log(Number(a) === b);//true

console.log(b == a);//true
//等同于
console.log(Number(a) === b);//true
```

2.其他类型和布尔类型之间的比较

- (1) 如果 Type(x) 是布尔类型，则返回 ToNumber(x) == y 的结果。

- (2) 如果 Type(y) 是布尔类型，则返回 x == ToNumber(y) 的结果。

```
const [a, b] = [true, 1];
console.log(a == b);//true
//等同于
console.log(Number(a) === b);//true

console.log(b == a);//true
//等同于
console.log(b === Number(a));//true

const [c, d] = [false, 0];
console.log(c == d);//true
//等同于
console.log(Number(c) === d);//true

console.log(d == c);//true
//等同于
console.log(d === Number(c));//true

console.log('true' == true);//false
//等同于
console.log('true' === 1);//false
```

3.null和undefined之间的相等比较，规范规定null和undefined宽松相等

```
console.log(null == undefined);//true
```

4.对象和非对象之间（包括数字、字符串；其中布尔遵循其他类型和布尔类型之间的比较）的相等比较

- 如果Type(x)是字符串或者数字，Type(y)是对象，则返回x == ToPromitive(y)的结果；

- 如果Type(x)是对象，Type(y)是字符串或者数字，则返回ToPromitive(x) == y的结果；
```
const [x, y] = [['42'], 42];
console.log(x == y);//true
//等同于
console.log(x.toString() == y);//true

const x1 = 'abc';
const y1 = new String(x1);
console.log(x1 == y1);//true
//等同于
console.log(x1 == y1.valueOf());//true
```

5.一些特殊情况
```
const [x, y, z] = [undefined, null, NaN];
console.log(x == Object(x) );//false
console.log(y == Object(y) );//false
//等同于
console.log(x == Object() );//false
console.log(y == Object() );//false

console.log(z == Object(z) );//false
//等同于
console.log(z == new Number(z) );//false

//由于Objec(undefined)和Object(null)没有对应的封装对象，所以不能够被封装，
//Objec(undefined)和Object(null)均返回常规对象，等同于Object()
//Object(NaN)等同于new Number(NaN)， NaN==NaN返回false
```

6.假值的相等比较

```
null == '0';//false
null == false;//false
null == '';//false
null == 0;//false

undefined == '0';//false
undefined == false;//false
undefined == '';//false
undefined == 0;//false

null == undefined;//false
//null只会与undefined宽松相等


'0' == false;//true ---特殊
'0' == NaN;//false
'0' == 0;//true
'0' == '';//false

false == NaN;//false
false == 0;//true
false == '';//true ---特殊
false == [];//true ---特殊
false == {};//false

'' == NaN;//false
'' == 0;//true ---特殊
'' == [];//true
'' == {};//false

0 == NaN;//false
0 == [];//true ---特殊
0 == {};//false
0 == '\n';//true ---特殊
```

7.抽象关系比较>、<、≥、≤

- 如果双方都是字符串，则按照字母顺序进行比较

- 如果双方是其他情况首先调用ToPrimitive转换为基本类型

- 如果转换的结果出现非字符串，则根据ToNumber规则强制转换为数字进行比较

```
const a = [42];
const b = ['43'];

console.log(a < b);//true
//ToPrimite转换
console.log(a.toString() < b.toString());
//按照字母顺序判断
console.log('42' < '43');//true

const a1 = ['42'];
const a2 = ['043'];
console.log(a1 > a2);//true
``` 

- 关于对象关系比较的奇怪现象

```
var a = { b: 42 };
var b = { b: 43 };
a < b;  // false
a == b; // false
a > b;  // false
a <= b; // true
a >= b; // true
```

按理两边对象都会进行ToPrimitive抽象值操作，转换为[object object]应该相等，但是结果却并非如此，具体原理参考[ECMAScript5规范11.8节](https://yanhaijing.com/es5/#192)


8.原理巩固

- 如何让a==2&&a==3？
```
const a = new Number('something');
let i = 2;
Number.prototype.valueOf = ()=>i++;
console.log(a == 2 && a == 3);//true
```

- [] == ![]为何为true？

![]首先转换为false, [] == false符合上面的假值相等


- '' == [null]为何为true？

[null]进行ToPrimitive强制类型转换为''

9.安全运用隐式强制类型转化

- 如果两边的值中有true或者false，千万不要使用==

- 如果两边的值中有[]、''或者0，尽量不要使用==

- 最安全的方式可以通过typeof判断