---
title: OCP3.0接口网卡
date: 2021-04-27T00:00:00.000Z
slug: ocp3-nic
categories:
  - Hardware
tags:
  - Hardware
---
## 摘要

本文介绍一种网卡接口OCP3.0

<!-- more --> 

因为偶然的机会发现了原来还有这种接口

下图是[BlueField-2 DPU](https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/documents/datasheet-nvidia-bluefield-2-dpu.pdf)的一种形态

![image-20210427103849711.png](OCP_3.0_NIC/image-20210427103849711.png)

下图是[华为Atlas800服务器3D渲染图](https://support-it.huawei.com/server-3D/res/server/atlas8009000Air/index.html?lang=cn)中的网卡

![image-20210427104236179.png](OCP_3.0_NIC/image-20210427104236179.png)

![image-20210427104311052.png](OCP_3.0_NIC/image-20210427104311052.png)

可以看出这种接口的网卡相比于PCIe接口的网卡有了便于热插拔的特性

> 摘自：http://www.grt-china.com/xinwenzixun/512.html
>
> OCP NIC 3.0采用了大卡（LFF）和小卡（SFF）两种尺寸规格，通过拉手条或螺钉从面板上插入服务器机箱中，实现机箱不开盖维护。信号速率从PCIe Gen4起步，可以支持到PCIe Gen5，提供x16和x32两种PCIe接口带宽，并改善了NIC卡的散热性能。
>
> ![5fd00a26574c0e6b66ee9b4312a8a886.png](OCP_3.0_NIC/5fd00a26574c0e6b66ee9b4312a8a886.png)

看起来这种接口还是蛮NB的
