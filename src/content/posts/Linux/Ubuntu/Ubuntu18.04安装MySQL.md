---
title: Ubuntu18.04安装MySQL
date: 2019-02-22T00:00:00.000Z
slug: install-mysql-ubuntu1804
categories:
  - Linux
  - Ubuntu
tags:
  - Linux
  - Ubuntu
  - MySQL
---
参照：[https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-18-04](https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-18-04 "https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-18-04")
当我准备向往常一样在Ubuntu上安装MySQL的时候，我首先
```shell
apt-get update
apt-get install mysql-server
```
非常神奇的是竟然没有出现让我设置root密码的界面，就安装好了
随后出现了非系统root用户不能连接MySQL的问题，更不用提远程连接了
后来发现原来是MySQL在安装过程增加了一步，还需要执行
```shell
sudo mysql_secure_installation
```
然后会出现让你设置root密码、是否允许远程登录等设置的交互式命令行
