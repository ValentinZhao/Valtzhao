---
category: 前端
tags:
  - 基础
date: 2019-06-25
title: 前端基础——JavaScript篇
---

作为前端，吃饭的家伙必须得玩溜了

<!-- more -->

> 这不是一篇面向小白的帖子，它更适合有JavaScript编程经验但希望对自己的这方面内容进行查缺补漏的工程师。关于HTML和CSS的总结篇有空再来补。

# JavaScript基本类型和引用类型
`JavaScript`中一个变量可以存放两种类型的值：`基本类型`和`引用类型`。

**基本类型**
- `Boolean`
- `Null`
- `Undefined`
- `Number`
- `String`
- `Symbol` (`ECMAScript 6`新定义)，符号类型是`唯一的`并且是`不可修改的`

**引用类型**
- `Object`

## 基础类型
基本类型的值是按值访问
### 基本类型的值是不可变的
```javascript
var str = '123hello321'
str.toUpperCase() // 123HELLO321
console.log(str) // 123hello321
```
### 基本类型的比较是它们的值的比较
不同类型之间也可以比较，因为做了`隐式转换`。涉及隐式转换最多的两个运算符` +` 和 `==`。

隐式转换中主要涉及到三种转换：

将值转为原始值，`toPrimitive()`。
将值转为数字，`toNumber()`。
将值转为字符串，`toString()`。 

#### 通过`toPrimitive`将值转换为原始值
`ToPrimitive(input, PreferredType?)`，`input`是要转换的值，`PreferredType`是可选参数，可以是 `Number` 或 `String` 类型。他只是一个转换标志，转化后的结果并不一定是这个参数所值的类型，但是转换结果一定是一个原始值（或者报错）。如果 `PreferredType` 被标记为 `Number`，那么先是调用 `valueOf` 方法，如果返回值是原始值则结束；否则重新调用 `toString` 方法，如果是原始值则结束，不然就会抛出 `TypeError` 异常。
如果 `PreferredType `被标记为` String`，那么先是调用` toString `方法，如果返回值是原始值则结束；否则重新调用` valueOf `方法，如果是原始值则结束，不然就会抛出 `TypeError` 异常。(两者相反)

> `valueOf()`：返回最适合该对象类型的原始值；<br>`toString()`: 将该对象的原始值以字符串形式返回。

>没有` PrefferedType` 时，按照下面规则：如果该对象为` Date `类型，则 `PreferredType `被设置为` String`；否则，`PreferredType` 被设置为 `Number`。

#### 通过` toNumber `将值转换为数字
| 参数   |      结果      |
|----------|:-------------:|
|undefined|  NaN |
| null |    +0   |
| 布尔值|	true 转为 1，false 转为 |
|字符串	|能解析则变为数字，否则 NaN|
|对象|	先 `toPrimitive(input, Number)`，再` toNumber`|

#### 通过` toString `将值转换为字符串
| 参数   |      结果      |
|----------|:-------------:|
|undefined|	‘undefined’|
|null|	‘null’|
|布尔值|	true 转为 ‘true’，false 转为 ‘false’|
|数字|	直接转，NaN 变为 ‘NaN’|
|对象|	先 `toPrimitive(input, Number)`，再` toNumber`|

```javascript
console.log({} + {}) //"[object Object][object Object]"

//需要转换为原始类型，且没有指定 PrefferedType，所以优先 ToNumber
//{}.valueOf() 结果还是 {}
//继续用ToString，{}.toString() 结果为 "[object Object]"
```
```javascript
console.log(2 * {}) //NaN

//* 只能在 number 上运算，所以 PerfferedType 为 Number，ToPrimitive({}, Number)
//{}.valueOf() 结果还是 {}，继续 ToString
//{}.toString() 结果为 "[object Object]"
//再将 "[object Object]" 转为 Number，结果为 NaN
//最后 2*NaN 结果还是 NaN
```
#### `==` 运算符时隐式转换规则
1. `x,y` 为 `null`、`undefined `两者中一个 // 返回 `true`
2. `x、y`为 `Number` 和` String` 类型时，则转换为` Number` 类型比较。
3. 有` Boolean` 类型时，`Boolean` 转化为` Number` 类型比较。
4. 一个` Object `类型，一个` String` 或` Number` 类型，将` Object` 类型进行原始转换后，按上面流程进行原始值比较。

```javascript
const a = {
  i: 1,
  toString: function() {
    return a.i++
  }
}
if (a == 1 && a == 2 && a == 3) {
  //会打印
  console.log('hello world!')
}
```
### 基本类型的变量是存放在栈内存（Stack）里的
```javascript
var a, b
a = 'zyj'
b = a
console.log(a) // zyj
console.log(b) // zyj
a = '呵呵' // 改变 a 的值，并不影响 b 的值
console.log(a) // 呵呵
console.log(b) // zyj
```
栈内存中包括了变量的标识符和变量的值。
![](http://cdn.valtzhao.com/img/js_primitive_type_stack.png)

## 引用类型
除了 `6` 种基本数据类型外，还要剩下的引用类型，即 `Object` 类型。细分的话，有：`Object` 类型、`Array` 类型、`Date` 类型、`RegExp` 类型、`Function` 类型 等。

引用类型的值是按引用访问的。

- 引用类型的值是可变的
```javascript
var obj = { name: 'zyj' } // 创建一个对象
obj.name = 'percy' // 改变 name 属性的值
obj.age = 21 // 添加 age 属性
obj.giveMeAll = function() {
  return this.name + ' : ' + this.age
} // 添加 giveMeAll 方法
obj.giveMeAll()
```
- 引用类型的比较是引用的比较
```javascript
var obj1 = {} // 新建一个空对象 obj1
var obj2 = {} // 新建一个空对象 obj2
console.log(obj1 == obj2) // false
console.log(obj1 === obj2) // false
```
- 引用类型的值是保存在`堆内存（Heap）`中的`对象（Object）`
与其他编程语言不同，`JavaScript `不能直接操作对象的内存空间（堆内存）。
```javascript
var a = { name: 'percy' }
var b
b = a
a.name = 'zyj'
console.log(b.name) // zyj
b.age = 22
console.log(a.age) // 22
var c = {
  name: 'zyj',
  age: 22
}
```

# JavaScript原型链
关于 `JavaScript` 中的原型链，以及` __proto__` 与 `prototype` 之间的关系，直接看一张图：
![](http://cdn.valtzhao.com/img/js-prototype.jpeg)

```javascript
function Person() {}

var person = new Person()

console.log(person.__proto__ === Person.prototype) //true

console.log(Person.prototype.constructor === Person) //true

console.log(Person.__proto__ === Function.prototype) //true

console.log(Function.prototype.__proto__ === Object.prototype) //true

console.log(Function.__proto__ === Function.prototype) //true

console.log(Object.prototype.__proto__ === null) //true

console.log(Object.__proto__ === Function.prototype) //true
```

## 总结
1. 一个对象的` __proto__` 指向它构造函数的` prototype`(有特殊情况)
2. `__proto__` 的末尾是` Object.prototype.__proto__`，指向` null`
3. 原型的构造函数就是对象的构造函数

> 特殊情况：对象由 `Object.create `函数创建：
```javascript
var person1 = {
  name: 'person1'
}
var person2 = Object.create(person1)
console.log(person2.__proto__ === person1) //true
```

## 属性查找
当我们读取一个属性的时候，如果在实例属性上找到了，就读取它，不会管原型属性上是否还有相同的属性，这其实就是属性屏蔽。

但是如果在实例属性上没有找到的话，就会在实例的原型上去找，如果原型上还没有，就继续到原型的原型上去找，直到尽头(`Object.prototype`)。

如何检测一个属性存在于实例中，还是原型中？

使用方法 `hasOwnProperty`,属性只有存在于实例中才会返回` true`:
```javascript
function Person() {}
Person.prototype.prototypeName = 'prototype name'
var person1 = new Person()
// 实例属性
person1.name = 'J'
person1.hasOwnProperty('name') // true
person1.hasOwnProperty('prototypeName')//false
```
而` in `操作符和 `Object.keys() `都会返回所有属性，包括原型链上的属性。

## Javascript如何实现继承？
1. 构造继承
2. 原型继承
3. 实例继承
4. 拷贝继承

> 红宝书中又有6种继承方法，不过这样看来有点`四种”茴“字`的感觉了...
> 
> 1. 原型链继承, 2. 借用构造函数继承, 3. 组合继承(原型+借用构造), 4. 原型式继承, 5. 寄生式继承, 6. 寄生组合式继承

> 这边直接贴两个继承的实现方式
>
> 1. [构造函数的继承](http://www.ruanyifeng.com/blog/2010/05/object-oriented_javascript_inheritance.html)
>
> 2. [非构造函数的继承](http://www.ruanyifeng.com/blog/2010/05/object-oriented_javascript_inheritance_continued.html)

# JavaScript一些重要知识点梳理
## JavaScript中的`this`
`JavaScript` 中的 `this `是一个相对复杂的概念，不是简单几句能解释清楚的。粗略地讲，**函数的调用方式**决定了` this` 的值。`this `取值符合以下规则：

1. 在调用函数时使用` new `关键字，函数内的` this `是一个全新的对象
2. 如果 `apply`、`call` 或 `bind `方法用于调用、创建一个函数，函数内的 `this` 就是作为参数传入这些方法的对象
3. 当函数作为对象里的方法被调用时，函数内的 `this `是调用该函数的对象。比如当 `obj.method()` 被调用时，函数内的 `this` 将绑定到 `obj `对象
4. 如果调用函数不符合上述规则，那么` this `的值指向全局对象`（global object）`。浏览器环境下 `this` 的值指向` window `对象，但是在`严格模式下('use strict')`，`this `的值为` undefined`
5. 如果符合上述多个规则，则较高的规则`（1 号最高，4 号最低）`将决定` this` 的值
6. 如果该函数是 `ES2015 `中的箭头函数，将忽略上面的所有规则，`this `被设置为它被创建时的上下文。[具体查看](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this)

### 总结
1. `this`总是指向函数的直接调用者（而非间接调用者）

2. 如果有`new`关键字，`this`指向`new`出来的那个对象

3. 在事件中，`this`指向触发这个事件的对象，特殊的是，`IE`中的`attachEvent`中的`this`总是指向全局对象`window`

### `new`操作符具体干了什么呢?
1. 创建一个空对象，并且 `this` 变量引用该对象，同时还继承了该函数的原型
2. 属性和方法被加入到 `this` 引用的对象中
3. 新创建的对象由 `this` 所引用，并且最后隐式的返回 `this` 

### Javascript作用链域
全局函数无法查看局部函数的内部细节，但局部函数可以查看其上层的函数细节，直至全局细节。 当需要从局部函数查找某一属性或方法时，如果当前作用域没有找到，就会上溯到上层作用域查找， 直至全局函数，这种组织形式就是作用域链。

```javascript
var obj  = {};

obj.__proto__ = Base.prototype;

Base.call(obj);
```

> 什么是`IIFE`？
>
> IIFE(Immediately Invoked Function Expressions)代表立即执行函数。 `JavaScript `解析器将 `function foo(){ }(); `解析成 `function foo(){ } `和 `();`。其中，前者是函数声明；后者（一对括号）是试图调用一个函数，却没有指定名称，因此它会抛出` Uncaught SyntaxError: Unexpected token `的错误。修改方法：
> `(function foo(){ })() `和 `(function foo(){ }())`。
> 可能会用到 `void` 操作符：`void function foo(){ }();`，但是返回值是 `undefined`。

## `null`、`undefined`和未声明变量
当你没有提前使用 `var`、`let` 或 `const` 声明变量，就为一个变量赋值时，该变量是`未声明变量（undeclared variables）`。未声明变量会脱离当前作用域，成为全局作用域下定义的变量。在严格模式下，给未声明的变量赋值，会抛出 `ReferenceError `错误。

> 注意` null == undefined`，但是 `null !== undefined`

## 判断数据类型
一般有以下方式：

- `typeof`，返回对象的基础数据类型(除了 `null`，因为是 `Object` 类型；多加一个` function`)(`boolean`,`number`,`string`,`object`,`undefined`,`function`, `es6` 的 `symbol`)是何种，小写
- `instanceof`，一般用来判断引用类型，不是所有浏览器都支持这个语法
- `Object.prototype.toString.call(object)`，**通用的方法**，返回 `[object + 类型]`，这里的类型首字母大写，如 `Object`

> 注意 `NaN` 是 `number` 类型，`null` 是` Object `类型。判断数组可以` Array.isArray(arr)`，判断 `NaN `可以 `isNaN(num)`。

## `功能检测（feature detection）`、`功能推断（feature inference）`和 `UA `字符串
### 功能检测
功能检测包括确定浏览器是否支持某段代码，以及是否运行不同的代码（取决于它是否执行），以便浏览器始终能够正常运行代码功能，而不会在某些浏览器中出现崩溃和错误。例如：

```javascript
if ('geolocation' in navigator) {
  // 可以使用 navigator.geolocation
} else {
  // 处理 navigator.geolocation 功能缺失
}
```

### 功能推断
功能推断与功能检测一样，会对功能可用性进行检查，但是在判断通过后，还会使用其他功能，因为它假设其他功能也可用，例如：
```javascript
if (document.getElementsByTagName) {
  element = document.getElementById(id)
}
```

非常不推荐这种方式。功能检测更能保证万无一失。

### `UA` 字符串
这是一个浏览器报告的字符串，它允许网络协议对等方（network protocol peers）识别请求用户代理的应用类型、操作系统、应用供应商和应用版本。它可以通过 `navigator.userAgent `访问。 然而，这个字符串很难解析并且很可能存在欺骗性。例如，`Chrome `会同时作为 `Chrome `和 `Safari` 进行报告。因此，要检测 `Safari`，除了检查` Safari `字符串，还要检查是否存在 `Chrome `字符串。不要使用这种方式。

## 变量提升
变量提升`（hoisting）`是用于解释代码中变量声明行为的术语。使用 `var(let 是没用的) `关键字声明或初始化的变量，会将声明语句“提升”到当前作用域的顶部。 但是，只有声明才会触发提升，赋值语句（如果有的话）将保持原样。我们用几个例子来解释一下。
```javascript
// 用 var 声明得到提升
console.log(foo) // undefined
var foo = 1
console.log(foo) // 1

// 用 let/const 声明不会提升
console.log(bar) // ReferenceError: bar is not defined
let bar = 2
console.log(bar) // 2
```
函数声明会使函数体提升，但函数表达式（以声明变量的形式书写）只有变量声明会被提升。
```javascript
// 函数声明
console.log(foo) // [Function: foo]
foo() // 'FOOOOO'
function foo() {
  console.log('FOOOOO')
}
console.log(foo) // [Function: foo]

// 函数表达式
console.log(bar) // undefined
bar() // Uncaught TypeError: bar is not a function
var bar = function() {
  console.log('BARRRR')
}
console.log(bar) // [Function: bar]
```

## `attribute` 和 `property`
`Attribute` 是在 `HTML` 中定义的，而 `property` 是在 `DOM` 上定义的。为了说明区别，假设我们在 `HTML` 中有一个文本框：`<input type="text" value="Hello">`。`Attribute` 只有通过初始 `HTML` 中设置或者 `setAttribute` 方法设置才能改变。

```javascript
const input = document.querySelector('input')
console.log(input.getAttribute('value')) // Hello
console.log(input.value) // Hello
```
但是在文本框中键入 “ World!”后:

```javascript
console.log(input.getAttribute('value')) // Hello
console.log(input.value) // Hello World!
```

> 注意，除了 `value` `property` 外(`setAttribute('value', [value]`) 会影响 `input.value`，但是 `input.value = [value] `并不会更改 `attribute`)，其他的 `attribute` 或 `property` 更改的时候会同时改变另外一个。

## `load` 事件和 `DOMContentLoaded` 事件
当初始的 `HTML` 文档被完全加载和解析完成之后，`DOMContentLoaded` 事件被触发，而无需等待样式表、图像和子框架的完成加载。

`window` 的 `load` 事件仅在 `DOM` 和所有相关资源全部完成加载后才会触发。

- `DOMContentLoaded`:所有 `HTML` 已经加载完，`DOM `树也构建完，但是额外的资源还没有加载完，如` CSS` 和`图片`。
- `load(window.onload)`:所有资源都加载完了
- `beforeunload/unload`:用户离开页面

### 另外
`<script>` 有 `src` 且有 `defer` 或者` async` 属性的不一样。

|                  |                                  async                                 |                           defer                          |
|:----------------:|:----------------------------------------------------------------------:|:--------------------------------------------------------:|
|     执行顺序     |        不阻塞渲染，一旦下载完立即执行，和在 `DOM` 中的顺序无关。       | 等待 `DOM` 解析完才执行，且执行顺序和 `DOM `中顺序相同。 |
| DOMContentLoaded | 可能发生在 `DOMContentLoaded` 之前，前提是文档够长，且脚本够小执行快。 |         要等到 `DOMContentLoaded `结束才会执行。         |

## 什么是window对象? 什么是document对象?

`window`对象是指浏览器打开的窗口。` document`对象是`documentd`对象（HTML 文档对象）的一个`只读引用`，`window`对象的一个属性。

## 柯里化
柯里化`（currying）`是一种模式，其中具有多个参数的函数被分解为多个函数，当被串联调用时，将一次一个地累积所有需要的参数。

```javascript
function curry(fn) {
  //保留参数合并结果
  let args = []

  let curried = function() {
    if (arguments.length === 0) {
      return fn.apply(this, args)
    } else {
      args.push(...arguments)
      return curried
    }
  }

  return curried
}

let addCurry = curry(function() {
  let sum = 0
  for (let i in arguments) {
    sum += arguments[i]
  }
  return sum
})

console.log(addCurry(1)(2)(3)(4)()) //10
```

## 什么是闭包（Closure），为什么要用它？
闭包是指有权访问另一个函数作用域中变量的函数，创建闭包的最常见的方式就是**在一个函数内创建另一个函数**，通过另一个函数访问这个函数的局部变量,利用闭包可以突破作用链域，将函数内部的变量和方法传递到外部。

闭包的特性：

1. 函数内再嵌套函数
2. 内部函数可以引用外层的参数和变量
3. 参数和变量不会被垃圾回收机制回收



## 事件委托
事件委托就是将子元素的监听事件移动到父元素，这样只用添加一个监听，在子元素非常多的时候有用。

**事件委托是发生在冒泡阶段的，不然捕获阶段是从外到内过程，这个时候拿不到子元素。**

且监听的事件是存储在堆中的，**记得手动移除！**而内联的事件不用移除，因为节点移除之后绑定在上面的监听事件就没有引用持有了，垃圾回收时会将其回收。

## 箭头函数与普通函数的不同
- `this `的指向为创建时上下文
- 没有 `arguments`
- `call` 和` apply` 绑定` this` 没有用
- 不能使用` new` 操作符
- 没有 `prototype`
- 不能作为构造函数

## 禁用鼠标点击
- `CSS` 方法(**最常用**)
pointer-events: none
- `HTML`
`disabled` 设置为` true`，一般只对按钮有作用
- `JS`
取消所有的监听事件，或者在监听事件中判断是否需要禁用点击事件再 `event.preventDefault();event.stopPropagation()。`

## `CommonJS` `AMD` `CMD` `UMD` 规范
- `CommonJS`
根据 `CommonJS` 规范，一个单独的文件就是一个模块。每一个模块都是一个单独的作用域，也就是说，在一个文件定义的变量（还包括函数和类），都是私有的，对其他文件是不可见的。

`CommonJS` 是同步的，而 `AMD` 和 `CMD` 是异步的。
- AMD(Asynchromous Module Definition)

`AMD` 是 `RequireJS` 在推广过程中对模块定义的规范化产出。
`AMD` 异步加载模块。它的模块支持对象、函数、构造器、字符串、`JSON` 等各种类型的模块。
适用 `AMD` 规范适用 `define` 方法定义模块。
`AMD` 运行时核心思想是「Early Executing」，也就是提前执行依赖。
- CMD(Common Module Definition)
`CMD` 是 `SeaJS` 在推广过程中对模块定义的规范化产出。
- UMD(Universal Module Definition)
`umd` 是 `AMD` 和 `CommonJS` 的糅合。
先判断是否支持 `AMD`（通过判断 define 是否存在），存在则使用 `AMD` 方式加载模块。再判断是否支持 `Node.js` 的模块（exports）是否存在，存在则使用 `Node.js` 模块模式。如果两个都不存在，那么可能就使用全局变量来定义了(一般根据传入的 `root`，可能是执行的 `this`)。

## `offsetWidth/offsetHeight`,`clientWidth/clientHeight`与`scrollWidth/scrollHeight`的区别
- `offsetWidth/offsetHeight`返回值包含content + padding + border，效果与`e.getBoundingClientRect()`相同

- `clientWidth/clientHeight`返回值只包含content + padding，如果有滚动条，也不包含滚动条

- `scrollWidth/scrollHeight`返回值包含content + padding + 溢出内容的尺寸

![element-size](http://cdn.valtzhao.com/img/element-size.png)

## 什么是Cookie隔离？
或者说：请求资源的时候不要让它带cookie怎么做？

如果静态文件都放在主域名下，那静态文件请求的时候都带有的`cookie`的数据提交给`server`的，非常浪费流量， 所以不如隔离开。
因为`cookie`有域的限制，因此不能跨域提交请求，故使用非主要域名的时候，请求头中就不会带有`cookie`数据， 这样可以**降低请求头的大小**，**降低请求时间**，从而达到**降低整体请求延时**的目的。

同时这种方式不会将`cookie`传入`Web Server`，也减少了`Web Server`对`cookie`的处理分析环节， 提高了`http`请求的解析速度。 `cookie`虽然在持久保存客户端数据提供了方便，分担了服务器存储的负担，但还是有很多局限性的。

每个特定的域名下最多生成`20`个`cookie`。

`cookie`的最大大约为`4096`字节，为了兼容性，一般不能超过`4095`字节。

### Cookie优缺点
- 优点：极高的扩展性和可用性
  - 通过良好的编程，控制保存在`cookie`中的`session`对象的大小
  - 通过加密和安全传输技术（SSL），减少`cookie`被破解的可能性
  - 只在`cookie`中存放不敏感数据，即使被盗也不会有重大损失
  - 控制`cookie`的生命期，使之不会永远有效。偷盗者很可能拿到一个过期的`cookie`
- 缺点
  - `cookie`数量和长度的限制。每个`domain`最多只能有`20`条`cookie`，每个`cookie`长度不能超过`4KB`，否则会被截掉
  - 安全性问题。如果`cookie`被人拦截了，那人就可以取得所有的`session`信息。即使加密也与事无补，因为拦截者并不需要知道`cookie`的意义，他只要原样转发`cookie`就可以达到目的了
  - 有些状态不可能保存在客户端。例如，为了防止重复提交表单，我们需要在服务器端保存一个计数器。如果我们把这个计数器保存在客户端，那么它起不到任何作用

## Javascript延迟加载的方式有哪些？
`defer`和`async`、动态创建DOM方式（用得最多）、按需异步载入`Javascript`
1. 异步加载的方案： 动态插入`script`标签

2. 通过`ajax`去获取`Javascript`代码，然后通过`eval`执行

3. `script`标签上添加`defer`或者`async`属性

4. 创建并插入`iframe`，让它异步执行`Javascript`

5. 延迟加载：有些`Javascript`代码并不是页面初始化的时候就立刻需要的，而稍后的某些情况才需要的

## Javascript同源策略？
同源策略是客户端脚本（尤其是Javascript）的重要的安全度量标准。它最早出自`Netscape Navigator2.0`，其目的是防止某个文档或脚本从多个不同源装载。

这里的同源策略指的是：`协议`，`域名`，`端口`相同，同源策略是一种安全协议。指一段脚本只能读取来自同一来源的窗口和文档的属性。

### 为什么要有同源限制？
> 比如一个黑客程序，他利用`iframe`把真正的银行登录页面嵌到他的页面上，当你使用真实的用户名，密码登录时，他的页面就可以通过`Javascript`读取到你的表单中`input`中的内容，这样用户名，密码就轻松到手了。

### 如何解决跨域？
[直接看我的文章](http://valtzhao.com/posts/2019/06/21/frontend-ntwk.html#%E8%B7%A8%E5%9F%9F%E8%A7%A3%E5%86%B3%E6%96%B9%E5%BC%8F)


## `Ajax` 是什么? 如何创建一个`Ajax`？
`Ajax`的全称：`Asynchronous Javascript And XML`。 异步传输+js+xml。 所谓异步，在这里简单地解释就是：向服务器发送请求的时候，我们不必等待结果，而是可以同时做其他的事情，等到有了结果它自己会根据设定进行后续操作，与此同时，页面是不会发生整页刷新的，提高了用户体验。

```javascript
const xmlHttp = new XMLHttpRequest();

xmlHttp.open('GET','demo.php','true');

xmlHttp.send()

xmlHttp.onreadystatechange = function(){

    if(xmlHttp.readyState === 4 & xmlHttp.status === 200){

    }

}
```

### `XMLHttpRequest`的常用方法
- `readyState`: 表示请求状态的整数，取值：
  - `UNSENT（0）`：对象已创建
  - `OPENED（1）`：open()成功调用，在这个状态下，可以为xhr设置请求头，或者使用send()发送请求
  - `HEADERS_RECEIVED(2)`：所有重定向已经自动完成访问，并且最终响应的HTTP头已经收到
  - `LOADING(3)`：响应体正在接收
  - `DONE(4)`：数据传输完成或者传输产生错误
- `onreadystatechange`：`readyState`改变时调用的函数

其他部分自行查阅[MDN-XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)

### `Ajax` 解决浏览器缓存问题？
1. 在`ajax`发送请求前加上 `anyAjaxObj.setRequestHeader("If-Modified-Since","0")`
2. 在`ajax`发送请求前加上 `anyAjaxObj.setRequestHeader("Cache-Control","no-cache")`
3. 在`URL`后面加上一个随机数： `"fresh=" + Math.random();`
4. 在`URL`后面加上时间搓：`"nowtime=" + new Date().getTime();`
5. 如果是使用`jQuery`，直接这样就可以了 `$.ajaxSetup({cache:false})`。这样页面的所有`ajax`都会执行这条语句就是不需要保存缓存记录

## 函数的防抖(debounce)和节流(throttle)

### 防抖
防抖的作用是使得某操作在一段时间后才被触发。比如点击事件，加上防抖之后，连续点击多次只会在最后停止点击后延迟timeout的时间才会被触发一次，实现如下
```javascript
function debounce (callback, wait) {
    let timeout = null;
    return function () {
        let context = this;
        let args = arguments;
        let later = () => callback.call(context, args);
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    }
}

const myEfficientFn = debounce(function() {
	console.log('CLICKED');
}, 250);

window.addEventListener('click', myEfficientFn);
```
需要注意的是我们一般在**Event Handler**中使用`debounce`，那么就需要给`handler`返回一个方法，所以一开始就要知道`debounce`是一个**闭包**；其次就是注意先`clear`掉`timeout`再注册就能实现**不断点击只执行最后一次**的效果

### 节流
节流的作用是规定某个方法在**一定时间**内只能执行**规定次数**
```javascript
function throttle (callback, times, limit) {
    let count = 0;
    setInterval(function () { count = 0 }, limit);
    return function () {
        let context = this;
        let args = arguments;
        let fn = function () {
            callback.call(context, args);
            count++;
        }
        if (count < times) fn();
    }
}

const myEfficientFn = throttle(function() {
	console.log('CLICKED');
}, 3, 1000);

window.addEventListener('click', myEfficientFn);
```
所以精髓也是很简单，就是首先设置一个`interval`，根据你给的`limit`时间来定时重置`count`，在时间内，当次数小于规定次数时就执行方法就好了，最后记得整个`throttle`也是一个**闭包**。

## JavaScript与装饰器
```javascript
function doSomething(name) {
  console.log('Hello, ' + name);
}

function loggingDecorator(wrapped) {
  return function() {
    console.log('Starting');
    const result = wrapped.apply(this, arguments);
    console.log('Finished');
    return result;
  }
}

const wrapped = loggingDecorator(doSomething);
```

```javascript
doSomething('Graham');
// Hello, Graham

wrapped('Graham');
// Starting
// Hello, Graham
// Finished
```
用以增强函数或者类的功能的函数，也就是说装饰器的前提是**它是一个纯函数**

### React HOC
React HOC本身也是一个纯函数，它接受一个组件返回一个增强或者说赋予了公共逻辑的组件，这就是装饰器的思想

```javascript
interface ConnectProps {
  mode: ToolModeEnum;
  action_switch_action: typeof action_switch_action;
};
export interface HOCProps extends ConnectProps {}
interface OptionInterface {
  currentMode: ToolModeEnum;
  mapDispatchToProps?: any;
  mapStateToProps?:Function;
}
export function withConnection(WrappedComponent, option: OptionInterface) {
  class ComponentwithListener extends React.Component<HOCProps> {
    constructor(props: HOCProps) {
      super(props);
      bindAll(this, [
        'switch_rect_mode',
      ]);
    }

    shouldComponentUpdate(nextProps: ConnectProps) {
      if (nextProps.mode !== option.currentMode && this.props.mode !== option.currentMode) {
        return false;
      }
      return true;
    }
    private switch_rect_mode() {
      this.props.action_switch_action(option.currentMode);
    }
    render() {
      return <WrappedComponent switch_rect_mode={this.switch_rect_mode} {...this.props} />
    }
  }

  const mapStateToProps = (state: ReduxState) => (Object.assign({}, {
    mode: state.painter_state.mode,
  }, option.mapStateToProps && (option.mapStateToProps(state) || {})))

  const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators(
    Object.assign({}, { action_switch_action }, option.mapDispatchToProps || {}),
    dispatch,
  )
  return connect(mapStateToProps, mapDispatchToProps)(ComponentwithListener) as any;
}
```
然后在使用时是这样
```javascript
export default withConnection(RectModeContainer, {
  currentMode: ToolModeEnum.RectMode
});
```
这样就可以得到增强组件了

### React HOC与装饰器
那么既然如此我们就很容易想到把HOC写成装饰器的模式。由于我们的React组件是基于类的，所以我们写的也是类装饰器，先来熟悉类装饰器

```javascript
/**
* 也就是说当你想要为Decorator传入参数时需要用到二阶函数
* 原因在于Decorator自己是个函数
* 所以当你想把传入的参数用上的时候你就要把这个参数给到一个新方法中
* 并把新方法返回，由此可推三阶四阶
**/

function superman_decoration = is_superman => target => {
    target.is_superman = is_superman;
}

@superman_decoration(true)
class Superman {}

console.log(Superman.is_superman) // true
```

那么我们在写React的组件的时候其实是一样的，我们写一个装饰器
```javascript
export function painter_mode_hoc(options:OptionInterface) {
  return function (WrappedComponent:any) {
    class ComponentwithListener extends React.Component<HOCProps> {
      constructor(props: HOCProps) {
        super(props);
        bindAll(this, [
          'switch_rect_mode',
        ]);
      }
  
      shouldComponentUpdate(nextProps: ConnectProps) {
        if (nextProps.mode !== options.currentMode && this.props.mode !== options.currentMode) {
          return false;
        }
        return true;
      }
      private switch_rect_mode() {
        this.props.action_switch_action(options.currentMode);
      }
      render() {
        return <WrappedComponent switch_rect_mode={this.switch_rect_mode} {...this.props} />
      }
    }
  
    const mapStateToProps = (state: ReduxState) => (Object.assign({}, {
      mode: state.painter_state.mode,
    }, options.mapStateToProps && (options.mapStateToProps(state) || {})))
  
    const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators(
      Object.assign({}, { action_switch_action }, options.mapDispatchToProps || {}),
      dispatch,
    )
    return connect(mapStateToProps, mapDispatchToProps)(ComponentwithListener) as any;
  }
}
```
也就是我们同样写一个二阶函数，这个函数返回一个函数，闭包返回新组件，我们使用的时候就是
```javascript
@painter_mode_hoc({currentMode: ToolModeEnum.TriangleMode,})
export default class TriangleModeContainer extends React.PureComponent<ConnectProps, {}> {
  private tool:any;
  componentWillReceiveProps(nextProps:ConnectProps) {
    if (nextProps.mode === ToolModeEnum.TriangleMode && this.props.mode !== ToolModeEnum.TriangleMode) {
      this.activateTool();
    }

    if (nextProps.mode !== ToolModeEnum.TriangleMode ) {
      this.deactivateTool();
    }
  }
  activateTool() {
    try {
      this.tool = new TriangleTool(
        () => { },
        () => { },
        () => { },
      );
      this.tool.setColorState({
        fillColor: '#f00',
        strokeColor: "#ff0",
        strokeWidth: 2,
      });
      this.tool.activate();
    } catch (e) {
      console.log(e)
    }
  }

  deactivateTool() {
    if (!this.tool) { return; }
    this.tool.remove();
    this.tool = null;
  }

  render() {
    return (
      <SelectMode clickEvent={ this.props.switch_rect_mode }/>
    );
  }
}
```





# 一些值得思考的面试题
像什么数组拍平，数组去重这种入门的就不说了，算法题自己刷lc。这里只收集一些觉得有一定思考深度，跟前端结合较密的题

## 给String对象定义一个repeatify方法？
该方法接收一个整数参数，作为字符串重复的次数，最后返回重复指定次数的字符串，eg.
```javascript
console.log('hello'.repeatify(3));

// hellohellohello
```

解法：
```javascript
String.prototype.repeatify = String.prototype.repeatify || function(times) {
  let str = '';
  for (let i = 0; i < times; i++) {
    str += this;
  }
  return str;
};
```
这题测试开发者对`Javascript`的继承及原型属性的知识，它同时也检验了开发者是否能扩展内置数据类型的方法。

这里的另一个关键点是，看你怎样避免重写可能已经定义了的方法。这可以通过在定义自己的方法之前，检测方法是否已经存在。

## 声明提前
下面这段代码的结果是什么？为什么？
```javascript
function test() {
  console.log(a);
  console.log(foo());
  var a = 1;
  function foo() {
  return 2;
}}
 
test();
```

代码的运行结果：`undefined`和 `2`

理由是，变量和函数的声明都被提前至函数体的顶部，而同时变量并没有被赋值。因此，当打印变量a时，它虽存在于函数体（因为a已经被声明），但仍然是`undefined`。换句话说，上面的代码等同于下面的代码
```javascript
function test() {
  var a;
  function foo() {
  return 2;
  }
  console.log(a);
  console.log(foo());
  a = 1;
}
 
test();
```

## `Javascript`中的`this`
```javascript
var fullname = 'John Doe';
var obj = {
  fullname: 'Colin Ihrig',
  prop: {
    fullname: 'Aurelio De Rosa',
    getFullname: function() {
      return this.fullname;
  }}};
console.log(obj.prop.getFullname());
var test = obj.prop.getFullname;
console.log(test());
```

代码输出：`Aurelio De Rosa` 和 `John Doe`

理由是，`Javascript`中关键字`this`所指代的函数上下文，取决于函数是怎样被调用的，而不是怎样被定义的。

在第一个`console.log()`，`getFullname()`被作为`obj.prop`对象被调用。因此，当前的上下文指代后者，函数返回这个对象的`fullname`属性。相反，当`getFullname()`被赋予`test`变量，当前的上下文指代全局对象`window`，这是因为`test`被隐式地作为全局对象的属性。基于这一点，函数返回`window`的`fullname`，在本例中即为代码的第一行。

## 写一个`Event Emitter`？
```javascript
class Emitter{
  constructor(){
    this.funcs = {}
  }
  on(type, func) {
    if(!this.funcs[type]){
      this.funcs[type] = []
    }
    this.funcs[type].push(func)
  }
  emit(type) {
    if(!this.funcs[type]) {
      return
    }
    this.funcs[type].forEach((func) => {
      func()
    })
  }
}
 
var emitter = new Emitter()
emitter.on('test',() => {
  console.log('aaa')
})
emitter.on('test',() => {
  console.log('bb')
})
emitter.emit('test')
```

