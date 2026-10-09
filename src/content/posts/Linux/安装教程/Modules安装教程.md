---
title: Modules 安装教程
date: 2019-02-28T00:00:00.000Z
slug: install-environment-modules
categories:
  - Linux
  - 安装教程
tags:
  - Linux
  - Modules
---
## 摘要

`environment-modules`是在linux上进行环境管理的一个非常方便的工具，本文将介绍在`centos7.4`及`ubuntu16.04`上安装modules

<!-- more --> 

## 安装
```shell
# centos
yum install environment-modules
# ubuntu
apt-get install environment-modules
```
## 让所有用户登录加载module
- centos
在`/etc/profile`最后加上
```shell
source /usr/share/Modules/init/bash
```
- ubuntu
在`/etc/profile`最后加上
```shell
source /usr/share/modules/init/bash
```
## 配置module配置文件目录
- centos
在`/etc/usr/share/Modules/init/bash`最后加上
```shell
export MODULEPATH=/home/to/your/modules
```
- ubuntu
在`/etc/usr/share/Modules/init/bash`最后加上
```shell
export MODULEPATH=/home/to/your/modules
```
## 使用env2生成module文件
在[https://sourceforge.net/projects/env2/files/?source=navbar](https://sourceforge.net/projects/env2/files/?source=navbar "https://sourceforge.net/projects/env2/files/?source=navbar") 中下载env2
使用类似以下命令生成module文件
```shell
env2 -from bash -to modulecmd -o "[install-dir]/parallel_studio_xe_201m.0.nnn/psxevars.sh <intel64|ia-32>"
```
如果运行不了，是因为缺少一个包，装一下Data-Dumper就好了
然后会产生一个`env2.modulecmd`的文件，把它重命名并移动到module配置文件目录即可

## 自定义安装

然而使用上述的安装方法会强制安装到根目录，想要安装到任意地方，可以使用源码安装

官方网址http://modules.sourceforge.net/

点击右上角的`Latest source release`那里下载

或者从我的HFS上下载http://sz.sysu.tech:12345/software/modules-4.3.1.tar.gz

官方安装教程在https://modules.readthedocs.io/en/stable/INSTALL.html
