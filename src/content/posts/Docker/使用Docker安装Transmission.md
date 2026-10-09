---
title: 使用Docker安装Transmission
date: 2019-12-01T00:00:00.000Z
slug: docker-transmission
categories:
  - Docker
tags:
  - Docker
  - Transmission
---
## 摘要

Transmission是Linux下常用的PT工具，但是其命令行版本还是挺劝退的，但是如果使用Docker就可以秒部署了，本文介绍如何在Linux下使用Docker来运行BT工具Transmission。

<!-- more --> 

## 安装

```shell
docker pull linuxserver/transmission
```

### 启动

```shell
docker create \
  --name=transmission \
  -e PUID=0 \
  -e PGID=0 \
  -e TZ=Europe/London \
  -e TRANSMISSION_WEB_HOME=/transmission-web-control/ `#optional` \
  -e USER=username `#你的用户名` \
  -e PASS=password `#你的密码` \
  --net=host \
  -v /ssd-raid/transmission/config-dir:/config \
  -v /wolf1/transmission/download-dir:/downloads \
  -v /wolf1/transmission/watch-dir:/watch \
  --restart unless-stopped \
  linuxserver/transmission:latest
```

是不是特别简单！然后通过http://ip:9091 就能访问控制面板了

注意这里和其他教程不一样的地方是使用了`--net=host`，这样可以直接使用主机的网络，不然在使用`ipv6`时会发生很多问题：首先，docker默认不配置`ipv6`；其次，docker的ipv6配置比较难搞，至少我搞了一晚上没搞定，直接用host的网络模式了。
