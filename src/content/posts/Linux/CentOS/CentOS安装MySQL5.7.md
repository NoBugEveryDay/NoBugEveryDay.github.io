---
title: CentOS安装MySQL5.7
date: 2019-05-02T00:00:00.000Z
slug: install-mysql57-on-centos
categories:
  - Linux
  - CentOS
tags:
  - Linux
  - CentOS
  - MySQL
---
## 前言
因为安装seafile需要mysql，所以需要在centos上安装mysql，遇到了一点点坑

<!-- more --> 

## 参考
[CentOS7 64位安装mysql教程，亲测完美](https://blog.csdn.net/a774630093/article/details/79270080 "CentOS7 64位安装mysql教程，亲测完美")
[设置mysql5.7远程连接](https://blog.csdn.net/qiyueqinglian/article/details/52778230 "设置mysql5.7远程连接")

## 安装
1. 先检查系统是否装有mysql
```shell
rpm -qa | grep mysql
```
这里返回空值，说明没有安装
（这里执行`yum install mysql`安装命令是无效的，因为centos-7默认是Mariadb，所以执行以下命令只是更新Mariadb数据库）

2. 下载并安装mysql的repo源
```shell 
wget http://repo.mysql.com/mysql-community-release-el7-5.noarch.rpm
sudo rpm -ivh mysql-community-release-el7-5.noarch.rpm
```
安装这个包后，会获得两个mysql的yum repo源：`/etc/yum.repos.d/mysql-community.repo`，`/etc/yum.repos.d/mysql-community-source.repo`。
3. 安装mysql
```shell
# sudo yum install mysql-server
```
如果报错，内容含有
```shell
Error: Package: mysql-community-libs-5.6.35-2.el7.x86_64 (mysql56-community)
           Requires: libc.so.6(GLIBC_2.17)(64bit)
Error: Package: mysql-community-server-5.6.35-2.el7.x86_64 (mysql56-community)
           Requires: libc.so.6(GLIBC_2.17)(64bit)
Error: Package: mysql-community-server-5.6.35-2.el7.x86_64 (mysql56-community)
           Requires: systemd
Error: Package: mysql-community-server-5.6.35-2.el7.x86_64 (mysql56-community)
           Requires: libstdc++.so.6(GLIBCXX_3.4.15)(64bit)
Error: Package: mysql-community-client-5.6.35-2.el7.x86_64 (mysql56-community)
           Requires: libc.so.6(GLIBC_2.17)(64bit)
 You could try using --skip-broken to work around the problem
 You could try running: rpm -Va --nofiles --nodigest
```
解决方法：
```shell
yum install glibc.i686
yum list libstdc++*
```
4. 重置密码
重置密码前，首先要登录
```shell
mysql -u root
```
登录时有可能报这样的错：`ERROR 2002 (HY000): Can’t connect to local MySQL server through socket ‘/var/lib/mysql/mysql.sock’ `，原因是/var/lib/mysql的访问权限问题。下面的命令把/var/lib/mysql的拥有者改为当前用户：
```shell
sudo chown -R root:root /var/lib/mysql
```
然后，重启服务：
```shell
service mysqld restart
```
接下来登录重置密码：
```shell
mysql -u root
mysql > use mysql;
mysql > update user set password=password('123456') where user='root';
mysql > exit;
```
重启mysql服务后才生效
```shell
service mysqld restart
```
5. 允许远程登录
```shell
mysql -u root -p
# 输入密码
use mysql;
Grant all on *.* to 'root'@'%' identified by 'root用户的密码' with grant option;
flush privileges;
```
