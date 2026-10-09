---
title: 在CentOS7.6上为网卡BCM43228安装驱动
date: 2019-05-02T00:00:00.000Z
slug: bcm43228-driver-centos7
categories:
  - Linux
  - CentOS
tags:
  - Linux
  - CentOS
---
## 前言
前段时间给笔记本换了一块网卡，随便买了一块博通的BCM43228，然后在装centos的时候就翻车了，网上找的教程有不完善的地方，反复弄了好几次，终于弄好了，在这里整理一下过程。

<!-- more --> 

## 参考
[CentOS7 Broadcom无线网卡驱动安装](https://my.oschina.net/itblog/blog/1023484 "CentOS7 Broadcom无线网卡驱动安装")
[安装CentOS 7双系统（四）——解决博通无线网卡问题](https://www.jianshu.com/p/15b3406ce6a2 "安装CentOS 7双系统（四）——解决博通无线网卡问题")
[以 Broadcom Corporation BCM4311, BCM4312, BCM4313, BCM4321, BCM4322, BCM43224, BCM43225, BCM43227 和 BCM43228 为基础的无线网络卡](https://wiki.centos.org/zh/HowTos/Laptops/Wireless/Broadcom#head-be5655789eb917182a033f1e934c2c48dec57d29 "以 Broadcom Corporation BCM4311, BCM4312, BCM4313, BCM4321, BCM4322, BCM43224, BCM43225, BCM43227 和 BCM43228 为基础的无线网络卡")

## 环境
系统：centos7.6
内核：3.10.0-957.el7.x86_64

## 准备工作
### 安装编译器

```shell
yum install kernel-headers kernel-devel gcc
```
### 下载驱动
从[博通官网](http://www.broadcom.com/support/802.11/linux_sta.php "博通官网")的驱动中找到`Linux® STA 64-bit driver`下载
### 下载改代码脚本
由于这个驱动里面有不适配centos7.6的地方，所以需要通过脚本改一部分代码。将这个[链接](https://wiki.centos.org/HowTos/Laptops/Wireless/Broadcom?action=AttachFile "链接")中的全部脚本下载待用（虽然有一个并不会用到）

## 编译
执行以下命令
```shell
tar -xvf hybrid-v35_64-nodebug-pcoem-6_30_223_271.tar.gz
patch -p1 < ./wl-kmod-fix-ioctl-handling.patch
patch -p1 < ./wl-kmod-01_kernel_4.7_IEEE80211_BAND_to_NL80211_BAND.patch
patch -p1 < ./wl-kmod-02_kernel_4.8_add_cfg80211_scan_info_struct.patch
patch -p1 < ./wl-kmod-03_fix_kernel_warnings.patch
patch -p1 < ./wl-kmod-04_kernel_4.11_remove_last_rx_in_net_device_struct.patch
patch -p1 < ./wl-kmod-05_kernel_4.12_add_cfg80211_roam_info_struct.patch
```
如果执行正确，输出大致如下：
```shell
[user@host hybrid-wl]$ patch -p1 < ../wl-kmod-fix-ioctl-handling.patch
patching file src/wl/sys/wl_cfg80211_hybrid.c
Hunk #1 succeeded at 1467 (offset 17 lines).
patching file src/wl/sys/wl_linux.c
Hunk #1 succeeded at 1659 (offset 8 lines).
[user@host hybrid-wl]$ patch -p1 < ../wl-kmod-01_kernel_4.7_IEEE80211_BAND_to_NL80211_BAND.patch
patching file src/wl/sys/wl_cfg80211_hybrid.c
Hunk #6 succeeded at 1911 (offset 3 lines).
Hunk #7 succeeded at 2040 (offset 3 lines).
Hunk #8 succeeded at 2160 (offset 3 lines).
Hunk #9 succeeded at 2298 (offset 3 lines).
Hunk #10 succeeded at 2941 (offset 3 lines).
[user@host hybrid-wl]$ patch -p1 < ../wl-kmod-02_kernel_4.8_add_cfg80211_scan_info_struct.patch
patching file src/wl/sys/wl_cfg80211_hybrid.c
Hunk #1 succeeded at 2442 (offset 3 lines).
Hunk #2 succeeded at 2553 (offset 3 lines).
Hunk #3 succeeded at 2989 (offset 3 lines).
[user@host hybrid-wl]$ patch -p1 < ../wl-kmod-03_fix_kernel_warnings.patch
patching file src/wl/sys/wl_cfg80211_hybrid.c
Hunk #1 succeeded at 2008 (offset 3 lines).
Hunk #2 succeeded at 2032 (offset 3 lines).
Hunk #3 succeeded at 2056 (offset 3 lines).
Hunk #4 succeeded at 2071 (offset 3 lines).
Hunk #5 succeeded at 2107 (offset 3 lines).
Hunk #6 succeeded at 2386 (offset 3 lines).
Hunk #7 succeeded at 2401 (offset 3 lines).
Hunk #8 succeeded at 2441 (offset 3 lines).
[user@host hybrid-wl]$ patch -p1 < ../wl-kmod-04_kernel_4.11_remove_last_rx_in_net_device_struct.patch
patching file src/wl/sys/wl_cfg80211_hybrid.c
patching file src/wl/sys/wl_linux.c
Hunk #1 succeeded at 2911 (offset -18 lines).
[user@host hybrid-wl]$ patch -p1 < ../wl-kmod-05_kernel_4.12_add_cfg80211_roam_info_struct.patch
patching file src/wl/sys/wl_cfg80211_hybrid.c
Hunk #3 succeeded at 2450 (offset 3 lines).
Hunk #4 succeeded at 2466 (offset 3 lines).
```
注意Hunk的数量以及是否succeed
在执行以下命令
```shell
sed -i 's/[ >][>=] KERNEL_VERSION(2, 6, 3.)/>= KERNEL_VERSION(2, 6, 32)/' src/wl/sys/wl_cfg80211_hybrid.c
sed -i 's/[ >][>=] KERNEL_VERSION(3, ., .)/>= KERNEL_VERSION(2, 6, 32)/' src/wl/sys/wl_cfg80211_hybrid.c
sed -i 's/[ >][>=] KERNEL_VERSION(3, 11, .)/>= KERNEL_VERSION(2, 6, 32)/' src/wl/sys/wl_cfg80211_hybrid.c
sed -i 's/< KERNEL_VERSION(3, 18, .)/< KERNEL_VERSION(2, 6, 30)/' src/wl/sys/wl_cfg80211_hybrid.c
sed -i 's/[ >][>=] KERNEL_VERSION(3, 15, .)/>= KERNEL_VERSION(2, 6, 32)/' src/wl/sys/wl_cfg80211_hybrid.c
sed -i 's/[ >][>=] KERNEL_VERSION(4, 0, 0)/>= KERNEL_VERSION(2, 6, 32)/' src/wl/sys/wl_cfg80211_hybrid.c
sed -i 's/< KERNEL_VERSION(4,2,0)/< KERNEL_VERSION(2, 6, 30)/' src/wl/sys/wl_cfg80211_hybrid.c

sed -i 's/ >= KERNEL_VERSION(3, 11, 0)/ >= KERNEL_VERSION(3, 10, 0)/' src/wl/sys/wl_cfg80211_hybrid.c
sed -i 's/ >= KERNEL_VERSION(3, 15, 0)/ >= KERNEL_VERSION(3, 10, 0)/' src/wl/sys/wl_cfg80211_hybrid.c
sed -i 's/ < KERNEL_VERSION(3, 18, 0)/ < KERNEL_VERSION(3, 9, 0)/' src/wl/sys/wl_cfg80211_hybrid.c
sed -i 's/ >= KERNEL_VERSION(4, 0, 0)/ >= KERNEL_VERSION(3, 10, 0)/' src/wl/sys/wl_cfg80211_hybrid.c
sed -i 's/ < KERNEL_VERSION(4,2,0)/ < KERNEL_VERSION(3, 9, 0)/' src/wl/sys/wl_cfg80211_hybrid.c
sed -i 's/ >= KERNEL_VERSION(4, 7, 0)/ >= KERNEL_VERSION(3, 10, 0)/' src/wl/sys/wl_cfg80211_hybrid.c
sed -i 's/ >= KERNEL_VERSION(4, 8, 0)/ >= KERNEL_VERSION(3, 10, 0)/' src/wl/sys/wl_cfg80211_hybrid.c
sed -i 's/ >= KERNEL_VERSION(4, 11, 0)/ >= KERNEL_VERSION(3, 10, 0)/' src/wl/sys/wl_cfg80211_hybrid.c
sed -i 's/ < KERNEL_VERSION(4, 12, 0)/ < KERNEL_VERSION(3, 9, 0)/' src/wl/sys/wl_cfg80211_hybrid.c
sed -i 's/ >= KERNEL_VERSION(4, 12, 0)/ >= KERNEL_VERSION(3, 10, 0)/' src/wl/sys/wl_cfg80211_hybrid.c
sed -i 's/ <= KERNEL_VERSION(4, 10, 0)/ < KERNEL_VERSION(3, 9, 0)/' src/wl/sys/wl_linux.c
```
然后再make就好，正常输入大致如下，会有一个warning
```shell
make: Entering directory `/usr/src/kernels/2.6.32-573.7.1.el6.x86_64'
CFG80211 API is prefered for this kernel version
Using CFG80211 API
  LD /usr/local/src/hybrid-wl/built-in.o
  CC [M] /usr/local/src/hybrid-wl/src/shared/linux_osl.o
  CC [M] /usr/local/src/hybrid-wl/src/wl/sys/wl_linux.o
  CC [M] /usr/local/src/hybrid-wl/src/wl/sys/wl_iw.o
  CC [M] /usr/local/src/hybrid-wl/src/wl/sys/wl_cfg80211_hybrid.o
/usr/local/src/hybrid-wl/src/wl/sys/wl_cfg80211_hybrid.c:1802: warning: initialization from incompatible pointer type
  LD [M] /usr/local/src/hybrid-wl/wl.o
  Building modules, stage 2.
CFG80211 API is prefered for this kernel version
Using CFG80211 API
  MODPOST 1 modules
  CC /usr/local/src/hybrid-wl/wl.mod.o
  LD [M] /usr/local/src/hybrid-wl/wl.ko.unsigned
  NO SIGN [M] /usr/local/src/hybrid-wl/wl.ko
make: Leaving directory `/usr/src/kernels/2.6.32-573.7.1.el6.x86_64'
```

## 将驱动模块装入内核中
先卸载一些模块
```shell
modprobe -r bcm43xx
modprobe -r b43
modprobe -r b43legacy
modprobe -r ssb
modprobe -r bcma
modprobe -r brcmsmac
modprobe -r ndiswrapper
```
将驱动模块的文件复制到一个可以让内核找到它的地方：
```shell
cp -vi /usr/local/src/hybrid-wl/wl.ko /lib/modules/`uname -r`/extra/
```
这样做是为了与其它已经／将会从 kmod 组件安装的外置模块（例如：fuse、ntfs-3g、等）保持一贯性。
按著，执行：
```shell
depmod $(uname -r)
```
以便能创建一个模块的互赖性清单。现在我们装入驱动模块：
```shell
insmod wl.ko
```
假如这一步失败了并伴有如下提示信息：
```shell
insmod: error inserting 'wl.ko': -1 Unknown symbol in module
```
首先尝试创建模块依赖：
```shell
depmod `uname -r`
```
然后装入驱动模块：
```shell
modprobe wl
```
## 检查
```shell
iw dev
```
应该就有网卡出来了

## 设置开机时将驱动模块装入内核中
这一步使用参考资料中的方法似乎对于我的环境无用，所以我改成了鞋开机启动脚本的形式，开机启动脚本如下
```shell
modprobe -r bcma # 因为我的centos只有这一个碍事的脚本
modprobe -r wl # 不知道为啥必须要先卸载掉
depmod `uname -r`
modprobe wl
```
## 开机自动连接wifi
再在启动脚本中添加如下内容
```shell
ip link set dev wlp3s0 up
systemctl start network-manager.service
nmcli dev wifi connect "WIFI SSID" password "WIFI PASSWORD"
dhclient wlp3s0 up
```
非常迷的是，貌似是因为network-manager升级了之后，就无法使用了，即使命令变成了`systemctl start NetworkManager.service`
会出现内核级别的网卡报错`wlp3s0 scan_results error -22`
我屈服了……放弃了……
