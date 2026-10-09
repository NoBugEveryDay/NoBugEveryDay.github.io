---
title: 如何用将Linux上的影视资源共享给小米电视
date: 2021-01-14T00:00:00.000Z
slug: share-linux-media-to-mi-tv
categories:
  - Docker
tags:
  - Docker
  - SMB
---
## 摘要

给家里整个了小型的HTPC，影视资源可以直接通过PT下载到里面，同时家里用的是小米电视，需要一种可以将上面的视频在小米电视上播放的方法

<!-- more --> 

## 配置方法

小米上自带的”高清播放器“可以添加网络设备，这个是使用SMB协议的，因此只要在linux上搭建一个SMB服务器即可，由于这个过程比较麻烦，当然还是使用Docker来解决

```shell
docker run -itd \
	--name samba \
	-p 139:139 \
	-p 445:445 \
	-e USERID=0 \
	-e GROUPID=0 \
	-v /mnt/sda1:/mount \
	--restart unless-stopped \
	dperson/samba \
	-s "movie;/mount/;yes;no;yes;all;none" \
	-S
```

这个里面最坑的一点在于，小米电视只支持SMB1.0协议，而server端默认不支持1.0协议，所以要加一个参数`-S`，这一点在很多教程都没有提及，摸索了很久

## 调试方法

使用Windows系统时，只需要在文件浏览器中输入`\\[ip]`即可

## 配置密码

可以给部分文件夹设置用户名和密码，来设置权限

```bash
docker run -itd \
        --name samba \
        -p 139:139 \
        -p 445:445 \
        -e USERID=0 \
        -e GROUPID=0 \
        -v /mnt/sda1:/mount \
        --restart unless-stopped \
        dperson/samba \
        -u "[username];[password]" \
        -s "Secret;/mount/qbittorrent2/;yes;no;yes;me;none" \
        -s "Private;/mount/qbittorrent1/;yes;no;yes;all;none" \
        -S
```
