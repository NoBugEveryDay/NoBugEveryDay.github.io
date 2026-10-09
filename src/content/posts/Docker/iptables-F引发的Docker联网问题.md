---
title: iptables -F引发的Docker联网问题
date: 2019-09-19T00:00:00.000Z
slug: docker-iptables-f-issue
categories:
  - Docker
tags:
  - Docker
  - iptables
---
## 摘要

因为要配置ss所以使用`iptables -F`指令，但是没想到不小心炸穿了Docker的网络。

<!-- more --> 

因为Docker也是基于iptables进行流量转发和控制，所以如果执行了`iptables -F`很可能会炸穿Docker的网络，但是似乎只影响Docker对外网的访问，不影响外网访问Docker。

要想恢复，需要执行以下命令

```shell
pkill docker
iptables -t nat -F
ifconfig docker0 down
brctl delbr docker0
docker -d
```
