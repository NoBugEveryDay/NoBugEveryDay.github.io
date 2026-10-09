---
title: 使用Docker安装frp
date: 2020-09-27T00:00:00.000Z
slug: docker-frp
categories:
  - Docker
tags:
  - Docker
  - frp
---
## 摘要

frp是一个好用的内网穿透工具，本文介绍如何通过Docker搭建frp来穿透内网，使得能直接ssh进内网。更多高级用法请参考官方教程。

<!-- more --> 

官方教程：https://gofrp.org/docs/

## 服务端配置

服务端需要部署在拥有公网ip的机器上

```shell
docker pull snowdreamtech/frps

docker run -d \
--restart=unless-stopped \
-p 7000:7000 \
-p 6000:6000 \
-v /root/manager/frp/frps.ini:/etc/frp/frps.ini \
--name frps \
snowdreamtech/frps
```

其中`/root/manager/frp/frps.ini`内容为

```ini
[common]
bind_port = 7000
authentication_method = token
token = password # 这里设置密码防止被别人蹭
```

其中`7000`是用来给客户端连接的，而`6000`是在客户端配置能穿透到内网的端口

## 客户端配置

客户端部署在需要被穿透的机器上

```shell
docker pull snowdreamtech/frpc

docker run -d \
--restart=unless-stopped \
-v /ssd-raid/frp/frpc.ini:/etc/frp/frpc.ini \
--name frpc \
snowdreamtech/frpc
```

其中`/ssd-raid/frp/frpc.ini`内容为

```ini
[common]
server_addr = 39.108.100.133
server_port = 7000
authentication_method = token
token = password # 这里设置密码防止被别人蹭

[ssh]
type = tcp
local_ip = 192.168.1.2
local_port = 22
remote_port = 6000
```

其中`[ssh]`中的字符将作为这个连接的名称，可以在服务端的logs中看到，因此在有多个客户端的情况下，改下这里的名字可以容易区分，来进行debug
