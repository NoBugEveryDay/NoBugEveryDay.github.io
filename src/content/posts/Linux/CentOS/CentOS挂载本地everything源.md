---
title: CentOS挂载本地everything源
date: 2019-05-02T00:00:00.000Z
slug: centos-local-everything-repo
categories:
  - Linux
  - CentOS
tags:
  - Linux
  - CentOS
---
在安装centos时一般是用U盘安装，安装完有时候还不能成功联网，智能依赖本地源，所以安装系统的时候顺便保留一个本地源是最好的

<!-- more --> 

一般是使用U盘安装系统，安装完系统后把U盘挂载后直接把里面所有东西复制到/media/cdrom下

或者，直接使用以下命令把一个iso镜像直接挂在到某个目录下

```shell
mount -t iso9660 /root/local-disk/image/CentOS-7-x86_64-Everything-1810.iso CentOS-7-x86_64-Everything-1810
```

执行以下修改
```shell
cd /etc/yum.repos.d/
$ mv CentOS-Base.repo CentOS-Base.repo.bak
$ cp CentOS-Media.repo CentOS-Media.repo.bak
$ vim  CentOS-Media.repo
[c7-media]
name=CentOS-$releasever - Media
baseurl=file:///media/cdrom/ # 删掉多于的只剩这一个
gpgcheck=1
enabled=1 # 注意修改这里
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-7 # 保留原来的
```
