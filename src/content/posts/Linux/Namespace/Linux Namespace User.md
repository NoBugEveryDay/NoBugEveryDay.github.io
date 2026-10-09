---
title: 【转】Linux Namespace User
date: 2019-08-19T00:00:00.000Z
slug: linux-namespace-user
categories:
  - Linux
  - Namespace
tags:
  - Linux
  - Namespace
---
## 摘要

User namespace 是 Linux 3.8 新增的一种 namespace，用于隔离安全相关的资源，包括 **user IDs and group IDs**，**keys**, 和 **capabilities**。同样一个用户的 user ID 和 group ID 在不同的 user namespace 中可以不一样(与 PID nanespace 类似)。换句话说，一个用户可以在一个 user namespace 中是普通用户，但在另一个 user namespace 中是超级用户。

<!-- more --> 

User namespace 可以嵌套(目前内核控制最多32层)，除了系统默认的 user namespace 外，所有的 user namespace 都有一个父 user namespace，每个 user namespace 都可以有零到多个子 user namespace。 当在一个进程中调用 unshare 或者 clone 创建新的 user namespace 时，当前进程原来所在的 user namespace 为父 user namespace，新的 user namespace 为子 user namespace。

说明：本文的演示环境为 ubuntu 16.04。

## 创建 user namespace

我们可以通过 unshare 命令的 --user 选项来创建新的 user namespace：

```bash
$ unshare -user -r /bin/bash
```

![952033-20180812133348283-931737385.png](Linux Namespace User/952033-20180812133348283-931737385.png)

通过 -r 参数，我们把新的 user namespace 中的 root 用户映射到了外面的 nick 用户(接下来会介绍映射相关的概念)。在新的 user namespace 中，root 用户是有权限创建其它的 namespace 的，比如 uts namespace。这是因为当前的 bash 进程拥有全部的 capabilities：

![952033-20180812133427854-544045366.png](Linux Namespace User/952033-20180812133427854-544045366.png)

下面我们创建一个新的 uts namespace 试试：

```bash
$ unshare --uts /bin/bash
```

![952033-20180812133500261-2053538944.png](Linux Namespace User/952033-20180812133500261-2053538944.png)

我们看到，新的 uts namespace 被顺利的创建了。这是因为除了 user namespace 外，**创建其它类型的 namespace 都需要 CAP_SYS_ADMIN 的 capability**。当新的 user namespace 创建并映射好 uid、gid 了之后， **这个 user namespace 的第一个进程将拥有完整的所有 capabilities，意味着它就可以创建新的其它类型 namespace。**

其实没有必要把上面的操作(创建两个 namespace)分成两步，我们可以通 unshare 一次创建多个 namespace：

![952033-20180812133548661-668231418.png](Linux Namespace User/952033-20180812133548661-668231418.png)

在 unshare 的实现中，其实就是传入了 CLONE_NEWUSER | CLONE_NEWUTS，大致如下：
**unshare(CLONE_NEWUSER | CLONE_NEWUTS);**
在上面这种情况下，**内核会保证 CLONE_NEWUSER 先被执行，然后执行剩下的其他 CLONE_NEW\*，这样就使得不用 root 用户而创建新的容器成为可能**，这条规则对于clone 函数也同样适用。

## 理解 UID 和 GID 的映射

在前面的演示中我们提到了用户在 user namespace 之间的映射，下面我们同样通过演示来理解映射是什么。我们先查看下当前用户的 ID 和 user namespace 情况：

![952033-20180812133655212-92150902.png](Linux Namespace User/952033-20180812133655212-92150902.png)

然后执行 unshare --user /bin/bash 命令创建一个新的 user namespace，注意这次没 -r 参数：

```bash
$ unshare --user /bin/bash
```

![952033-20180812133727288-640955460.png](Linux Namespace User/952033-20180812133727288-640955460.png)

在新的 user namespace 中，当前用户变成了 nobody，并且 ID 也变成了 65534。
这是因为我们**还没有映射父 user namespace 的 user ID 和 group ID 到子 user namespace 中**来，这一步是必须的，因为这样系统才能控制一个 user namespace 里的用户在其他 user namespace 中的权限(比如给其它 user namespace 中的进程发送信号，或者访问属于其它 user namespace 挂载的文件)。
如果没有映射，当在新的 user namespace 中用 getuid() 和 getgid() 获取 user ID 和 group ID 时，系统将返回文件 /proc/sys/kernel/overflowuid 中定义的 user ID 以及 proc/sys/kernel/overflowgid 中定义的 group ID，它们的默认值都是 65534。也就是说如果没有指定映射关系的话，会默认会把 ID 映射到 65534。

**下面我们来完成 nick 用户在新的 user namespace 中的映射。**
映射 ID 的方法就是添加映射信息到 /proc/PID/uid_map 和 /proc/PID/gid_map (这里的 PID 是新 user namespace 中的进程 ID，刚开始时这两个文件都是空的)文件中。这两个文件中的配置信息的格式如下(每个文件中可以有多条配置信息)：

```bash
ID-inside-ns ID-outside-ns length
```

比如 0 1000 500 这条配置就表示父 user namespace 中的 1000~1500 映射到新 user namespace 中的 0~500。

对 uid_map 和 gid_map 文件的写入操作有着严格的权限控制，简单点说就是：**这两个文件的拥有者是创建新的 user namespace 的用户，所以和这个用户在一个 user namespace 中的 root 账号可以写**；这个用户自己是否有写 map 文件的权限还要看它有没有 CAP_SETUID 和 CAP_SETGID 的 capability。注意：只能向 map 文件写一次数据，但可以一次写多条，并且最多只能 5 条。
我们把刚才打开的 shell 窗口称为**第一个 shell 窗口**开始执行用户的映射操作(把用户 nick 映射为新 user namespace 中的 root)。
**第一步**，先在**第一个 shell 窗口**中查看当前进程的 ID：

![952033-20180812133836060-814501763.png](Linux Namespace User/952033-20180812133836060-814501763.png)

**第二步**，新打开一个 shell 窗口，我称之为**第二个 shell 窗口**。查看进程 3049 的映射文件属性：

![952033-20180812133909229-1475966336.png](Linux Namespace User/952033-20180812133909229-1475966336.png)

用户 nick 是这两个文件的所有者，让我们尝试向这两个文件写入映射信息：

![952033-20180812133939711-828980199.png](Linux Namespace User/952033-20180812133939711-828980199.png)

看上去很奇怪呀，明明是文件的所有者，却没有权限向文件中写入内容！其实根本的原因在于当前的 bash 进程没 CAP_SETUID 和 CAP_SETGID 的权限：

![952033-20180812134011875-837006315.png](Linux Namespace User/952033-20180812134011875-837006315.png)

下面我们为 /bin/bash 程序设置相关的 capabilities：

```bash
$ sudo setcap cap_setgid,cap_setuid+ep /bin/bash
```

然后重新加载 bash，就可以看到相应的 capabilities 了：

![952033-20180812134039385-768691240.png](Linux Namespace User/952033-20180812134039385-768691240.png)

现在重新向 map 文件写入映射信息：

```bash
$ echo '0 1000 500' > /proc/3049/uid_map
$ echo '0 1000 500' > /proc/3049/gid_map
```

这次的写入成功了。后面就不需要我们手动写入映射信息了，所以我们通过下面的命令把 /bin/bash 的 capability 恢复为原来的设置：

```bash
$ sudo setcap cap_setgid,cap_setuid-ep /bin/bash
```

![952033-20180812134119692-1735937774.png](Linux Namespace User/952033-20180812134119692-1735937774.png)

**第三步**，回到**第一个 shell 窗口**
重新加载 bash，并执行 id 命令：

![952033-20180812134156273-1568788424.png](Linux Namespace User/952033-20180812134156273-1568788424.png)

当前用户已经变成了 root(新的 user namespace 中的 root 用户)。在看看当前 bash 进程具有的 capability：

![952033-20180812134226821-1964970731.png](Linux Namespace User/952033-20180812134226821-1964970731.png)

0000003fffffffff 表示当前运行的 bash 拥有所有的 capability。

**第四步**，在**第一个 shell 窗口**中
查看 /root 目录的访问权限：

![952033-20180812134317374-1734621745.png](Linux Namespace User/952033-20180812134317374-1734621745.png)

没权限啊！尝试修改主机的名称：

![952033-20180812134356259-1197147050.png](Linux Namespace User/952033-20180812134356259-1197147050.png)

依然是没有权限啊！**看来这个新 user namespace 中的 root 用户在父 user namespace 里面不好使。这也正是 user namespace 所期望达到的效果，当访问其它 user namespace 里的资源时，是以其它 user namespace 中的相应用户的权限来执行的，比如这里 root 对应父 user namespace 的用户是 nick，所以改不了系统的 hostname**。
普通用户 nick 没有修改 hostname 的权限，那把默认的 user namespace 中的 root 用户映射为子 user namespace 中的 root 用户后可以修改 hostname 吗？答案是，不行！那是因为**不管怎么映射，当用子 user namespace 的用户访问父 user namespace 的资源的时候，它启动的进程的 capability 都为空，所以这里子 user namespace 的 root 用户在父 user namespace 中就相当于一个普通的用户。**

## User namespace 与其它 namespace 的关系

**Linux 下的每个 namespace，都有一个 user namespace 与之关联，这个 user namespace 就是创建相应 namespace 时进程所属的 user namespace**，相当于每个 namespace 都有一个 owner(user namespace)，这样保证对任何 namespace 的操作都受到 user namespace 权限的控制。这也是为什么在子 user namespace 中设置 hostname 失败的原因，因为要修改的 uts namespace 属于的父 user namespace，而新 user namespace 的进程没有老 user namespace 的任何 capabilities。
以 uts namespace 为例，在 uts_namespace 的结构体中有一个指向 user namespace 的指针，指向它所属的 user namespace(笔者查看的 v4.13内核，uts_namespace 结构体的定义在 /include/linux/utsname.h 文件中)：

![952033-20180812134506481-2054964518.png](Linux Namespace User/952033-20180812134506481-2054964518.png)

其它 namespace 的定义也是类似的。

## 总结

相对其它的 namespace 而言，user namespace 稍显复杂。这是由其功能决定的，涉及到权限管理的内容时，事情往往会变得不那么直观。笔者在本文中也只是介绍了 user namespace 的基本概念，更多丰富有趣的内容还有待大家自行发掘。

**参考：**
[user namespace man page](http://man7.org/linux/man-pages/man7/user_namespaces.7.html)
[Linux Namespace系列（07）：user namespace (CLONE_NEWUSER) (第一部分)](https://segmentfault.com/a/1190000006913195)
[Linux Namespace系列（08）：user namespace (CLONE_NEWUSER) (第二部分)](https://segmentfault.com/a/1190000006913499)
[Namespaces in operation, part 5: User namespaces](https://lwn.net/Articles/532593/)
[Namespaces in operation, part 6: more on user namespaces](https://lwn.net/Articles/540087/)
[Linux capabilities](http://man7.org/linux/man-pages/man7/capabilities.7.html)

------

转自[https://www.cnblogs.com/sparkdev/tag/linux%20namespace/](https://www.cnblogs.com/sparkdev/tag/linux namespace/)
