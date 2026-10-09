---
title: Perl正则表达式错误解决
date: 2019-02-28T00:00:00.000Z
slug: fix-perl-regex-error
categories:
  - Linux
  - Ubuntu
tags:
  - Linux
  - Ubuntu
  - Perl
---
遇到了Perl的正则表达式错误
```shell
Unescaped left brace in regex is deprecated, passed through in regex;
```
<!-- more --> 

这是由于perl版本导致的，ubuntu默认版本是5.22.1，我直接覆盖安装了5.16.3就好了
参考：[https://blog.csdn.net/johnwaychan/article/details/79066960](https://blog.csdn.net/johnwaychan/article/details/79066960 "https://blog.csdn.net/johnwaychan/article/details/79066960")
先在 http://www.cpan.org/src/5.0 上查找对应的版本
在终端依次运行以下命令

```shell
wget http://www.cpan.org/src/5.0/perl-5.16.3.tar.gz
tar -xzf perl-5.16.3.tar.gz
cd perl-5.16.3
./Configure -de
make
make test
sudo make install
```
 我中间test并没用通过，不过好像没有关系？
这样perl就安装好了
