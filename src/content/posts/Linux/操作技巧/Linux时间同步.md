---
title: Linux时间同步
date: 2019-10-07T00:00:00.000Z
slug: linux-time-sync
categories:
  - Linux
  - 操作技巧
tags:
  - Linux
  - ntp
---
## 摘要

本文介绍如何使用ntp同步Linux服务器之间的时间。如果时间不同步会到时使用NFS时的make的各种时间报错

<!-- more --> 

## 参考

https://blog.csdn.net/willinge/article/details/79928726

## 步骤

### 安装ntp服务

服务器和客户端都要装

`yum install ntp`

### 服务端配置

更改配置文件`/etc/ntp.conf`

![20180413144739288](linux时间同步/20180413144739288)

1. 注释掉原来的上级时间服务器
2. 把本机设置为时间同步服务器
3. 允许某个子网的客户端访问
4. `systemctl restart ntpd`
5. 如果防火墙没有关闭，要打开防火墙的端口`iptables -I INPUT -p udp --dport 123 -j ACCEPT`

### 客户端配置

#### 一次性同步

这种同步会造成时间突然更改，对于一些应用可能会出bug

`ntpdate [server ip]`

#### 慢慢同步

（这部分没有实践过）

修改`/etc/ntp.conf`中的server，然后重启服务
