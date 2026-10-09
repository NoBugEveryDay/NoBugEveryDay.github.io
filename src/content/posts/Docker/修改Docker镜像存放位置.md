---
title: 修改Docker镜像存放位置
date: 2019-09-28T00:00:00.000Z
slug: change-docker-image-location
categories:
  - Docker
tags:
  - Docker
---
## 摘要

由于系统盘比较小，而且想把Docker各种镜像存放到一个RAID1的盘，来加强可用性

<!-- more --> 

## 参考

https://www.jianshu.com/p/be707d70ec8e

## 查看当前配置

```shell
[root@nas docker]# docker info | grep "Docker Root Dir"                                                                                                                      
WARNING: bridge-nf-call-iptables is disabled
WARNING: bridge-nf-call-ip6tables is disabled
 Docker Root Dir: /var/lib/docker
```

发现原来的根目录在`/var/lib/docker`准备整个移过去

（那个warning并不清楚发生了什么……）

## 迁移

```shell
systemctl stop docker
cp -r /var/lib/docker/* /ssd-raid/docker-root/
```

## 修改docker启动配置

修改`/usr/lib/systemd/system/docker.service`中的

```shell
ExecStart=/usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock
```

变为

```shell
ExecStart=/usr/bin/dockerd --graph /ssd-raid/docker-root -H fd:// --containerd=/run/containerd/containerd.sock
```

然后重启Docker

```shell
systemctl daemon-reload
systemctl restart docker
```

## 检查配置

```shell
[root@nas docker-root]# docker info | grep "Docker Root Dir"
WARNING: bridge-nf-call-iptables is disabled
WARNING: bridge-nf-call-ip6tables is disabled
 Docker Root Dir: /ssd-raid/docker-root
```

## 实验验证

之后再创建实例，就会发现实例的缓存都被放进了`/ssd-raid/docker-root`，这个目录的大小会有明显变化
