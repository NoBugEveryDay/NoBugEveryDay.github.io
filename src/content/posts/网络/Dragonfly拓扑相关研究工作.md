---
title: Dragonfly拓扑相关研究工作
date: 2022-03-14T00:00:00.000Z
slug: dragonfly-topology-research
categories:
  - 网络
tags:
  - 网络
  - Dragonfly
---
## 摘要

本文梳理了Dragonfly网络拓扑的一些相关研究工作，这些论文是都是于2022年3月通过在[IEEE](https://ieeexplore.ieee.org/document/4556717)和[ACM](https://dl.acm.org/doi/10.1109/ISCA.2008.19)上查找被引用记录找到的。关于Dragonfly拓扑的基础知识入门，请参见我的另外一篇《[Dragonfly拓扑简介](/网络/Dragonfly拓扑简介/)》。

<!-- more --> 

## 实际应用案例

### (10 HOTI) The PERCS High-Performance Interconnect

虽然没提到dragonfly，因为没引用dragonfly的论文，但是它的拓扑就是dragonfly，可能是最早的dragonfly的生产应用。

在路由上并没有实现自适应路由，而是需要在源节点指定使用最短路由，还是非最短路由。

也有在网计算部件，能实现Barrier和简单的归约。

### (12 SC) Cray Cascade: A scalable HPC system based on a Dragonfly network

将Dragonfly的Group内的拓扑用2D HyperX 实现的，因此非最短路径的长度最长是10跳；也实现了自适应路由，但是用的UGAL-G。

也有在网计算部件，能实现Barrier和简单的归约。

### (12) Cray XC Series Network

一个类似文档的介绍，相比前一篇论文里面能找到更多详细的信息。

### (13) Performance Measurements of the NERSC Cray Cascade System

针对Cray XC30首批机器Edison的一个性能测试，主要关心各种应用在这上面的性能表现，似乎没有条多关于网络的分析。

### (14 XSEDE) A leap forward with UTK's Cray XC30

展示了一些在使用了Dragonfly的XC30上的应用成果，以及一点基础的benchmark。

## 分析及可视化

### (14 SC) Maximizing Throughput on a Dragonfly Network

利用模拟器来进行的实验，得到了如下结论：

1. 不同通信模式的应用的最优路由和放置方式是不同的
2. 对于多个作业同时运行的场景，自适应路由更好
3. 如果能让用户自由选择路由，会有性能提升

### (15 CLUSTER) Throughput Unfairness in Dragonfly Networks under Realistic Traffic Patterns

提出了一种侧重近邻通信的对抗流量模式，分析了之前一些论文提出的一些非最短路由的不同绕路方式，发现其中一些方法在这种对抗流量模式下表现很差。（论文里面的图例似乎有点问题）

### (16 J Supercomput) Network unfairness in dragonfly topologies

和《Throughput Unfairness in Dragonfly Networks under Realistic Traffic Patterns》讲的应该是同一个事情，但是这里好像讲得要详细一些，并且修复了图例错误的问题。

### (17 CCGrid) Unveiling the Interplay Between Global Link Arrangements and Network Management Algorithms on Dragonfly Networks

使用模拟器进行了研究，改变了Global Link的设计，在Global Link带宽与Local Link带宽的比值、不同路由、不同通信模式、不同作业调度模式下的性能。

能感受到想覆盖到方方面面，但是变量比较多，所以做得有一点点局限，但是工作量还是挺大的，结论还蛮丰富的，详见论文。

### (19 VDS) A Visual Analytics Framework for Analyzing Parallel and Distributed Computing Applications

这篇论文竟然可视化了PDES（并行离散事件模拟器）在Dragonfly网络上模拟的性能问题！NB！

### (20 PacificVis) A Visual Analytics Framework for Reviewing Streaming Performance Data

跟《A Visual Analytics Framework for Analyzing Parallel and Distributed Computing Applications》是一样的内容

## 全局链路设计

### (14 Code Optim) Topological Characterization of Hamming and Dragonfly Networks and Its Implications on Routing

比较了3种Global Link的连线方式，发现在均匀流量模式下性能没啥区别，于是利用两个Group之间的多条Global Link来做无死锁路由。

### (15 CLUSTER) Comparing Global Link Arrangements for Dragonfly Networks

比较了3种Global Link的连线方式，当Global Link带宽是Local Link的1.25倍以下时，没啥区别；当更大时，会有一些区别。然后针对三种连线方式，讨论了下stencil作业到上面的映射方式，但是好像没有给出具体的性能比较。

### (17 HiPINEB) New Link Arrangements for Dragonfly Networks

提出了2中新的Global Link的连线方式，又是只有当Global Link带宽是Local Link带宽的若干倍时，效果才会比较好。

### (19 HiPINEB) Shortest paths in Dragonfly systems

通常在Dragonfly中由Local-Global-Local Link组成的最短路径其实并不是最短的，因为还可以走Global-Global Link即可两跳到达。文章做了大量的理论分析，并比较了在不同的全局链路设计下这种真正的最短路径的数量。但是并没有详细讨论路由，也没有比较实际能带来的性能提升。

### (20 ICS) Global link arrangement for practical Dragonfly

对有并行连接global link的dragonfly进行了连接方式的研究

得到的结论是：在大多数情况下：应该在①连接到更多的的Group；②连接到同一个Group中更多的交换机；③两个路由器之间有更多的连接；选择③可以使网络的性能更佳，但是在某些通信模式可能会有负优化。

## 聚合通信优化

### (12 EuroMPI) Collectives on Two-Tier Direct Networks

针对Dragonfly的各种MPI collective算法设计，包括Scatter，Gather，Allgather，Broadcast，Reduce-Scatter，Reduce。但是要求用整个Dragonfly网络

### (16 SC poster) Design and Evaluation of Topology-aware Scatter and AllGather Algorithms for Dragonfly Networks

对于Scatter，提出了新算法，但是发现最简单的一对多通信效果最好；对于Allgather，优化了Ring算法，减少了Global Link的占用，在数据包比较大的时候表现较好。

### (16 TPDS) Deadlock-Free Broadcast Routing in Dragonfly Networks without Virtual Channels

提出了Local Link First(LLF)和Global Link First(GLF)两种方法来构建广播树，因为是树，所以也是无死锁的。

### (16 CLUSTER) Evaluation of Topology-Aware Broadcast Algorithms for Dragonfly Networks

基于《Evaluation of Topology-Aware Broadcast Algorithms for Dragonfly Networks》的拓展，LLF在有的情况下表现差是因为可能根进程所在的Group的进程少。所以本文构建了多棵广播树，提升了性能。

### (21 ISPA) PAARD: Proximity-Aware All-Reduce Communication for Dragonfly Networks

在使用整个Dragonfly网络的情况下，只需要6步即可完成Allreduce.

## 衍生拓扑及其相关工作

### (17 HiPINEB) Dragonfly+: Low Cost Topology for Scaling Datacenters

Dragonfly的一个变种，将group内的通信变为了fat-tree

### (19 SIGSIM-PADS) Modeling and Analysis of Application Interference on Dragonfly+

研究了Dragonfly+的作业调度策略，测试了不同通信模式的应用，发现需要用不同的策略，用的是CODES模拟器。

### (21 CCGrid) Improving adaptive routing performance on large scale Megafly topology

在Piggyback(PB)的基础上进行了改进，根据spine交换机返回的拥塞信息，优先选择最短路；如果最短路拥塞，则选择位于非源group和非目的group的leaf交换机绕路，并且还会考虑buffer排队长度。

## 拥塞分析及控制

### (13 HOTI) OFAR-CM: Efficient Dragonfly Networks with Simple Congestion Management

一作García，在OFAR路由的基础上增加了拥塞控制，比较了Escape Congestion Management (ECM)和Base Congestion Management (BCM)及配置参数

### (15 HPCA) Overcoming far-end congestion in large-scale networks

由于Dragonfly中的Global Link比较长，会导致credit等信息更新延迟，从而导致性能下降。文章提出一种基于预判的方法来解决这个问题。

### (16 IPDPS) Analyzing Network Health and Congestion in Dragonfly-Based Supercomputers

运用一个dragonfly上的模拟器探究了

1. 作业的排布
2. 作业间的相互影响和
3. 配置对其性能和成本的影响

得到了如下结论：

1. 针对作业排布：如果只有一个作业在运行，分散排布可以充分利用路由的多样性；如果有多个作业，分散排布通信量大的作业，对自己好，对别的作业也好
2. 作业间的相互影响：通信量大的作业会降低其他作业的性能。通过紧密排布可以降低这一影响
3. 模拟5种改变配置的策略在不同的workload下的性能，同时计算了其成本。详见图12、13

用的是damselfly模拟器 https://github.com/hpcgroup/damselfly

### (21 PMBS) Exploration of Congestion Control Techniques on Dragonfly-class HPC Networks Through Simulation

在交换机中增加了拥塞的监控，当排队长度大于一定值，就认为发生了多对一通信，然后给造成这个拥塞的源节点都发送减速信号。使用的是CODES模拟器，也用SST进行了交叉验证。

### (21 ISPA) DRAM: Dragonfly Routing Algorithm on Multi-objects by Optimal Thresholds

好像是Dragonfly拓扑在NoC上的应用，超纲了，没看。

## 作业调度

### (11 SC) Avoiding hot-spots on two-level direct networks

在PERCS超算上（注意PERCS是没有自适应路由的），通过模拟的方法研究了的作业到节点映射方式及路由方式的组合，对应用性能的影响。结论是比较符合直觉的，最短路由需要将作业的进程分散到各个group中，间接路由在连续排布的情况下也能表现得较好。

### (13 IMA-OCMC) Randomizing task placement does not randomize traffic (enough)

虽然《Avoiding hot-spots on two-level direct networks》指出随机的映射方式能提升一定的性能，但是并不能达到均匀流量模式的性能，只有它的一半左右。

### (16 SC) Watch Out for the Bully! Job Interference Study on Dragonfly Network

虽然dragonfly的拓扑中作业随机调度会有利于性能提升，这篇论文解释了这种反直觉现象产生的原因：可以将拥塞的链路分散开来。同时发现了这种方式的缺点：会牺牲通信不敏感型应用的性能。并提出了一种解决方案：将这种应用调度连续节点即可

### (18 SPAA) Brief Announcement: Coloring-based Task Mapping for Dragonfly Systems

介绍了一种将网格通信映射到dragonfly中的方法，使用了一种叫“balanced adjacency coloring”的染色方法，将每个格子都染上一种颜色，相同颜色的格子映射到相同的group中。这种染色方法会让每种颜色的格子都几乎是一样的，并且任意两种颜色的相邻次数也是几乎一样的。

### (18 IPDPS) Level-Spread: A New Job Allocation Policy for Dragonfly Networks

提出了一种新的作业调度方式：①当作业能在一个交换机下的节点放下，就放同一个交换机下；②如果能在一个Group内放下，找一个最闲的Group，用RR的方法放在每一个交换机下；③否则用RR的方法放在每个Group下

## 路由相关工作

### (09 ISCA, SIGARCH) Indirect adaptive routing on large scale interconnection networks

Dragonfly原始论文的一二作John Kim和William J. Dally是这篇论文的二三作，Progressive Adaptive Routing (PAR)的出处

提出了四种新的路由方法来让一个交换机来获取其他的交换机的信息来进行自适应路由的决策

- Credit Round Trip (CRT)：和dragonfly原文讲的是一样的
- Progressive Adaptive Routing (PAR)：依然是根据本地信息来决策走最短路径还是非最短路径，但是消息在出源节点所在的group之前，可以修改策略，中途改走非最短路径；如果已经决定走非最短路径，则中间不可更改
- Piggyback (PB)：将交换机本身的排队信息广播给相邻的交换机
- Reservation (RES)：提前为最短路径预留一定资源

结果是PB性能最好（但应该不好实现），PAR性能次之，对于负载的变化响应最快

### (12 ICPP) On-the-Fly Adaptive Routing in High-Radix Hierarchical Networks

一作García，提出了**OFAR**，在非最短路中增加了许多使用local link的绕路，同时使用逃逸VC形成的一个子网来实现无死锁

### (13 IMA-OCMC) Global misrouting policies in two-level hierarchical networks

一作García，比较了多种不同的绕路策略，得到的结论是他的OFAR的策略是最好的

### (13 ICPP) Efficient Routing Mechanisms for Dragonfly Networks

一作García，提出并比较了3种路由：①对PAR的一个改进，增加了intermediate和destination group的local link绕路，引起了VC数量的增加；②通过限制group内的绕路策略，避免了死锁；③和①相比使用了逃逸路由

### (15 HPCS) Analyzing available routing engines for InfiniBand-based clusters with Dragonfly topology

分析使用IB自带的路由算法能不能用于Dragonfly拓扑，分析得出只有DFSSSP能勉强用，但DFSSSP其实是个拓扑无关的路由生成算法。

### (17 SC) A comparative study of SDN and adaptive routing on dragonfly networks

在dragonfly拓扑上比较了自适应路由和夹着拥有全局通信模式信息的SDN，固定通信模式下的SDN完胜，但是具体应用还是自适应路由nb

### (18 HiPINEB) Analysis and Improvement of Valiant Routing in Low-Diameter Networks

对非最短路由进行了两个改进：①限制了Group内绕路不要绕到Group外；②当绕路后遇到排队拥塞可以再次改变路径。（这俩方法不是早就有人提出了么？）似乎还做了一点拓展到其他拓扑上的分析，最后模拟实验了一下。

### (18 TMSC) TPR: Traffic Pattern-Based Adaptive Routing for Dragonfly Networks

提出了在交换机中增加计数器的想法，统计在过去的50个周期中4种不同动作的数据包的数量，从而判断当前一小段时间的流量模式，作为UGAL-L判断阈值的一个调整，从而提升了性能。

### (18 TPDS) Scalable Deadlock-Free Deterministic Minimal-Path Routing Engine for InfiniBand-Based Dragonfly Networks

因为IB不支持在中途改变VL（也就是VC），所以许多路由方法都不适用。作者提出了一种能让最短路由在Dragonfly上无死锁的方法：当跨组通信G<sub>s</sub>→G<sub>d</sub>，当G<sub>s</sub>＜G<sub>d</sub>走一个单独的通道，当G<sub>s</sub>＞G<sub>d</sub>走另一个的通道，如果能再让组内通信单独再走一个通道，性能会更好。

### (19 SC) Mitigating network noise on Dragonfly networks through application-aware routing

首先详细分析了如何判断网络噪声，以区别网络噪声和其他噪声，得到的结论是要用网卡中的一些计数器来进行自适应路由的辅助判断。然后对应用进行了评测，评测得非常详细，工作量很大。

### (19 SC) Topology-custom UGAL routing on dragonfly

在UGAL的基础上，增加了非最短候选路径的筛选，从两个角度出发：①只选择一定比例的一定长度以下的路径参加候选；②计算了每条路径被使用的概率，使负载尽可能的均衡

### (19 TDSC) Fault-Tolerant Adaptive Routing in Dragonfly Networks

在Dragonfly上的容错路由，大概是将Group之间组成一个hypercube，Group内也组成一个hypercube，来实现容错，没有太细看这篇。

### (20 CLUSTER) Opportunities and limitations of Quality-of-Service in Message Passing applications on adaptively routed Dragonfly and Fat Tree networks

研究了Dragonfly和Fat-tree上的QoS策略。比较了5中QoS策略：①无策略；②为流量从高到低分成了4种优先级：聚合通信小数据包，点对点小数据包，聚合通信大数据包，点对点大数据包，每种分配25%带宽；④为流量从高到低分成了2种优先级：（聚合通信小数据包，点对点小数据包），（聚合通信大数据包，点对点大数据包），每种分配50%带宽；⑤每个应用自己单独一个优先级。在Dragonfly上测试了两种路由策略：A.全部流量使用自适应路由；B.高优先级流量走最短路由，低优先级流量走自适应路由。测试结果发现后一种路由策略B更好，QoS策略②③性能都挺好，但是⑤最好，但是消耗的VL太多。

### (21 IPDPS) Performance Evaluation of Adaptive Routing on Dragonfly-based Production Systems

少见的真机测试实验，没有用模拟器。比较了Cray XC30机器上，自适应路由中最短路由和非最短路由的选择偏置参数选择不同值时，对应用性能的影响，发现将选择偏向最短路由时，在大多数情况下能提升应用性能。

### (21 HPDC) Q-adaptive: A Multi-Agent Reinforcement Learning Based Routing on Dragonfly Network

使用强化学习来改进Dragonfly中的自适应路由，看起来效果还不错。是根据一些先前的方法改进而来，对这块懂得不多，没有细看。

### (21 HPCA) BoomGate: Deadlock Avoidance in Non-Minimal Routing for High-Radix Networks

提出了一种通用的非最短路由无死锁方案，可以用于Dragonfly。通过限制一些非最短路来达到无死锁的目的，但是通过credit判断，当网络可以保证包能抵达目的地时（即网络不是很忙时），一些被限制的非最短路仍然是可以走的。

### (21 GLOBECOM) Flow-level Adaptive Routing Scheme for RDMA enabled Dragonfly Network

因为RDMA的流很长，且为了保证包的按序到达，所以用交换机中的排队长度来进行自适应路由的决策不准。文章提出了用各个流剩余流长度来综合考虑自适应路由决策的方法。并且因为需要组内其他交换机的信息，所以每次一个新的流到达了，要发送一个请求到组内的其他出口交换机去计算剩余流长度，然后将结果发送回来。（个人感觉不是特别靠谱）

### (21 LCOMM) A Visual Analytics Framework for Reviewing Streaming Performance Data

将路径按优先级从高到低分成了3种：①最短路径；②G-L-G路径；③L-G-L-G-L；优先选择最短的。然后还做了一个拥塞控制，当检测到拥塞，发送一个CNP给上一跳。
