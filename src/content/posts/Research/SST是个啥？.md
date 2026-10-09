---
title: SST是个啥？
date: 2021-07-11T00:00:00.000Z
slug: what-is-sst
categories:
  - Research
tags:
  - SST
  - dumpi
---
## 摘要

经常在各种地方看到SST，也听别人提起过SST，于是我上了一下[SST的官网](https://sst-simulator.org/)，我看了一下首页，emmmm……是我太菜了，我看不懂它想表达什么，经过一番研究，终于大致搞明白这是个什么玩意了。本文将按照我的思路介绍一下SST究竟是个啥~

<!-- more --> 

## 简介

先看名字！SST的全称是Structural Simulation Toolkit，通过它的名字我们可以知道：①它是Structural的，这里我把它理解为模块化的；②它是一个模拟器(Simulation)；③它是一个工具套装，里面有很多其他工具。因此它是一个 **模块化的 模拟器 工具套装**。下面将就从这3个方面来介绍SST，不过顺序有所改变。

### 一个优秀的模拟器

SST的本质就是一个模拟器，更准确的来说是一个并行的离散事件模拟器，可以模拟任何你想研究的离散事件，比如：机场飞机的起降调度。但是它被设计出来最核心的目的是对超算设计的一个模拟，小到可以模拟CPU的各级Cache级内存的访问，GPU的计算，大到可以模拟整个超算的网络拓扑。

为了提升模拟速度，它是可以并行模拟的，采用的是基于距离划分、保守时钟同步的 离散事件模拟。”保守时间同步“意思是：不会进行事件回滚，事件严格按照正确的顺序执行；相对应的概念是”乐观的离散事件模拟“，详情见我另一篇ROSS的博文。”基于距离划分“是指：所有要模拟的模块会形成一张图，图中的点就是各个模块，边就是各个模块之间的事件传输延迟，然后使用了一种神奇的算法（我也不清楚这是个啥算法，只知道是Zoltan这个工具包里的），将这个图进行划分，使各个进程的负载尽可能均衡，同时尽可能使划分沿着高延迟的边。

> 参考文献：
>
> [The Structural Simulation Toolkit](https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.825.178&rep=rep1&type=pdf)
>
> [Parallel discrete event simulation](https://dl.acm.org/doi/10.1145/76738.76741)
>
> [Zoltan data management services for parallel dynamic applications](https://ieeexplore.ieee.org/document/988653)

### 优秀的模块化设计

想要按照自己的需求使用这个模拟器，只需要你按照它的接口标准实现你的模块的功能即可，一个非常好的视频教程[在这里](https://www.youtube.com/watch?v=ipxoVb2dEcw)，这里不再赘述。

在[SST的github首页](https://github.com/sstsimulator)你会发现Pinned repositories有四个，其中[sst-core](https://github.com/sstsimulator/sst-core)就是它的模拟器内核，你写的模块只要接上它，就能进行模拟了。还有一个仓库是[sst-element](https://github.com/sstsimulator/sst-elements)，这是官方实现的一些模块，可以直接使用，不用重复实现，这里是关于这些模块的[一个说明](https://sst-simulator.org/SSTPages/SSTDeveloperElementSummaryInfo/)。

### 一个生态良好的工具套装

据我的观察，SST的生态周边还是做的很不错的，包括有信息全面的[官网](https://sst-simulator.org/)，[文档](https://sst-simulator.org/SSTPages/SSTMainDocumentation/)，[教程](http://sst-simulator.org/SSTPages/SSTTopDocTutorial/)，[相关论文](https://sst-simulator.org/SSTPages/SSTTopDocPublications/)。在工具链上还甚至还包括[可视化辅助工具](https://www.youtube.com/watch?v=W4T73ZsSniY)（在这个视频里有，但是实际我竟然没找到），不过主要周边工具是它的[Github仓库](https://github.com/sstsimulator)里的一堆，后面将介绍其中的[sst-macro](https://github.com/sstsimulator/sst-macro)和[sst-dumpi](https://github.com/sstsimulator/sst-dumpi)。

## 安装及使用

**TODO**

## [DUMPI](https://github.com/sstsimulator/sst-dumpi)

### 简介

这是一个经常在各种地方被广泛使用的库，它也是SST工具包中的一部分，全名：Structural Simulation Toolkit (SST) DUMPI Trace Library。

它可以用来将一个MPI程序中所有的MPI调用都记录下来，不过为了性能，使用的是它自己特定的二进制格式。有两种方式可以读取：①写个C程序，调用它的接口，来进行读取；②使用命令`dumpi2ascii`可以直接将信息输出。

### 安装及使用

**TODO**

## [SST-Macro](https://github.com/sstsimulator/sst-macro)

因为好奇，看了一下这个是干什么用的，发现还是个挺厉害的东西，就也记录一下。它的文档在[这里](https://github.com/sstsimulator/sst-macro/blob/v11.0.0_beta/docs/manual/manual.md)，但是太长了，可以直接看一下这个[视频](https://www.youtube.com/watch?v=jql5s5vWrSo)就能明白了。

简单来说就是：如果给你了一个MPI程序，现在想要知道这个程序在某个仍然处于设计阶段的超算网络上的性能表现，这时候就可以用这个工具来进行模拟了。它会拦截程序中的所有MPI调用，并计算这次通信在指定网络上的通信速度，同时程序也是能正常运行得到正确结果的。

## 参考文献

> https://sst-simulator.org/
>
> https://github.com/sstsimulator
