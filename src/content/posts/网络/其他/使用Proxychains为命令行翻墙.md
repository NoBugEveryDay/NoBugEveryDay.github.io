---
title: 使用Proxychains为命令行挂代理
date: 2019-09-14T00:00:00.000Z
slug: proxychains-cli-proxy
categories:
  - 网络
  - 其他
tags:
  - 网络
  - Proxychains
---
## 摘要

在Linux环境下经常需要在命令行环境下设置代理，在`Shadowsocks`客户端`ss-local`装好了之后，会暴露一个本地端口（默认为1080），将socks5流量发送到这个端口中即可使用`Shadowsocks`代理。`Proxychains`就是这样一个能把命令行的命令所产生的流量全部以socks5的形式发送到`Shadowsocks`的端口中

<!-- more --> 

## 安装

下载官方源码： https://github.com/rofl0r/proxychains-ng/releases 

然后解压

```shell
./configure --prefix=$HOME/
make 
make install
make install-config
```

## 进行配置

`proxychains` 读取配置文件顺序首先是环境变量`PROXYCHAINS_CONF_FILE`所指定的配置文件，然后是当前目录下的 `./proxychains.conf`，之后是 `$HOME/.proxychains/proxychains.conf` 最后是系统目录下的 `/etc/proxychains.conf`

我们希望配置本地 socks5 的代理，可以这样书写

```
[ProxyList]
socks5 127.0.0.1 1080

##1080 是你的本地 socks5 端口
```

## 使用方式

`proxychains4 wget url` 就可以进行使用了，无需对 `wget` 进行额外的配置。

## 参考

https://www.cnblogs.com/wAther/p/10472889.html
