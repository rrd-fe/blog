# 打开TypeScript之门

## 前言

熟悉JavaScript的朋友们一定知道，JavaScript是一门松散类型（[Loosely typed](https://medium.com/@xiaoyunyang/javascript-is-a-loosely-typed-language-meaning-you-dont-have-to-specify-what-type-of-information-137408d54fc7)）语言，这就意味类型转换在我们coding中无处不在（当然这对new comer是很友好的）。

一个简单的例子

```
function add(num) {
    return num + 1
}

add('100'); // '1001'
```
add函数的是为了让number类型的数字+1，但是如果我们在调用该函数的时候意外传入了string类型的值，返回值就变成了string型的'1001'，这显然背离的add函数的初衷。

于是我们可以改写成

```
function add(num) {
    if(typeof num === 'number') {
        return num + 1;
    } else {
        throw new Error('请传入number类型的参数');
    }
}

add(1); // 2
add('23'); // throw error

```

这样写看上去也没问题，但是想想，我们只有当add函数运行时(runtime)才会抛出异常。有没有更好的方法能让我们在coding的过程就发现这些问题呢？

答案就是TypeScript。
> TypeScript is a typed superset of Javascript that compiles plain JavaScript.

上面的函数使用ts的写法如下。

```
function add(num: number): number {
    return num + 1
}
add(1); // 2
add('100'); // error tips when we are coding.
```
我们定好了add只接受number类型的参数，只返回number类型的参数，这样使得函数变得更加严谨很严谨，也约束了add有我们预期的输入和输出。

与我们熟悉的Babel一样，TypeScript最终会将代码通过tsc工具转换成es5或者es6的语法，使得代码能正常的运行。


## 类型

我们都知道Javascript中有基本数据类型undefined, null, string, number, boolean和复杂数据类型Object。使用Typescript的一个重要目的就是为变量的类型施加约束。
基本数据类型的约束很简单，在变量名称后面使用: [type]的方式即可完成。
TS的类型检查只是在编译阶段生效，在运行时就算类型检查不通过的地方也不会报错，只是为了让我们写代码的每一步都更加严谨。
下面我们就一起来看看TS为我们带来了哪些类型约束吧。

#### 基本数据类型

```
let count: number = 1;
let name: string = "bob";
let u: undefined = undefined;
let n: null = null;
let active: boolean = true;
let unusable: void = undefined; // or let unusable: void = null;
```

#### 复杂数据类型
```
let obj: object = {};
// 三种Array类型声明的方式
let list: number[] = [1, 2, 3];
let list: Array<number> = [1, 2, 3];
let x: [string, number] = ['hello', 10];
```

#### 其他数据类型

除了满足JS的数据类型外，TS还提供了许多额外的类型来满足不同的场景。

##### 元组 Tuple
元组类型允许表示一个已知元素数量和类型的数组，各元素的类型不必相同。 比如，你可以定义一对值分别为 string和number类型的元组。

```
// Declare a tuple type
let x: [string, number];
// Initialize it
x = ['hello', 10]; // OK
// Initialize it incorrectly
x = [10, 'hello']; // Error
```

##### 枚举

枚举类型提供的一个便利是你可以由枚举的值得到属性的名字，我们可以通过一个例子来了解枚举类型
```
enum Color {Red, Green, Blue}
let c: Color = Color.Green;
```
编译后
```
var Color;
(function (Color) {
    Color[Color["Red"] = 0] = "Red";
    Color[Color["Green"] = 1] = "Green";
    Color[Color["Blue"] = 2] = "Blue";
})(Color || (Color = {}));

}
/*
    Color = {
        0: "Red",
        1: "Green",
        2: "Blue",
        Red: 0,
        Green: 1,
        Blue: 2
        
    }
*/
```

##### Any

当变量类型不确定时，可以使用any来标记
```
let notSure: any = 4;


let notSure: any = 4;
notSure.ifItExists(); // okay, ifItExists might exist at runtime
notSure.toFixed(); // okay, toFixed exists (but the compiler doesn't check)

let prettySure: Object = 4;
prettySure.toFixed(); // Error: Property 'toFixed' doesn't exist on type 'Object'.

```

##### Void
某种程度上来说，void类型像是与any类型相反，它表示没有任何类型。 当一个函数没有返回值时，你通常会见到其返回值类型是 void：
```
function warnUser(): void {
    console.log("This is my warning message");
}
声明一个void类型的变量没有什么大用，因为你只能为它赋予undefined和null：

let unusable: void = undefined;

```

##### Never

never类型表示的是那些永不存在的值的类型
```
function error(message: string): never {
    throw new Error(message);
}

```

#### 类型断言

可以使用类型断言来告诉编译器这个变量就是这种类型，无需再检查。
类型断言有两种方式，分别为尖括号法和as法。
类型断言被广泛用在程序员赶项目进度的时候。

```
let someValue: any = "this is a string";

let length0: number = someValue.length; // ERROR, 变量类型为any时不一定具有length属性。

let length1: number = (<string>someValue).length; // OK

let length2: number = (someValue as string).length; // OK

```
#### 联合类型
```
let value: string | number = 1;
let value: string | number = 'abc';
```

使用'|'表示逻辑或，使得value可以是string和number中任意一种类型。

## 接口
通过变量类型的约束，可以让我们在变量的声明、赋值、使用更加严谨。typescript还能通过定义接口(interface)来描述对象的属性(property)及特性(attribute)。
#### 接口声明
使用interface关键字来声明一个接口（虽然TS未提供接口的命名规范，但我建议首字母要大写，这样能更好的与实例区分。）

```
interface User {
  name: string;
}

let someUser: User = { name: 'zhangsan' };
let someUser: User = { name: 'zhangsan', age: 16 }; // ERROR
let someUser: User = {}; // ERROR

```
我们定义了User这个接口，约束其必须具有name属性为string类型，当实例不满足接口规定的样子时就会报错。

我们也可以用接口来约束函数

```
interface User {
  name: string;
}

function getName(user: User) {
    return user.name;
}

getName({name: 'zhangsan'});
getName({}); // ERROR
```
在函数中施加接口约束的好处就是我们可以保证传入的值一定含有name属性
```
function getName(user) {
    if(user && typeof user.name === 'string') {
        return user.name;
    } else {
        throw new Error('传入的参数不正确');
    }
}
    
```
这样我们就能在coding的过程中确定
1.调用getName是否传值了。
2.传的值中是否含有string类型的name属性。
#### 可选属性
我们可以在属性前加'？'来定义可选属性
```
interface User {
    name: string;
    age?: number;
}
```
可选属性顾名思义，对可能存在的属性进行预定义；可选属性要么不传，一旦传了就要按照接口定的来。
#### 只读属性
我们也可以定义只读属性，只读属性不可修改

```
interface User {
    name: string;
    readonly age: number;
}

let someUser: User = { name: 'zhangsan', age: 10 };
someUser.age = 15 // ERROR
```

但是对于readonly属性指向复杂类型，只能保证指向的对象不变，对象内容可以发生变化。
#### 额外属性
当我们传入了接口以外的属性时会怎样呢？
```
interface User {
    name?: string;
}

function getName(user: User) {
    return user.name;
}

getName({ age: 10 });
// error: 'age' not expected in type 'User'

```

显然User接口仅定义了可选属性name，我们传递了接口定义以外的属性age，你会得到一个错误。
这个问题有两种解决方案

```
/* 1 */
getName({ age: 10 } as User);
// 使用类型断言

/* 2 */
interface User {
    name?: string;
    [propName: string]: any;
}
// 为接口设置可接受额外的属性，属性值的类型可为任意
```

> 当有额外的属性时，我们最好的方法其实应该是将额外属性加到接口中，而不是想办法绕过他们，这样就背离了定义接口的初衷。

#### 函数类型
接口可以定义函数类型
```
interface GetName{
    (name: string): string;
}

let getName: GetName = function(myName: string): string {
    // 形参的名字可以随意指定，接口只会根据位置判断
    return myName;
}
```

#### 可索引的类型

```
interface StringArray {
  [index: number]: string;
}

let myArray: StringArray;
myArray = ["Bob", "Fred"];

let myStr: string = myArray[0];
```

#### 类类型
我们也可以使用接口给类施加约束，接口定义好成员和方法，在类后面使用implements来规定类应该满足哪个接口。。

```
interface ClockInterface {
    currentTime: Date;
    setTime(d: Date);
}

class Clock implements ClockInterface {
    currentTime: Date;
    setTime(d: Date) {
        this.currentTime = d;
    }
    constructor(h: number, m: number) { }
}

```

#### 接口继承

和类一样，接口也可以相互继承。 这让我们能够从一个接口里复制成员到另一个接口里，可以更灵活地将接口分割到可重用的模块里。
```
interface Shape {
    color: string;
}

interface PenStroke {
    penWidth: number;
}

interface Square extends Shape, PenStroke {
    // 一个接口可以继承多个接口，创建出多个接口的合成接口
    sideLength: number;
}

let square = <Square>{};
square.color = "blue";
square.sideLength = 10;
square.penWidth = 5.0;

```

#### 接口继承类

```
class Control {
    private state: any;
}

interface SelectableControl extends Control {
    select(): void;
}

class Button extends Control implements SelectableControl {
    select() { }
}

class TextBox extends Control {
    select() { }
}

// 错误：“Image”类型缺少“state”属性。
class Image implements SelectableControl {
    select() { }
}

class Location {

}
```

在上面的例子里，SelectableControl包含了Control的所有成员，包括私有成员state。因为 state是私有成员，所以只能够是Control的子类们才能实现SelectableControl接口。因为只有 Control的子类才能够拥有一个声明于Control的私有成员state，这对私有成员的兼容性是必需的。

在Control类内部，是允许通过SelectableControl的实例来访问私有成员state的。 实际上， SelectableControl接口和拥有select方法的Control类是一样的。Button和TextBox类是SelectableControl的子类（因为它们都继承自Control并有select方法），但Image和Location类并不是这样的。


## 类

在ES6之前，JavaScript通过构造函数实现类的概念，使用原型链实现继承。ES6中我们引入了class这一语法糖，现在能真正像其他面向对象语言一样定义一个类了。TypeScript除了实现了所有 ES6 中的类的功能以外，还添加了一些新的用法

#### 基础
快速定义一个类
```
class Person {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
    getName () {
        return this.name;
    }
}

let person = new Person("wcq");
```

#### public
在TypeScript里，成员都默认为 public，即我们可以自由的访问程序里定义的成员 。
当然我们也可以显示的讲一个成员标记成public。

```
class Person {
    public name: string;
    public constructor(name: string) {
        this.name = name;
    }
    public getName () {
        return this.name;
    }
}
```
#### private

当成员被标记成 private时，它就不能在声明它的类的外部访问

```
class Person {
    private name: string;
    public constructor(name: string) {
        this.name = name;
    }
}

new Person("wcq").name; // ERROR，因为name是私有的
```

#### protected

protected修饰符与 private修饰符的行为很相似，但有一点不同，protected成员在子类中仍然可以访问。例如：

```
class Person {
    protected name: string;
    public constructor(name: string) { 
        this.name = name;
    }
}

class Employee extends Person {
    
    public constructor(name: string) {
        super(name)
    }
    
    public getName() {
        return this.name;
    }
}

let person = new Employee("wcq");
console.log(person.name); // 错误
console.log(person.getName()); // wcq

```
注意，我们不能在Person类外使用name，但是我们仍然可以通过Employee类的实例方法访问，因为 Employee是由 Person派生而来的。

#### readonly修饰符
你可以使用 readonly关键字将属性设置为只读的。 只读属性必须在声明时或构造函数里被初始化。
```
class Person {
    readonly name: string;
    constructor (name: string) {
        this.name = name;
    }
}
let person = new Person("wcq");
person.name = "zhangsan"; // ERROR
```

#### 存取器

TS支持使用 getter 和 setter 可以改变属性的赋值和读取行为：
```
class Person {
    constructor(name) {
        this.name = name;
    }
    get name() {
        return 'lisi';
    }
    set name(name) {
        console.log('hello ' + name)
    }
}

let a = new Animal('zhangsan'); // hello zhangsan
a.name = 'wangwu'; // hello wangwu
console.log(a.name); // lisi

```
#### 静态属性
使用 static 修饰符修饰的方法称为静态方法，它们不需要实例化，而是直接通过类来调用：

```
class Person {
    static isPerson(a) {
        return a instanceof Person;
    }
}

let a = new Person('zhangsan');
Person.isPerson(a); // true
a.isPerson(a); // TypeError: a.isAnimal is not a function

```
#### 抽象类
abstract 用于定义抽象类和其中的抽象方法。
```
abstract class Person {
    public name;
    public constructor(name) {
        this.name = name;
    }
    public abstract sayHi();
}

class Student extends Person {
    public sayHello() {
        console.log(`hello ${this.name}`);
    }
    
    // ERROR, 抽象方法sayHi必须在子类实现
}
let person = new Person('lisi'); // ERROR 抽象类不能被实例化
let student = new Student('zhangsan');
```
抽象类有两个特点
1.抽象类是不允许被实例化的。
2.抽象类中的抽象方法必须被子类实现。

#### 把类当做接口使用
类定义会创建两个东西：类的实例类型和一个构造函数。 因为类可以创建出类型，所以你能够在允许使用接口的地方使用类。

```
class Person {
    age: number;
    name: string;
}

interface Student extends Point {
    school: string;
}

let student: Student = {age: 12, name: 'zhangsan', school: 'Beijing School'};

```

## 泛型

#### 介绍
当我们的函数、接口或类不知道具体类型，或者输出类型根据输入类型而定的时候，需要使用泛型来解决。

```
function getValue(value: any): any {
    return value;
}

```

上面这个例子很明显的，value可以传入任意类型的值，输出也为任意类型的值。

这种情况就是泛型大展身手的时候，我们使用泛型对下面例子进行改写

```
function getValue<T>(value: T): T {
    return value;
}

```

我们在函数名后面加了<T>，T可以指代任意输入的类型。这里的T可以换成其他任意字母，只是形式上的指代作用。

也可以传递多个值
```
function swap<T, U>(tuple: [T, U]): [U, T] {
    return [tuple[1], tuple[0]];
}

swap([7, 'seven']); // ['seven', 7]
```
#### 泛型函数
泛型还可以应用在函数中

```
function identity<T>(arg: T): T {
    return arg;
}

let myIdentity: <T>(arg: T) => T = identity;
```

#### 泛型接口
可以定义泛型接口，使得接口的类型保持与输入类型一致
```
interface GenericIdentityFn<T> {
    (arg: T): T;
}

function identity<T>(arg: T): T {
    return arg;
}

let myIdentity: GenericIdentityFn<number> = identity;
```

#### 泛型类
泛型类看上去与泛型接口差不多。 泛型类使用<>括起泛型类型，跟在类名后面。

```
class GenericNumber<T> {
    zeroValue: T;
    add: (x: T, y: T) => T;
}

let myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = function(x, y) { return x + y; };

```

## 枚举

我们使用enum关键字来定义枚举类型，枚举类型能够为一个变量定义一组预定义的常量。变量必须等于为其预定义的值之一。
```
enum Direction {
    NORTH, SOUTH, EAST, WEST
}
console.log(Direction["NORTH"] === 0); // true
console.log(Direction["SOUTH"] === 1); // true
console.log(Direction["EAST"] === 2); // true
console.log(Direction["WEST"] === 3); // true

console.log(Direction[0] === "NORTH"); // true
console.log(Direction[1] === "SOUTH"); // true
console.log(Direction[2] === "EAST"); // true
console.log(Direction[3] === "WEST"); // true
```

枚举成员默认会被赋值为从0开始递增的数字，同时我们也可以使用这个这些数字进行反向映射得到其对应的枚举项。

我们也可以手动给枚举项赋值，手动赋值的时候要避免重复赋值问题，重复赋值后面的会把前面的值给覆盖。

```
enum Direction {
    NORTH = 5, SOUTH, EAST, WEST
}
console.log(Direction["NORTH"] === 5); // true
console.log(Direction["SOUTH"] === 6); // true
console.log(Direction["EAST"] === 7); // true
console.log(Direction["WEST"] === 8); // true

console.log(Direction[5] === "NORTH"); // true
console.log(Direction[6] === "SOUTH"); // true
console.log(Direction[7] === "EAST"); // true
console.log(Direction[8] === "WEST"); // true
```

## 参考

- [TypeScript官方文档](https://www.typescriptlang.org/docs/home.html)
- [TypeScript入门教程](https://ts.xcatliu.com/)

## 扩展阅读


- [高级类型](https://www.tslang.cn/docs/handbook/advanced-types.html)

- [Declare](https://www.tslang.cn/docs/handbook/declaration-files/introduction.html)

- [Symbols](https://www.tslang.cn/docs/handbook/symbols.html)

- [Iterators and Generators](https://www.tslang.cn/docs/handbook/iterators-and-generators.html)

- [Module](https://www.tslang.cn/docs/handbook/modules.html)

- [Namespaces](https://www.tslang.cn/docs/handbook/namespaces.html)

- [Decorators](https://www.tslang.cn/docs/handbook/decorators.html)

- [Mixins](https://www.tslang.cn/docs/handbook/mixins.html)
