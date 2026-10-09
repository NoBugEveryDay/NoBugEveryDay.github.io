---
title: OpenSHMEM的一点调研
date: 2022-07-10T00:00:00.000Z
slug: openshmem-notes
categories:
  - Research
tags:
  - OpenSHMEM
---
## 摘要

OpenSHMEM是一种PGAS(partitioned global address space)并行编程模型，它的主要思想是将所有节点上的内存视为一个大的内存池来进行管理，用户通过管理数据在内存中的位置，来达到在不同节点上的进程相互协作并行计算的目的。

<!-- more --> 

## 历史

OpenSHMEM的前身是SHMEM library，在1990s诞生（跟MPI一个年代），但是SHMEM library并没有一套统一的标准，各个发行方都定义自己的接口，这就造成了许多移植上的不便。直到2011年OpenSHMEM诞生了，将标准同一，发布了OpenSHMEM Specification 1.0。

后来OpenSHMEM也不断进行演进，现在标准已经来到了OpenSHMEM Specification 1.5。各个版本的标准定义说明可以在[这里](http://openshmem.org/site/Specification)下载。

## 教程

本来想找一个教程来稍微学一下这个东西，但是发现教程其实比较少。可以看一下这个[教程PPT](http://openshmem.org/site/sites/default/site_files/OpenSHMEM_PGAS11_tutorial.pdf)或者这个[教程PPT](https://www.csm.ornl.gov/workshops/openshmem2013/documents/presentations_and_tutorials/Tutorials/OpenSHMEM_Tutorial_OSHWorkshop2014.pdf)，理解能力比较强的话也可以直接看[1.5标准接口](http://openshmem.org/site/sites/default/site_files/OpenSHMEM-1.5.pdf)，也比较直观

## 通信接口

OpenSHMEM也是像MPI一样是一个库，在使用时直接调库即可；而不像UPC等一样需要特定的编译器支持。

OpenSHMEM的通信接口按照功能来分主要有如下的几个部分：

- 远程内存直接访问：`SHMEM_PUT`、`SHMEM_GET`等（阻塞式）、`SHMEM_PUT_NBI`、`SHMEM_GET_NBI`等（非阻塞式）
- 远程内存原子操作：`SHMEM_ATOMIC_ADD`、`SHMEM_ATOMIC_SWAP`等，及其非阻塞版
- 聚合通信操作：`SHMEM_BARRIER`、`SHMEM_ALLTOALL`等

## 感想

这些功能从MPI-2.0标准开始不也基本都实现了么……？(除了非阻塞式的RMA操作)

盲猜MPI后面的标准也会把非阻塞时的RMA操作编入。

看了下MPI-2.0标准是1997年发布的，感觉其实SHMEM的框架还是不错的，错就错在大家都各做各的实现，没有将实现标准化，所以输给了MPI，还是要感谢Jack当年的远见。
