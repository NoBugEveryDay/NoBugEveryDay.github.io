---
title: 缺少Perl module LibXML的解决方法
date: 2019-02-28T00:00:00.000Z
slug: fix-missing-perl-libxml
categories:
  - Linux
  - Ubuntu
tags:
  - Linux
  - Ubuntu
  - Perl
---
参考：[https://blog.csdn.net/flytothesun/article/details/50296407](https://blog.csdn.net/flytothesun/article/details/50296407 "https://blog.csdn.net/flytothesun/article/details/50296407")
```shell
sudo cpan -i XML::LibXML
```
如果不成功就执行
```shell
sudo apt-get install libxml2-dev zlib1g-dev
```
