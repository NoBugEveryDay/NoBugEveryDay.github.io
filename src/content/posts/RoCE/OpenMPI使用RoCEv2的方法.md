---
title: OpenMPI使用RoCEv2的方法
date: 2019-02-19T00:00:00.000Z
slug: openmpi-rocev2
categories:
  - RoCE
tags:
  - RoCE
  - OpenMPI
  - MPI
---
## 摘要

本文将介绍如何使OpenMPI在RoCE协议上通信

<!-- more --> 

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
OpenMPI版本：1.10.7
编译器：gcc 4.8.5
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
3. 编译,OpenMPI
注意这里要使用和在编译程序时一致的mpi，比如我这里使用Mvapich+gcc编译程序，就要使用相同的gcc编译OpenMPI
4. 运行
使用以下的命令
```shell
$ mpirun --map-by node --mca pml ob1 --mca btl openib,self,vader --mca btl_openib_if_include mlx5_0 --mca btl_openib_cpc_include rdmacm --mca btl_openib_rroce_enable 1 -n 2 -machinefile machinefile ./osu_bw
```
**注：`--mca btl_openib_if_include mlx5_0`是我后来加上去的，因为发现缺少这个参数无法在多个节点上每个节点跑多个进程**
如果出现如下错误
```
bash: orted: command not found
```
说明没有在每一个节点上都找到了环境，加上以下参数即可
```
--prefix /path/to/openmpi/build
```

## 运行结果样例
### 带宽测试
```
$ mpirun --prefix /GPUFS/nsccgz_yfdu_16/fgn/software/openmpi-1.10.7/build-gcc --map-by node --mca pml ob1 --mca btl openib,self,vader --mca btl_openib_cpc_include rdmacm --mca btl_openib_rroce_enable 1 -n 2 -machinefile machinefile ./osu_bw
# OSU MPI Bandwidth Test v5.4.3
# Size      Bandwidth (MB/s)
1                       3.74
2                       7.91
4                      15.81
8                      31.62
16                     63.32
32                    125.13
64                    252.09
128                   438.07
256                   854.16
512                  1524.39
1024                 2129.86
2048                 2454.24
4096                 2649.46
8192                 2752.32
16384                2804.36
32768                2847.53
65536                2870.22
131072               2877.39
262144               2887.46
524288               2890.45
1048576              2891.88
2097152              2892.60
4194304              2892.98
```
### 延迟测试
```shell
$ mpirun --prefix /GPUFS/nsccgz_yfdu_16/fgn/software/openmpi-1.10.7/build-gcc --map-by node --mca pml ob1 --mca btl openib,self,vader --mca btl_openib_cpc_include rdmacm --mca btl_openib_rroce_enable 1 -n 2 -machinefile machinefile ./osu_latency
# OSU MPI Latency Test v5.4.3
# Size          Latency (us)
0                       1.58
1                       1.61
2                       1.61
4                       1.61
8                       1.64
16                      1.65
32                      1.66
64                      1.68
128                     2.14
256                     2.24
512                     2.42
1024                    2.92
2048                    3.49
4096                    4.74
8192                    7.13
16384                  11.08
32768                  16.73
65536                  28.12
131072                 50.73
262144                 96.05
524288                186.86
1048576               368.49
2097152               731.01
4194304              1455.82
```
## 使用IB网卡
使用如下指令
```shell
mpirun --map-by node --mca btl openib,self,vader --mca btl_openib_if_include mlx5_2 -n 2 -machinefile machinefile ./osu_bw
```
### 带宽测试
```
$ mpirun --prefix /GPUFS/nsccgz_yfdu_16/fgn/software/openmpi-1.10.7/build-gcc --map-by node --mca btl openib,self,vader --mca btl_openib_if_include mlx5_2 -n 2 -machinefile machinefile ./osu_bw   
# OSU MPI Bandwidth Test v5.4.3
# Size      Bandwidth (MB/s)
1                       2.38
2                       4.78
4                       9.64
8                      19.49
16                     39.19
32                     77.27
64                    153.00
128                   298.40
256                   573.64
512                  1072.53
1024                 1903.25
2048                 2981.95
4096                 4155.02
8192                 5911.01
16384                7324.53
32768                9893.22
65536               11481.64
131072              11847.93
262144              11973.96
524288              12039.87
1048576             12066.01
2097152             12070.17
4194304             12071.06
```
### 延迟测试
```shell
$ mpirun --prefix /GPUFS/nsccgz_yfdu_16/fgn/software/openmpi-1.10.7/build-gcc --map-by node --mca btl openib,self,vader --mca btl_openib_if_include mlx5_2 -n 2 -machinefile machinefile ./osu_latency
# OSU MPI Latency Test v5.4.3
# Size          Latency (us)
0                       1.39
1                       1.34
2                       1.29
4                       1.26
8                       1.28
16                      1.28
32                      1.28
64                      1.41
128                     1.95
256                     2.04
512                     2.22
1024                    2.53
2048                    2.97
4096                    3.97
8192                    5.59
16384                   7.21
32768                   9.34
65536                  12.45
131072                 20.23
262144                 33.38
524288                 57.42
1048576               100.13
2097152               187.48
4194304               362.63
```
## 在以太网卡上使用TCP/IP协议
使用如下指令
```shell
mpirun --prefix /GPUFS/nsccgz_yfdu_16/fgn/software/openmpi-1.10.7/build-gcc --map-by node --mca btl tcp,self,vader --mca btl_tcp_if_include eth4 -n 2 -machinefile machinefile ./osu_bw
```
### 带宽测试
```shell
$ mpirun --prefix /GPUFS/nsccgz_yfdu_16/fgn/software/openmpi-1.10.7/build-gcc --map-by node --mca btl tcp,self,vader --mca btl_tcp_if_include eth4 -n 2 -machinefile machinefile ./osu_bw 
# OSU MPI Bandwidth Test v5.4.3
# Size      Bandwidth (MB/s)
1                       0.55
2                       1.38
4                       3.31
8                       6.66
16                     13.04
32                     25.39
64                     44.38
128                    88.51
256                   165.22
512                   330.97
1024                  582.73
2048                 1075.26
4096                 1933.49
8192                 2492.26
16384                2716.43
32768                2828.76
65536                2739.29
131072               2827.65
262144               2892.41
524288               2912.70
1048576              2920.82
2097152              2797.93
4194304              2661.96
```
### 延迟测试
```shell
$ mpirun --prefix /GPUFS/nsccgz_yfdu_16/fgn/software/openmpi-1.10.7/build-gcc --map-by node --mca btl tcp,self,vader --mca btl_tcp_if_include eth4 -n 2 -machinefile machinefile ./osu_latency
# OSU MPI Latency Test v5.4.3
# Size          Latency (us)
0                       8.22
1                       7.70
2                       8.98
4                       9.53
8                       8.26
16                      8.00
32                      9.22
64                      9.17
128                     8.98
256                     8.72
512                     8.81
1024                    9.39
2048                   28.10
4096                   36.52
8192                   35.12
16384                  37.31
32768                  34.89
65536                 116.75
131072                126.61
262144                142.80
524288                237.69
1048576               421.86
2097152               800.27
4194304              1571.76
​```馈控制包（CNP包）的默认DSCP值是48，所以交换机上设置的确保转发的优先队列编号是6
```
