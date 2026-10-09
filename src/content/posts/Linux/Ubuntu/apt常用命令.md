---
title: apt常用命令
date: 2019-02-22T00:00:00.000Z
slug: apt-common-commands
categories:
  - Linux
  - Ubuntu
tags:
  - Linux
  - Ubuntu
---
## 摘要

Ubuntu中用于安装/卸载软件的apt命令有很多子命令，下面是常用命令的介绍

<!-- more --> 

## 查询已安装软件
```shell
apt list --installed
```
## 卸载软件
摘自：[https://blog.csdn.net/wsygdxg1989/article/details/79169174](https://blog.csdn.net/wsygdxg1989/article/details/79169174 "https://blog.csdn.net/wsygdxg1989/article/details/79169174")
apt-get的卸载相关的命令有remove/purge/autoremove/clean/autoclean等。具体来说：

### `apt-get purge / apt-get –purge remove`
删除已安装包（不保留配置文件)。
如软件包a，依赖软件包b，则执行该命令会删除a，而且不保留配置文件

### `apt-get autoremove`
删除为了满足依赖而安装的，但现在不再需要的软件包（包括已安装包），保留配置文件。

### `apt-get remove`
删除已安装的软件包（保留配置文件），不会删除依赖软件包，且保留配置文件。

### `apt-get autoclean`
APT的底层包是dpkg, 而dpkg 安装Package时, 会将 *.deb 放在 /var/cache/apt/archives/中，apt-get autoclean 只会删除 /var/cache/apt/archives/ 已经过期的deb。

### `apt-get clean`
使用 apt-get clean 会将 /var/cache/apt/archives/ 的 所有 deb 删掉，可以理解为 rm /var/cache/apt/archives/*.deb。

那么如何彻底卸载软件呢？ 
具体来说可以运行如下命令：
```shell
# 删除软件及其配置文件
apt-get --purge remove <package>
# 删除没用的依赖包
apt-get autoremove <package>
```

## 查看安装包版本
```shell
apt-cache policy [package name]
```
