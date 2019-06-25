---
category: 前端
tags:
  - 博客
  - Vuepress
  - Travis CI
  - Linux
  - 部署
date: 2019-06-10
title: Vuepress + Travis CI 自动化部署详解
---
Vuepress是非常简洁高速的静态网站生成器（SSG）， 但由于每次推代码再到服务器部署实在烦琐，我们就想到了利用CI来触发自动构建，这样一方面使得写博客更纯粹，也让自己变得更极客。

<!-- more -->

# 为什么使用Vuepress

如果你还不了解Vuepress，可以先看看[官方是怎么说的](https://vuepress.vuejs.org/zh/guide/#%E5%AE%83%E6%98%AF%E5%A6%82%E4%BD%95%E5%B7%A5%E4%BD%9C%E7%9A%84%EF%BC%9F)。它就如同于`jkyell`，`hexo`，`gastby`一样可以帮助我们更方便的构建一套适用于浏览器网页的文件系统，但对于我来说，天生基于服务端（Server-side Rendering）构建的高速，优良的搜索引擎优化（Search-Engine Optimization）还有Vue的底层架构都让我很感兴趣，毕竟这就意味着你可以为`Vuepress`自定义你的`Vue组件`，虽然说`jkyell`等也支持自定义页面，但直接写`Vue`还是很爽的。

# Travis CI
CI是持续集成的意思，那么不了解CI的同学可以先出门左转到[这篇阮老师的文章](http://www.ruanyifeng.com/blog/2017/12/travis_ci_tutorial.html)过一遍再回来继续哈！

好，假设这里看完的同学回来了或者你早就熟悉什么是CI。那我个人选用`Travis CI`的原因其实就是`github`用得比较多，我们的博客一般都托管在github的公共仓库，Travis CI对此是`免费`的，再加上有那么多项目采用了这个方案，但是就觉得这么搭配一定很少坑（然而...）

**不管，总之我们就是选定Travis CI了！**

# 自动部署
我们采用`Travis CI + Ubuntu16.04`的构建模式，这里先列一下我的部署前的环境，如果你在实操中遇到了问题可以选择回退/升级到和我一样的配置。我们在这一章先默认你用vuepress生成了一个项目（官方默认仓库的代码就好，我们今天主要是走自动部署的流程），然后我们会从新建`.travis.yml`开始一步一步把这个Vuepress部署到你的服务器上，只要你推了master分支。

## 环境配置
- Github上面有你推好的一个远程仓库
- Ubuntu服务器（这篇文章是针对Ubuntu自动部署来做的）
- 可选：服务器终端连接器，比如`XShell`，你直接用SSH连接也非常好

## 自动部署的宏观流程
- 本地修改仓库代码，推到主分支
- Travis监听到了仓库变动，利用`钩子函数`执行`install`和`script`任务（这些是啥后面会说）
- 任务执行成功后，利用`after_success`钩子函数用SSH`免密登录`服务器
- 在服务器上运行配置好的脚本（比如打包你的文件系统）
- 完成自动部署

## 激活仓库
首先去登陆[Travis CI](https://travis-ci.org/)，这里面的话刚进去会让你选择连接哪个仓库，这时候选你的那个Vuepress仓库即可。那么接下来就是要添加Travis CI的配置文件啦。

## 添加Travis配置
在你的Vuepress工程的`根目录`来创建一个`.travis.yml`的文件，这是用来注册所有Travis工作、生命周期钩子业务等的地方，配置大概像这样：
```yml
# .travis.yml
language: node_js   #前端工程所以是JavaScript，编译环境是node_js
node_js:
- '8'   
branchs:
  only:
  - master  #指定只有检测到master分支有变动时才执行任务
```
这时候其实你已经可以用CI了，你把这份文件推到主分支，回到Travis CI首页你就能发现主分支在自动构建了。

### Travis CI在Linux服务器上自动登录的原理
这里道理我是明白了，有个大佬总结的比我好，虽然篇幅也不短。**当然你完全可以搭完再回来看这段！**
>要想通过Travis在执行服务器得脚本首先得登陆到我们得服务器，但是在Travis不像交互式终端。一般利用用户名和密码登陆是需要输入用户名，密码的，但是Travis里面没有提供与用户交互的界面，当然这也与自动化不符，所以我们只有利用其他方式登陆--SSH免密登陆。
>
>SSH的登陆原理大家可以看这个:[SSH公钥登陆原理](https://link.juejin.im/?target=https%3A%2F%2Fwww.cnblogs.com%2Fscofi%2Fp%2F6617394.html)。大概过程就是，在客户端生成一个公钥/私钥对，将公钥内容保存到服务器 ~/.ssh/authorized_keys 中，然后客户端发起连接请求时，服务器发送一个字符串给客户端，客户端用本地的私钥对字符串进行加密然后发送给服务器，服务器将收到的加密字符串用公钥解密，如果能解密成功就登陆成功。
>
>这里的公钥/私钥对就是登陆的关键，我们不能直接操作Travis服务器，在上面生成公钥/私钥对，所以按照上面正常的流程就走不通，这时候就需要让Travis伪装成一个受信的客户端去连接。也就是我们需要有一对公钥/私钥对，公钥已经保存在我们的Linux服务器中，私钥保存在某个Travis能访问到的地方，在必要的时候用这个私钥去连接服务器，这里我们可以把私钥放在Git代码仓库中，**但是直接把私钥放代码中不安全**，所以Travis提供了对私钥进行加密的功能，我们可以把私钥加密之后放在代码仓库，在登陆的时候Travis解密该私钥用于连接。

## 搭建免密登录
首先据上文所言，我们需要一套SSH密钥对用来验证身份。在生成这套密钥工具前，我们先要确保自己在服务器上创建了一个新用户，拥有sudo权限这样才能方便的进行后面的操作，毕竟直接用root会引发很多问题，拓展性也不好。其实还有更深层次的原因，就是root用户一般最好还是利用密码来获取权限因为被人盗了免密登录然后删库跑路就不好了，并且root免密登录也是要额外做配置的以及各方面，所以就新建个Linux用户咯，我们从这里开始。

### 新建用户
那么新建用户就一步一步的来，我们不着急新建用户命令；先创造**用户空间**，再**建用户**然后再**转交权限**是一个比较符合逻辑，操作起来也简洁的方案
- 创建用户根目录和`.ssh`路径
```bash
# 如果没有用户根目录，这一条命令就会同时创建用户根目录和.ssh路径了
mkdir -p /home/${user-name}/.ssh
```
- 制作`authorized_keys`文件
```bash
touch /home/${user-name}/.ssh/authorized_keys
```
- 创建用户
```bash
useradd -d /home/${user-name} ${user-name}
```
- **给这个用户root权限，作用后面会说到**
```bash
usermod -aG sudo mynewuser
# 这条命令如果不成功，试试下面这个
sudo usermod -aG sudo mynewuser
```
- 给定权限，尤其是`.ssh`和`authorized_keys`的权限码<span style="color: red"><b>一定要完全跟我一致！！</b></span>
```bash
chown root:root /home/${user-name}

# 给定用户:用户组什么路径文件/文件夹的所有权，只有获得所有权，之后拉代码过来才能和客户端保持一致
chown -R ${user-name}:${user-name} /home/${user-name}

chmod 700 /home/${user-name}/.ssh

# 这里有人给644，注意Ubuntu16.04上644太高了，给到600
chmod 600 /home/${user-name}/.ssh/authorized_keys
```
- 给你的新用户设置个密码，这个之后在安装Ruby的流程中还是会用到，然后我们可以在配置中取消掉密码认证，**当然这些配置和说明我都会给出，放心跟我搞**
```bash
passwd ${user-name}
```
- **注意**，在创建用户的过程中，如果碰到`Permission Denied`都可以在前面加上`sudo`来解决，当然如果你跟着走的话，这时候你的用户已经有root用户组权限了大概是不用的

到这新用户创建就完成了，你的用户根目录下的`.ssh`和`.ssh/authorized_keys`的创建者和所属用户组都应该是`${user-name}`，比如像这样:
```bash
ls ~/.ssh/ -al

# 输出（部分），你只需要检查用户 用户组是不是你的用户名
...
-rw------- 1 ${user-name} ${user-name}  405 Mar  6 20:40 authorized_keys
...
```

### 生成密钥对
创建完用户我们自然是要赶紧登陆先，使用这个命令
```bash
su ${user-name}

# 用下面的命令进入用户根目录
cd ~
```
接下来就是生成这个密钥对，也就是凭证了，记得按照这样生成.ssh的路径，**不要设置passphase**
```bash
ssh-keygen -t rsa

....
Generating public/private rsa key pair.
Enter file in which to save the key (/home/${user-name}/.ssh/id_rsa): 
Created directory '/home/${user-name}/.ssh'.
Enter passphrase (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in /home/${user-name}/.ssh/id_rsa.
Your public key has been saved in /home/${user-name}/.ssh/id_rsa.pub.
# ...下面一个fingerprint图
```
好，这波又在`.ssh`下面生成了新东西，我们查看下文件所有者（如果此时所有者不对，可以尝试使用`chown`方法来修改，但按照我的流程来是不会错）
```bash
ls ~/.ssh/ -al

drwx------ 2 ${user-name} ${user-name} 4096 Mar  6 20:12 .
drwx------ 3 ${user-name} ${user-name} 4096 Mar  6 20:12 ..
-rw------- 1 ${user-name} ${user-name} 1675 Mar  6 20:12 id_rsa
-rw------- 1 ${user-name} ${user-name}  405 Mar  6 20:12 id_rsa.pub
# ...还有其他的文件
```
接下来是要把生成的公钥放在服务器上，以便于到时候我们接到私钥了进行比对，关于公钥存放是有固定的位置的，那就是我们先前创建的`.ssh/authorized_keys`文件里面，我们执行
```bash
# 注意此时，包括上面的操作是不需要sudo命令的，尤其是这个authorized_keys文件，必须是用户的，否则无法授信
cat id_rsa.pub >> authorized_keys

# authorized_keys文件内容类似这样
ssh-rsa  *************centos
```
### 测试SSH公私钥连接登录
在`.ssh`下面创建一个`config`文件，这个是用来配置本机作为SSH服务端的一些属性，总之运行：
```bash
vim ~/.ssh/config

# config文件内容
Host test # 主机称谓自己起，用来连接ssh作为主机名的
HostName 99.99.99.99(你的服务器ip)
#登陆的用户名
User ${user-name}
# 只允许使用认证文件进行身份验证
IdentitiesOnly yes
# 允许使用公钥来匹配私钥登录验证
PubkeyAuthentication yes
#登陆使用的密钥
IdentityFile ~/.ssh/id_rsa
```
这时候在命令行直接使用ssh登录
```bash
ssh test

# 下面应该有一些提示了
The authenticity of host '${your-ip}' can't be established.
ECDSA key fingerprint is XXXXX.
Are you sure you want to continue connecting (yes/no)? yes
Login...应该出现你刚登录这台主机的样子
```
这时候我们再查查，看看`.ssh`下面的文件和路径的所有者及用户组
```bash
drwx------ 2 ${user-name} ${user-name} 4096 Mar  6 20:40 .
drwx------ 3 ${user-name} ${user-name} 4096 Mar  6 20:38 ..
-rw-rw-r-- 1 ${user-name} ${user-name}  405 Mar  6 20:40 authorized_keys
-rw-rw-r-- 1 ${user-name} ${user-name}   91 Mar  6 20:38 config
-rw------- 1 ${user-name} ${user-name} 1675 Mar  6 20:12 id_rsa
-rw------- 1 t${user-name} ${user-name}  405 Mar  6 20:12 id_rsa.pub
```
## 搭建Travis客户端
这里有一个很恶心的依赖链搞了我一天，那就是：`Travis`客户端需要`gem`来装，后者是`Ruby`的管理工具。那要先装Ruby，就得先装RVM。

### 更新下下载工具
```bash
sudo apt-get update 
```
遇到安装包的情况都会需要root权限的。接下来，我们安装git和和curl， RVM的安装和使用需要使用到它们，还有build-essential用来编译Ruby。
```bash
sudo apt-get install -y build-essential git-core curl
sudo apt-get install -y ruby-dev
```
这时候你想直接装rvm还不行，由于Ubuntu16.04上面的`gnupg`包落后一版，所以这时候还得把坑填上：
- 首先安装`gnupg2`
```bash
sudo apt install gnupg2
```
- 再按照上面直接安装ruby时候的报错要求，把这句也执行
```bash
gpg2 --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 7D2BAF1CF37B13E2069D6956105BD0E739499BDB
```
这时候大概就好了，我们继续前面的工作，如果rvm显示安装成功一定要记住**更新配置文件**
```bash
# 实际的配置文件路径会有所出入，请一定要以RVM安装完成后的提示中的路径命令来执行
source /home/${your-username}/.rvm/scripts/rvm

# 检测rvm装好了没
rvm version

rvm 1.29.3 (master) by Michal Papis, Piotr K...
```
接下来安装Ruby，这时候如果直接搞命令不成功，`Permission Denied`了的话，直接用`sudo`，这里是没关系的
```bash
rvm install ruby

# check version
ruby --version

ruby 2.4.1p111 (2017-03-22 revision 58053)...
```
然后我们需要给ruby安装镜像源，再去下载`gem包管理工具`。毕竟这个还是在外网，代理还是要配一下，不然网络太慢太卡
```bash
gem sources --add https://gems.ruby-china.com/ --remove https://rubygems.org/

# https://gems.ruby-china.com/ added to sources
# https://rubygems.org/ removed from sources

gem sources -l
# *** CURRENT SOURCES ***
#
# https://gems.ruby-china.com/
```

终于可以下travis了
```bash
gem install travis
```
这个时候会有一个问题就是会提示在当前用户安装travis会提示没权限，这时候可以`切换回root用户`再次执行上述命令，travis是谁装上的没有关系。主要是要记得`装完之后要把用户切回你的用户`。当然装完之后，直接运行一下`travis`命令来验证是否真正被安装过了。

## 添加加密私钥至代码仓库
### 准备仓库代码
**NOTE: 这一步一定要保证所有操作都是在自己的用户下的**

首先我们把自己的代码克隆到用户的家目录`/home/${user-name}`下面，进入项目根目录，然后我们用自己的github的账号密码来登录travis
```bash
travis login
```
登陆成功后解密私钥，--add参数会把加密的私钥解密命令插入到.travis.yml，Travis解密时要用到的
```bash
travis encrypt-file ~/.ssh/id_rsa --add
```
这时候就会生成`id_rsa.enc`，这个就是你的**加密后的私钥了**，同时这时候再去检查你的`.travis.yml`文件，会发现插入了一段`before_install`的钩子，这就是每次构建之前要做的脚本
```yml
before_install:
- openssl aes-256-cbc -K $encrypted_****_key -iv $encrypted_****_iv
  -in id_rsa.enc -out ~/.ssh/id_rsa -d
```
关于这段钩子函数的解释，我直接引用一下了哈
> 解释下解密命令中 -in 和 -out 参数:
>
>-in 参数指定待解密的文件，位于仓库的根目录(Travis执行任务时会先把代码拉到Travis自己的服务器上，并进入仓库更目录)
>
> -out 参数指定解密后的密钥存放在Travis服务器的~/.ssh/id_rsa，如果你的后面需要的话可以取这个路径，我看到网上有的SSH登陆方式用到了这个文件

### 配置after_success钩子函数
在刚才的`before_install`的钩子函数之后，我们补一个`after_success`的钩子函数，意思是连接成功部署之后要做的操作，我写的是
```yml
after_success:
- chmod 600 ~/.ssh/id_rsa   #还是Linux文件权限问题
- ssh blog@${your-ip} -o StrictHostKeyChecking=no 'cd ~/Valtzhao && git pull && npm install && npm run build'
```
这样其实就是进入服务器之后，进入我的项目目录，安装并且打包，由于是静态博客我们build之后就可以直接访问到了

# 验证自动部署
验证这一步就是最轻松的了，毕竟我们做这一套就是为了省去重复的劳动。我们在本地拉下来最新的代码，自己做些修改然后再push到master上面，登录Travis主页来看Deploy Log，这个地方就不详细讲啦，大概是没什么问题了~

# 最后一步
那么我们现在已经可以通过CI的方式把代码自动打包成静态资源，但是作为Web服务器，你需要服务器服务才能通过HTTP请求来请求到这个资源，也就是说得有人给你提供HTTP服务。这就需要我们在服务器上起相关的Web服务啦，那么老生常谈用的最多的就是`Apache`，你肯定听过，但是这个对我们来说太重，我们只需要使用社区很火热的`Nginx`即可。

## 安装Node、npm
是的，先不着急起服务，我们先要搞定编译环境，毕竟我们的自动部署最后也只不过是进入规定的路径然后`npm run build`，生成了一套静态资源而已。那么如果想要成功在我们的服务器上面编译，相关环境和依赖肯定要准备好，这一点跟你在本地开发是一样的。首先是安装`Nodejs`（**下面的命令先别敲！**）
```bash
sudo apt-get update
sudo apt-get install nodejs
```
这样装的是默认的`4.x`版本的Node，还是不太行，笔者个人比较习惯使用`8.11.6`的Node版本，坑比较少
```bash
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install npm
```
这时候就可以去你的项目根目录下来build看看能不能成功

## 安装Nginx
安装nginx是非常简单的，上面笔者也说了自己的环境是`Ubuntu 16.04`哈，下面的命令我们都基于这个发行版来写。首先就是安装nginx咯
```bash
sudo apt-get install nginx
```
一般来说nginx被下载安装过后就会直接启动了，我们可以用查看它的运行情况
```bash
service nginx status

# 或者直接在进程里面找

ps -ef | grep nginx

# 另一种方式

cat nginx.pid # 2xxxx
```

这时候当然还不够，如果你想快点看到自己的成果比如下面这个东西
![](https://image-static.segmentfault.com/374/292/3742927826-5982c11d50d21_articlex)
那你就可以直接用我下面的流程，装完nginx之后会有一个给你放配置文件的地方
```bash
cd /etc/nginx/conf.d/
```
在这里我们创建自己的配置，比如我的站点叫`valtzhao`，那我就
```bash
vim valtzhao-website.conf
```
你可以先复制粘贴我的配置稍加修改就能用了，这里说明一下`root`参数，要指定到你的静态资源的位置，那么比如`vuepress`生成的`dist`包在`.vuepress`下，那这时候它的目录大概就是`/home/${user-name}/${repo-name}/.vuepress/dist`。最后一个需要万分注意的是，**nginx配置语句都是要分号结尾的**
```
server {
  server_name valtzhao.com; // 你的域名或者 ip
  root /home/${user-name}/${repo-name}/.vuepress/dist; // 你的克隆到的项目路径
  index index.html; // 显示首页
  location ~* ^.+\.(jpg|jpeg|gif|png|ico|css|js|pdf|txt){
    root /home/${user-name}/${repo-name}/.vuepress/dist;
  } // 静态文件访问
}
```

## 释放你的80端口
这时候其实服务已经好了，但你很有可能在浏览器输入你的网站URL之后还是不断地在loading，然后超时，为啥呢？这很有可能是你的服务器设置了80端口保护，还未启动。那我们从域名配置开始说好了。这时候假设你的服务器服务搭好了，域名也过备案了，这时候你只需要在域名解析处添加一个`A记录`，它用来把一个`ipv4`地址映射到一个域名上，这时候根据你的运营商的教程来做就好。

### 设置安全组
这时候你需要设置你的安全组，假设你是用的阿里云ECS，那么找到安全组设置，为安全组添加这样的端口开启设置
![](http://cdn.valtzhao.com/img/80-secur-g-settings.png)
这样就给自己的服务器打开了80端口的防火墙，接下来我们去主机里面设置一下就可以了

### 主机内的设置
首先检查一下自己的80端口是怎样的状态，是不是被占用了
```bash
netstat -an | grep 80

# 以下结果是正常被监听的
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN
```

如果你已经启用 UFW（Ubuntu 预装防火墙），则需要放行 TCP 80 端口或 HTTP 服务：运行命令`ufw allow 80/tcp`或`ufw allow http`。返回结果为`Rule added`表示已经放行 TCP 80 端口或 HTTP 服务。

# 参考资料
> [使用 Travis CI 实现 GitHub + Server 自动部署](https:/blog.lbinin.com/frontEnd/Git/Travis-CI.html#travis-ci)</br></br>
> [Travis-CI自动化测试并部署至自己的CentOS服务器](https://juejin.im/post/5a9e1a5751882555712bd8e1)</br></br>
> [Linux chown改变文件所属关系命令](https://blog.51cto.com/zhaodongwei/1768576)</br></br>
> [在Ubuntu上创建正确用户的步骤](https://www.digitalocean.com/community/questions/ubuntu-16-04-creating-new-user-and-adding-ssh-keys)</br></br>
> [Ubuntu安装rvm](https://my.oschina.net/kelby/blog/193035)</br></br>
> [安装rvm的坑，gunpg装不上没法装rvm，要更新成gnupg2](https://stackoverflow.com/questions/44555760/cant-install-ruby-rvm-on-ubuntu-16-04-due-to-gpg-bug)</br></br>
> [拿Nginx 部署你的静态网页](https://segmentfault.com/a/1190000010487262)</br></br>
> [检查 TCP 80 端口是否正常工作](https://www.alibabacloud.com/help/zh/faq-detail/59367.htm)