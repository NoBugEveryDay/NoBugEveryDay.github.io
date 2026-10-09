---
title: CentOS开机自动连接WiFi并固定地址
date: 2019-05-02T00:00:00.000Z
slug: centos-auto-connect-wifi
categories:
  - Linux
  - CentOS
tags:
  - Linux
  - CentOS
---
## 前言
新装了个centos希望它能开机自动连接WiFi，并且固定IP地址，但是家里的辣鸡中国移动路由器后台连绑定ip的功能都没有，只能自己动手了
## 在开机脚本中添加如下内容
```shell
ip link set dev wlp3s0 up #启动无限网卡
systemctl start network-manager.service #必须要先开启这个服务才能成功连接
#wpa_supplicant -B -i wlp3s0 -c <(wpa_passphrase "WIFI NAME" "PASSWORD") #这个是无效命令，用这个方式连不上
nmcli dev wifi connect "WIFI NAME" password "PASSWORD" # 用这个才可以
ifconfig wlp3s0 192.168.1.166/24 # 设置固定ip
```
还要手动设置网关，不过这个是重启不失效的
```shell
route add default gw 192.168.1.1
```
