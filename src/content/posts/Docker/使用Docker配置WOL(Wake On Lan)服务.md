---
title: 使用Docker配置WOL(Wake On Lan)服务
date: 2022-04-25T00:00:00.000Z
slug: docker-wol-service
categories:
  - Docker
tags:
  - Docker
  - WOL
---
## 摘要

本文介绍如何配置一个WOL(Wake On Lan)服务的web端，来实现访问一个网站即可控制远程电脑开机

<!-- more --> 

## 配置BIOS

首先你的网卡/主板要支持网卡唤醒的功能，并且要设置为开启状态，这个配置过程各有不同，在这里不做介绍

##  配置web服务

```shell
docker run -d \
    --net=host \
    --env PORT=8002 \
    --name=wol \
    chishin/wol-go-web
```

这里`8002`是http服务的端口，可以[使用Docker配置反向代理](/Docker/使用Docker配置反向代理/)来套一层https加密和认证登录，以防止外人来随便开你的电脑

然后直接访问这个网页的界面提示如下：

```
WOL唤醒工具
API: 192.168.211.1:8002/wol
Params:
  mac  : 需要唤醒的MAC地址（必须）,
  ip   : 指定IP地址（默认：255.255.255.255）,
  port : 唤醒端口（默认：9）,
  time : 请求时间戳（配合授权验证使用）,
  token: 授权Token = MD5(key + mac + time)（必须存在key的情况下才有效，否则忽略。）,
```

随后直接访问 http://192.168.211.1:8002/wol?mac=your_mac 即可远程开机。注意这里`your_mac`要替换为你要唤醒电脑网卡的mac地址

## 常见问题

我遇到的问题是：如果关机后短时间内远程唤醒是可以的，但是隔一个小时之后就不行了。

这里我在win10中设置取消“启用快速启动”就好了（虽然我其实想要远程唤醒的系统是linux）

![step1.png](使用Docker配置WOL(Wake On Lan)服务/step1.png)

## 参考

https://hub.docker.com/r/chishin/wol-go-web

https://blog.csdn.net/sean908/article/details/109174695

https://www.cxyzjd.com/article/weixin_44607961/89136069
