---
title: Mvapich使用RoCEv2协议的方法
date: 2019-02-19T00:00:00.000Z
slug: mvapich-rocev2
categories:
  - RoCE
tags:
  - RoCE
  - Mvapich
  - MPI
---
## 摘要

本文将介绍如何使Mvapich在RoCE协议上通信

<!-- more --> 

## 官方文档
[http://mvapich.cse.ohio-state.edu/static/media/mvapich/mvapich2-2.3-userguide.html](http://mvapich.cse.ohio-state.edu/static/media/mvapich/mvapich2-2.3-userguide.html "http://mvapich.cse.ohio-state.edu/static/media/mvapich/mvapich2-2.3-userguide.html")
## 系统
内核版本：
```shell
$ uname -r
3.10.0-514.el7.lustre.zqh.20170930.x86_64
```
操作系统：
```shell
cat /etc/redhat-release
Red Hat Enterprise Linux Server release 7.3 (Maipo)
```
Mvapich版本：2.3
编译器：`Intel Parallel Studio 2018 update4`
## 设置
 1.  通过```ibdev2netdev```确认以太网卡的名称，然后确认该网卡的链路层是以太网模式。
```shell
$ ibdev2netdev
mlx5_0 port 1 ==> eth4 (Up)
mlx5_1 port 1 ==> eth5 (Down)
mlx5_2 port 1 ==> ib2 (Up)
$ ibstat mlx5_0
CA 'mlx5_0'
	CA type: MT4117
	Number of ports: 1
	Firmware version: 14.23.1020
	Hardware version: 0
	Node GUID: 0xec0d9a03009e9fae
	System image GUID: 0xec0d9a03009e9fae
	Port 1:
		State: Active
		Physical state: LinkUp
		Rate: 25
		Base lid: 0
		LMC: 0
		SM lid: 0
		Capability mask: 0x04010000
		Port GUID: 0xee0d9afffe9e9fae
		Link layer: Ethernet
```

2. 设置和确认使用的是RoCEv2协议
```shell
$ sudo cma_roce_mode -d mlx5_0 -p 1
IB/RoCE v1
$ sudo cma_roce_mode -d mlx5_0 -p 1 -m 2
RoCE v2
$ sudo cma_roce_mode -d mlx5_0 -p 1
RoCE v2
```
3. 编译Mvapich
注意这里要使用和在编译程序时一致的mpi，比如我这里使用Mvapich+icc编译程序，就要使用相同的icc编译Mvapich
4. 运行
直接运行即可，我的集群上竟然默认就使用的是RoCEv2了，我猜是因为```ibdev2netdev```这是第一个默认设备
**特别注意，在使用Intel Parallel Studio时很容易犯的一个错是直接把它的整个环境加载进来，这样会导致运行出错，一定要只加载icc等编译器的环境**
加载这个环境的方法是
```
source /path/to/parallel studio/compilers_and_libraries_2018/linux/pkg_bin/compilervars_arch.sh intel64
```
5. 编译
不知道为啥用这个mpi编译osu的时候总是编译完就会让命令行键入不回显，需要执行以下命令恢复
```shell
stty echo
```
但是这个敲起来还是比较麻烦，建议用`alias`给个别名放进`~/.bashrc`里
## 运行结果样例
### 带宽测试
```shell
$ mpirun -n 2 -machinefile machinefile ./osu_bw
# OSU MPI Bandwidth Test v5.4.3
# Size      Bandwidth (MB/s)
1                       3.80
2                       7.69
4                      15.54
8                      30.72
16                     60.88
32                    122.09
64                    244.45
128                   469.97
256                   862.44
512                  1633.65
1024                 2186.95
2048                 2493.68
4096                 2675.73
8192                 2771.85
16384                2773.66
32768                2832.93
65536                2862.59
131072               2877.88
262144               2885.61
524288               2888.82
1048576              2891.41
2097152              2892.35
4194304              2892.82
```
### 延迟测试
```shell
$ mpirun -n 2 -machinefile machinefile ./osu_latency
# OSU MPI Latency Test v5.4.3
# Size          Latency (us)
0                       1.82
1                       1.73
2                       1.69
4                       1.65
8                       1.64
16                      1.69
32                      1.70
64                      1.71
128                     1.77
256                     2.29
512                     2.45
1024                    2.80
2048                    3.30
4096                    4.52
8192                    6.51
16384                  11.90
32768                  17.58
65536                  28.92
131072                 51.62
262144                 96.93
524288                187.68
1048576               369.40
2097152               731.82
4194304              1456.77
```
## 使用IB模式
- 根据[官网教程](http://http://mvapich.cse.ohio-state.edu/static/media/mvapich/mvapich2-2.3-userguide.html "官网教程")5.2.8小节，使用`-iface [interface]`应该能指定使用的设备，但是并没用
- mvapich是基于mpich开发的，mpich的文档中指出使用环境变量`HYDRA_IFACE`也能指定设备，但是也没有用
- google找到的[问答](http://mailman.cse.ohio-state.edu/pipermail/mvapich-discuss/2013-July/004483.html "问答")中指出安装时指定运行时选择网络接口在使用Nemesis模式是可以的，也就是说要在安装时设定，还没试
- 最后通过down掉以太网卡终于实现走IB网
- 后记：后来终于发现用这两个环境变量可以控制使用IB`MV2_DEFAULT_PORT=1 MV2_IBA_HCA=mlx5_2`，参考[http://mailman.cse.ohio-state.edu/pipermail/mvapich-discuss/2012-April/003834.html](http://mailman.cse.ohio-state.edu/pipermail/mvapich-discuss/2012-April/003834.html "http://mailman.cse.ohio-state.edu/pipermail/mvapich-discuss/2012-April/003834.html")
### 带宽
```shell
$ mpirun -n 2 -machinefile machinefile ./osu_bw
# OSU MPI Bandwidth Test v5.4.3
# Size      Bandwidth (MB/s)
1                       2.12
2                       4.74
4                      10.46
8                      20.97
16                     41.91
32                     86.16
64                    174.81
128                   282.52
256                   534.66
512                  1043.81
1024                 1950.04
2048                 3479.47
4096                 4880.21
8192                 6332.86
16384                8827.87
32768               10882.21
65536               11404.98
131072              11700.43
262144              11895.25
524288              11986.89
1048576             12038.08
2097152             12061.16
4194304             12071.68
```
### 延迟
```shell
$ mpirun -n 2 -machinefile machinefile ./osu_latency
# OSU MPI Latency Test v5.4.3
# Size          Latency (us)
0                       1.57
1                       1.46
2                       1.39
4                       1.34
8                       1.31
16                      1.34
32                      1.34
64                      1.46
128                     1.56
256                     2.18
512                     2.27
1024                    2.42
2048                    2.73
4096                    4.05
8192                    5.60
16384                   8.29
32768                  10.46
65536                  13.54
131072                 21.29
262144                 34.27
524288                 58.33
1048576               100.42
2097152               187.14
4194304               363.78
```
## 使用TCP/IP协议
参考：[http://mvapich.cse.ohio-state.edu/static/media/mvapich/mvapich2-2.3-userguide.html#x1-210004.12](http://mvapich.cse.ohio-state.edu/static/media/mvapich/mvapich2-2.3-userguide.html#x1-210004.12 "http://mvapich.cse.ohio-state.edu/static/media/mvapich/mvapich2-2.3-userguide.html#x1-210004.12")
在Mvapich中是无法直接切换协议的，需要在安装时指定，有以下三种方法
```shell
# 第一种
./configure --with-device=ch3:sock
# 第二种
./configure --with-device=ch3:nemesis:ib,tcp
# 第三种
./configure --with-device=ch3:nemesis
```
第二中是官方推荐，但是我只能成功安装第一种和第三种，第二种我在安装的时候竟然出现了编译错误，不过第三种看起来只是安装了第二种的tcp模块
在测试时发现，延迟的迭代次数必须大幅增加，默认的迭代次数测出来的结果又较大的波动
### 使用第一种进行测试
#### 带宽测试
```shell
$ mpirun -n 2 -machinefile machinefile ./osu_bw -i 1000
# OSU MPI Bandwidth Test v5.4.3
# Size      Bandwidth (MB/s)
1                       0.20
2                       0.43
4                       0.81
8                       1.67
16                      3.20
32                      6.78
64                     13.27
128                    25.99
256                    54.43
512                   106.47
1024                  236.09
2048                  402.51
4096                  763.51
8192                 1381.91
16384                2411.14
32768                3313.02
65536                3398.46
131072               2674.93
262144               2762.67
524288               3417.15
1048576              3357.75
2097152              3530.03
4194304              3272.80
```
神奇了，竟然突破了我25G的网卡，怎么做到的？
#### 延迟测试
```shell
mpirun -n 2 -machinefile machinefile ./osu_latency   
# OSU MPI Latency Test v5.4.3
# Size          Latency (us)
0                      25.69
1                      22.61
2                      22.67
4                      22.70
8                      22.98
16                     23.19
32                     23.18
64                     22.90
128                    22.23
256                    22.52
512                    22.45
1024                   22.29
2048                   43.46
4096                   59.98
8192                   63.31
16384                  79.56
32768                  88.96
65536                 118.68
131072                200.89
262144                237.43
524288                305.84
1048576               548.97
2097152               980.25
4194304              1734.26
```
惨不忍睹
### 使用第三种记性测试
有两种运行方法
```shell
# 一种是
mpirun -n 2 -machinefile machinefile ./osu_bw
# 另一种是
MPICH_NEMESIS_NETMOD=tcp mpiexec -n 2 -machinefile machinefile ./osu_bw
```
我感觉没啥区别
#### 带宽测试
```shell
$ MPICH_NEMESIS_NETMOD=tcp mpiexec -n 2 -machinefile machinefile ./osu_bw -i 1000  
# OSU MPI Bandwidth Test v5.4.3
# Size      Bandwidth (MB/s)
1                       0.60
2                       1.41
4                       2.52
8                       4.58
16                      9.84
32                     16.82
64                     40.23
128                    73.93
256                   129.25
512                   192.53
1024                  246.99
2048                  468.40
4096                  880.27
8192                 1742.18
16384                2577.22
32768                2755.74
65536                2858.48
131072               2795.00
262144               2872.29
524288               2890.14
1048576              2907.92
2097152              2702.57
4194304              2662.88
```
#### 延迟测试
```shell
$ mpirun -n 2 -machinefile machinefile ./osu_latency -i 100000
# OSU MPI Latency Test v5.4.3
# Size          Latency (us)
0                       9.81
1                       9.90
2                       9.77
4                       9.76
8                       9.78
16                      9.74
32                      9.75
64                      9.77
128                     9.78
256                    10.31
512                    10.67
1024                   13.51
2048                   25.45
4096                   27.67
8192                   28.72
16384                  24.57
32768                  33.02
65536                  80.16
131072                122.51
262144                151.04
```
