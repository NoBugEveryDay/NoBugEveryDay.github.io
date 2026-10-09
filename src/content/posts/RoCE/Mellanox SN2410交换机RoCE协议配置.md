---
title: Mellanox SN2410交换机RoCE协议配置
date: 2019-03-08T00:00:00.000Z
slug: mellanox-sn2410-roce-config
categories:
  - RoCE
tags:
  - RoCE
  - Mellanox
---
## 摘要

本文将以`Mellanox SN2410`为例讲解如何在Mellanox交换机上配置RoCE协议

<!-- more --> 

## 环境
### Mellanox SN2410
```shell
Mellanox-SN2410 [standalone: master] # show version
Product name:      Onyx
Product release:   3.7.1102
```
*ps. 交换机刚拿到的时候是`3.6.4114`，竟然有的功能是无法使用的，官方说了要`3.6.5000`之后的版本才支持*
### 网卡
```shell
$ ofed_info
OFED-internal-4.4-2.0.7
$ mlxfwmanager
Querying Mellanox devices firmware ...

Device #1:
----------

  Device Type:      N/A
  Part Number:      N/A
  Description:
  PSID:             DEL2420110034
  PCI Device Name:  0000:06:00.0
  Port1 MAC:        N/A
  Port1 GUID:       N/A
  Port2 MAC:        N/A
  Port2 GUID:       N/A
  Versions:         Current        Available
     FW             14.23.1020     N/A
```
*ps. Firmware和OFED也最好升级到最新，低版本的配置方法会有所不同*
在我这里以太网卡的名称是`eth4`，如果要设置为其他，更改响应的名称即可
## 服务器配置
```shell
mlnx_qos -i eth4 --trust dscp
# 将qos切换到dscp模式，使用dscp来作为网络服务质量管理的依据。如果这里无法设置，很有可能是OFED或者Firmware版本问题

echo 106 > /sys/class/infiniband/mlx5_0/tc/1/traffic_class
cma_roce_tos -d mlx5_0 -t 106
# 将RoCE流量的标记设置为26，至于为什么26要填106，见细节原理1

sysctl -w net.ipv4.tcp_ecn=1
# 开启系统对TCP流量的ECN标记，对于RoCE好像没啥用，因为RoCE是封装在UDP中的，但官方教程有设置，还是写一下

mlnx_qos -i eth4 --pfc 0,0,0,1,0,0,0,0
# 3号优先级队列上开启PFC控制，这里为什么开3号，见细节原理2
```
## 交换机配置
```shell
interface ethernet 1/1-1/48 traffic-class 3 congestion-control ecn minimum-absolute 150 maximum-absolute 1500
# traffic class 3 对应的是3号输出队列，将所有端口3号输出队列的长度超过150时，开始以一定概率标记ECN，当长度超过1500的时候全部标记ECN。为什么是3号见细节原理2

traffic pool roce type lossless
# 创建名为roce的流量缓存池，并将其属性设置为无损流量

traffic pool roce memory percent 50.00
# 将名为roce的流量缓存池的最高内存占用设置为50？

traffic pool roce map switch-priority 3
# 将3号交换机有限队列的流量映射到这个流量缓存池

interface ethernet 1/1-1/48 traffic-class 6 dcb ets strict
# 将所有端口的6号输出队列设置为确保转发

interface ethernet 1/1-1/48 qos trust L3
# 将所有端口设置为使用三层通信模式（DSCP值）来管理网络服务质量
```
## 如何验证配置成功
进行一次多对一通信，保证网络中产生拥塞，然后通过以下两条命令前后对比验证
```shell
ethtool -S
# 检查 prio3和prio6中均有流量，并且pause中记录到了收到pause包数量，确保PFC生效
cd /sys/class/infiniband/mlx5_0/ports/1/hw_counters
ls | grep cnp
cat *cnp*
# 检查收到了CNP包，确保CNP包生效
```

## 细节原理
### 0. ECN原理

参考：[Mellanox Understanding RoCEv2 Congestion Management](https://community.mellanox.com/s/article/understanding-rocev2-congestion-management "Mellanox Understanding RoCEv2 Congestion Management")
这是这篇的翻译：[RoCE拥塞控制机制](https://cloud.tencent.com/developer/article/1078916 "RoCE拥塞控制机制")
在数据包的IP层(网路程)有一块TOS(Type Of Server)域，其中前8个位为DSCP值，后2位为ECN标记位，……
### 1. RoCE流量设置值
在数据包的IP层(网路程)有一块TOS(Type Of Server)域，其中前8个位为DSCP值，后2位为ECN标记位，我们需要把ECN标记位设置为`10`(二进制)，而DSCP值为`26`，对应二进制值为`11010`，连一起就是`1101010`，对应十进制值就是`106`
### 2. 优先队列值设置
因为DSCP值的取值范围时0-63，而PFC队列和交换机的优先队列的取值范围都是0-7，所以要建立一种映射关系。幸运的是这两种映射的默认映射方式默认都是每8个连续的DSCP映射到一个队列
```shell
$ mlnx_qos -i eth4
DCBX mode: OS controlled
Priority trust state: dscp
dscp2prio mapping:
	prio:0 dscp:07,06,05,04,03,02,01,00,
	prio:1 dscp:15,14,13,12,11,10,09,08,
	prio:2 dscp:23,22,21,20,19,18,17,16,
	prio:3 dscp:31,30,29,28,27,26,25,24,
	prio:4 dscp:39,38,37,36,35,34,33,32,
	prio:5 dscp:47,46,45,44,43,42,41,40,
	prio:6 dscp:55,54,53,52,51,50,49,48,
	prio:7 dscp:63,62,61,60,59,58,57,56,
```
我们的RoCE流量标记的DSCP值为26，对应的是优先队列3，所以服务器和交换机设置的PFC队列编号都是3
由于ECN的反馈控制包（CNP包）的默认DSCP值是48，所以交换机上设置的确保转发的优先队列编号是6
