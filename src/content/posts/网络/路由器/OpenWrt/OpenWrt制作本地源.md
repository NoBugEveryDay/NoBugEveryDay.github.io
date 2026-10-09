---
title: OpenWrt制作本地源
date: 2019-08-11T00:00:00.000Z
slug: openwrt-local-repo
categories:
  - 网络
  - 路由器
  - OpenWrt
tags:
  - 网络
  - 路由器
  - OpenWrt
---
## 摘要

由于OpenWrt的源总是更新得非常快，内核总是升级，每次升级的时候`opkg install`一些内核的东西时候日常内核版本不兼容导致很多包装不上。一个比较方便的方法是在刷了一次机之后顺便把所有包爬下来，做成本地源。

<!-- more --> 

## 实验环境

路由器：歌华链 GHL-R-001

OpenWrt内核：4.14.134

## 爬取所有包

首先需要把当前内核对应的所有包都下载下来，下载地址可以在`/etc/opkg/distfeeds.conf`找到，我把里面的每个链接的内容都全部下载到一个单独的文件夹内。

下载需要使用脚本，在网上找到了一两个脚本，然而似乎都由于官方源的网页出现了一些变化，所以用不了，必须改一下，这里贴上我当前能用的版本。

（修改基于<https://www.cnblogs.com/sohobloo/p/5837313.html>）

```python
#!/usr/bin/env python
#coding=utf-8
#
# Openwrt Package Grabber
#
# Copyright (C) 2016 sohobloo.me
#

import urllib2
import re
import os
import time

# the url of package list page, end with "/"
baseurl = 'http://downloads.openwrt.org/snapshots/targets/ramips/mt7621/packages/'

# which directory to save all the packages, end with "/"
time = time.strftime("%Y%m%d%H%M%S", time.localtime())
savedir = './openwrt_core/'
pattern = r'<a href="([^\?].*?)">'
def fetch(url, path = ''):
    if not os.path.exists(savedir + path):
        os.makedirs(savedir + path)
    print 'fetching package list from ' + url[:-1] + path
    content = urllib2.urlopen(url[:-1] + path, timeout=15).read()
    content = content[content.index('<table>'):]
    # print content
    # return
    items = re.findall(pattern, content)
    for item in items:
        # print "current item : " + item
        if item == '../' or item == '/':
            continue
        elif item.endswith('/'):
            fetch(url, path + item)
        else:
            print 'downloading item : ' + path + item
            if os.path.isfile(savedir + path + item):
                print 'file exists, ignored.'
            else:
                rfile = urllib2.urlopen(baseurl + path + item)
                with open(savedir + path + item, "wb") as code:
                    code.write(rfile.read())

fetch(baseurl)

print 'done!'
```

把所有包爬下来了就有挺多种方法可以构建本地源了，由于我的路由器上有一个usb3.0接口，个人更偏向于直接把本地源直接丢在U盘里。但是此时我的路由器还没装上能使路由器挂载U盘的包，OpenWrt官方源又已经更新了，但好在在过期之前我已经把所有包爬下来了。所以必须要先在别的地方做一个源，把挂载U盘所需要的包装上，再把包都转移到路由器上的U盘里。

## 搭建“非本地”源

在我自己的VPS上，我已经运行了一个`Apache Tomcat8`服务器，并且有域名，所以我选择直接把整个源丢到`/var/lib/tomcat8/webapps`内的一个项目文件夹内，然后通过`http://域名/项目/openwrt/随便一个包`看下能不能下载，确认源搭建承购

## 第一次换源

这里比较神奇的是通过我常规理解的方法都没有办法正常换源，最后是通过如下方法换源的

1. 把`/etc/opkg/distfeeds.conf`做个备份为`bak.distfeeds.conf`，然后把里`distfeeds.conf`面所有东西都删掉

2. 无视`/etc/opkg/customfeeds.conf`，这里提一下只是因为这个东西虽然里面带`custom`，但是不知道为啥改这个并没有用……

3. 修改`/etc/opkg.conf`，在最后添加如下内容

   ```
   src/gz openwrt_core http://域名/项目名/openwrt/openwrt_core
   src/gz openwrt_kmods http://域名/项目名/openwrt/openwrt_kmods
   src/gz openwrt_base http://域名/项目名/openwrt/openwrt_base
   src/gz openwrt_luci http://域名/项目名/openwrt/openwrt_luci
   src/gz openwrt_packages http://域名/项目名/openwrt/openwrt_packages
   src/gz openwrt_routing http://域名/项目名/openwrt/openwrt_routing
   src/gz openwrt_telephony http://域名/项目名/openwrt/openwrt_telephony
   ```

4. 最后再`opkg update`并安装需要的包，虽然会报一些错，但是并不用管，包依然能安装上，报错大概如下

   ```
   Collected errors:
    * opkg_conf_parse_file: Duplicate src declaration (openwrt_core http://downloads.openwrt.org/snapshots/targets/ramips/mt7621/packages). Skipping.
    * opkg_conf_parse_file: Duplicate src declaration (openwrt_kmods http://downloads.openwrt.org/snapshots/targets/ramips/mt7621/kmods/4.14.134-1-e3bb11c75868213c8fc8d86f0273a6a5). Skipping.
    * opkg_conf_parse_file: Duplicate src declaration (openwrt_base http://downloads.openwrt.org/snapshots/packages/mipsel_24kc/base). Skipping.
    * opkg_conf_parse_file: Duplicate src declaration (openwrt_luci http://downloads.openwrt.org/snapshots/packages/mipsel_24kc/luci). Skipping.
    * opkg_conf_parse_file: Duplicate src declaration (openwrt_packages http://downloads.openwrt.org/snapshots/packages/mipsel_24kc/packages). Skipping.
    * opkg_conf_parse_file: Duplicate src declaration (openwrt_routing http://downloads.openwrt.org/snapshots/packages/mipsel_24kc/routing). Skipping.
    * opkg_conf_parse_file: Duplicate src declaration (openwrt_telephony http://downloads.openwrt.org/snapshots/packages/mipsel_24kc/telephony). Skipping.
   ```

   

## 挂载U盘

1. 安装所需要的包`fdisk e2fsprogs kmod-fs-ext4`（可能有遗漏）
2. 通过`fdisk`和`mkfs.ext4`和`mount`像普通LINUX那样挂载U盘即可，我挂到了`/root/sda1`
3. 然后再把源全部拉到这个U盘上

由于我还想这个U盘里能装一点别的东西，便于做离线下载或者暂存一点别的东西，所以接下将在路由器上搭建一个HFS。

## 搭建“本地”源

由于`OpenWrt`的`luci`就有网页服务器，所以我们直接把东西丢到`/www`这个目录下就行。我的把所有的包都已经放到`/root/sda1/openwrt`目录下，所以直接`ln -s /root/sda1/openwrt /www/openwrt`，再把`/etc/opkg.conf`刚刚添加的内容修改为如下

```
src/gz openwrt_core http://127.0.0.1/openwrt/openwrt_core
src/gz openwrt_kmods http://127.0.0.1/openwrt/openwrt_kmods
src/gz openwrt_base http://127.0.0.1/openwrt/openwrt_base
src/gz openwrt_luci http://127.0.0.1/openwrt/openwrt_luci
src/gz openwrt_packages http://127.0.0.1/openwrt/openwrt_packages
src/gz openwrt_routing http://127.0.0.1/openwrt/openwrt_routing
src/gz openwrt_telephony http://127.0.0.1/openwrt/openwrt_telephony
```

## 成果

```shell
opkg install iperf3
Installing iperf3 (3.7-1) to root...
Downloading http://127.0.0.1/openwrt/openwrt_base/iperf3_3.7-1_mipsel_24kc.ipk
Configuring iperf3.
```

可以看到就从本地拉取安装包了
