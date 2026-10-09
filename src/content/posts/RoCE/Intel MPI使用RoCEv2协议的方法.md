---
title: Intel MPI使用RoCEv2协议的方法
date: 2019-02-19T00:00:00.000Z
slug: intel-mpi-rocev2
categories:
  - RoCE
tags:
  - RoCE
  - Intel MPI
  - MPI
---
## 摘要

本文将介绍如何使Intel MPI在RoCE协议上通信

<!-- more --> 

参考：[https://hpcadvisorycouncil.atlassian.net/wiki/spaces/HPCWORKS/pages/156237831/How+to+set+up+IntelMPI+over+RoCEv2](https://hpcadvisorycouncil.atlassian.net/wiki/spaces/HPCWORKS/pages/156237831/How+to+set+up+IntelMPI+over+RoCEv2 "https://hpcadvisorycouncil.atlassian.net/wiki/spaces/HPCWORKS/pages/156237831/How+to+set+up+IntelMPI+over+RoCEv2")
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
`Intel Parallel Studio`版本：`2018 update4`

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
3. 新建如下的`dat.conf`，并将下面的`eth4`用你`ibdev2netdev`对应的设备名称替代
```shell
$ cat dat.conf
ofa-v2-cma-roe-eth4 u2.0 nonthreadsafe default libdaplofa.so.2 dapl.2.0 "eth4 0" ""
```
4. 用下面的命令来运行你的程序，同样将下面的`enp5s0f1`用你`ibdev2netdev`对应的设备名称替代
```shell
mpirun -n 2 -machinefile machinefile -genv I_MPI_DEBUG 4 -genv I_MPI_FALLBACK 0 -genv I_MPI_FABRICS shm:dapl -genv DAT_OVERRIDE ./dat.conf -genv I_MPI_DAT_LIBRARY /usr/lib64/libdat2.so -genv I_MPI_DAPL_PROVIDER=ofa-v2-cma-roe-eth4 ./osu_bw
```
**注意：一定要使用`-genv I_MPI_FABRICS shm:dapl`和`-genv I_MPI_FALLBACK 0`而不要只使用`-dapl`, this will guarantee that no fabric fallback will happen. If they simply use -dapl this allows the fabric to fallback to other DAPL capable device.**

## 运行结果样例
### 带宽测试
```
$ mpirun -n 2 -machinefile machinefile -genv I_MPI_DEBUG 4 -genv I_MPI_FALLBACK 0 -genv I_MPI_FABRICS shm:dapl -genv DAT_OVERRIDE ./dat.conf -genv I_MPI_DAT_LIBRARY /usr/lib64/libdat2.so -genv I_MPI_DAPL_PROVIDER=ofa-v2-cma-roe-eth4 ./osu_bw
[0] MPI startup(): Multi-threaded optimized library
[1] DAPL startup(): trying to open DAPL provider from I_MPI_DAPL_PROVIDER: ofa-v2-cma-roe-eth4
[0] DAPL startup(): trying to open DAPL provider from I_MPI_DAPL_PROVIDER: ofa-v2-cma-roe-eth4
[1] MPI startup(): DAPL provider ofa-v2-cma-roe-eth4
[1] MPI startup(): shm and dapl data transfer modes
[0] MPI startup(): DAPL provider ofa-v2-cma-roe-eth4
[0] MPI startup(): shm and dapl data transfer modes
[1] MPID_nem_init_dapl_coll_fns(): User set DAPL collective mask = 0000
[1] MPID_nem_init_dapl_coll_fns(): Effective DAPL collective mask = 0000
[0] MPID_nem_init_dapl_coll_fns(): User set DAPL collective mask = 0000
[0] MPID_nem_init_dapl_coll_fns(): Effective DAPL collective mask = 0000
[0] MPI startup(): Rank    Pid      Node name  Pin cpu
[0] MPI startup(): 0       12475    cpn57      {0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,
                                 30,31,32,33,34,35}
[0] MPI startup(): 1       12458    cpn58      {0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,
                                 30,31,32,33,34,35}
# OSU MPI Bandwidth Test v5.4.3
# Size      Bandwidth (MB/s)
1                       1.60
2                       3.70
4                       9.99
8                      19.96
16                     36.36
32                    102.25
64                    200.68
128                   380.51
256                   714.27
512                  1223.09
1024                 1878.35
2048                 2390.97
4096                 2591.60
8192                 2699.45
16384                2753.60
32768                2777.68
65536                2789.97
131072               2797.27
262144               2081.49
524288               2326.99
1048576              2479.62
2097152              2541.34
4194304              2542.35
```
### 延迟测试
```
$ mpirun -n 2 -machinefile machinefile -genv I_MPI_DEBUG 4 -genv I_MPI_FALLBACK 0 -genv I_MPI_FABRICS shm:dapl -genv DAT_OVERRIDE ./dat.conf -genv I_MPI_DAT_LIBRARY /usr/lib64/libdat2.so -genv I_MPI_DAPL_PROVIDER=ofa-v2-cma-roe-eth4 ./osu_latency
[0] MPI startup(): Multi-threaded optimized library
[0] DAPL startup(): trying to open DAPL provider from I_MPI_DAPL_PROVIDER: ofa-v2-cma-roe-eth4
[1] DAPL startup(): trying to open DAPL provider from I_MPI_DAPL_PROVIDER: ofa-v2-cma-roe-eth4
[1] MPI startup(): DAPL provider ofa-v2-cma-roe-eth4
[1] MPI startup(): shm and dapl data transfer modes
[0] MPI startup(): DAPL provider ofa-v2-cma-roe-eth4
[0] MPI startup(): shm and dapl data transfer modes
[0] MPID_nem_init_dapl_coll_fns(): User set DAPL collective mask = 0000
[0] MPID_nem_init_dapl_coll_fns(): Effective DAPL collective mask = 0000
[1] MPID_nem_init_dapl_coll_fns(): User set DAPL collective mask = 0000
[1] MPID_nem_init_dapl_coll_fns(): Effective DAPL collective mask = 0000
[0] MPI startup(): Rank    Pid      Node name  Pin cpu
[0] MPI startup(): 0       12562    cpn57      {0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,
                                 30,31,32,33,34,35}
[0] MPI startup(): 1       12596    cpn58      {0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,
                                 30,31,32,33,34,35}
# OSU MPI Latency Test v5.4.3
# Size          Latency (us)
0                       1.87
1                       1.75
2                       1.71
4                       1.68
8                       1.67
16                      1.67
32                      2.10
64                      2.10
128                     2.16
256                     2.25
512                     2.42
1024                    2.76
2048                    3.28
4096                    4.32
8192                    6.27
16384                   9.00
32768                  14.69
65536                  26.58
131072                 50.04
262144                128.51
524288                231.12
1048576               432.05
2097152               829.53
4194304              1652.17
```
## 使用IB模式
### 带宽测试
使用参数`-genv I_MPI_FABRICS shm:ofi`
```
$ mpirun -n 2 -machinefile machinefile -genv I_MPI_FABRICS shm:ofa ./osu_bw
# OSU MPI Bandwidth Test v5.4.3
# Size      Bandwidth (MB/s)
1                       1.12
2                       2.80
4                       8.06
8                      16.35
16                     35.22
32                     71.54
64                    133.99
128                   265.80
256                   523.78
512                  1033.38
1024                 1939.45
2048                 3421.43
4096                 5653.31
8192                 8185.46
16384                8365.28
32768               10282.42
65536               10514.72
131072              11812.39
262144              11900.89
524288              11885.06
1048576             11981.25
2097152             12003.02
4194304             12000.84
```
### 延迟测试
```
$ mpirun -n 2 -machinefile machinefile -genv I_MPI_FABRICS shm:ofa ./osu_latency
# OSU MPI Latency Test v5.4.3
# Size          Latency (us)
0                       1.46
1                       1.29
2                       1.25
4                       1.22
8                       1.20
16                      1.19
32                      1.25
64                      1.64
128                     1.67
256                     1.71
512                     1.79
1024                    1.94
2048                    2.33
4096                    2.85
8192                    4.04
16384                   5.03
32768                   7.24
65536                  10.86
131072                 18.44
262144                 32.05
524288                 99.48
1048576               162.69
2097152               313.73
4194304               594.18
```
## 在以太网卡上使用TCP/IP协议
使用以下指令即可
```shell
mpirun -n 2 -machinefile machinefile -genv I_MPI_FABRICS shm:tcp ./osu_bw
```
### 带宽测试
```shell
$ mpirun -n 2 -machinefile machinefile -genv I_MPI_FABRICS shm:tcp ./osu_bw
# OSU MPI Bandwidth Test v5.4.3
# Size      Bandwidth (MB/s)
1                       0.39
2                       0.97
4                       2.25
8                       4.47
16                      9.73
32                     18.02
64                     37.26
128                    70.90
256                   127.02
512                   242.17
1024                  359.32
2048                  575.46
4096                 1009.76
8192                 1644.98
16384                2413.53
32768                2711.62
65536                2842.15
131072               2882.19
262144               2883.33
524288               2908.10
1048576              2914.79
2097152              2757.24
4194304              2695.78
```
### 延迟测试
```shell
$ mpirun -n 2 -machinefile machinefile -genv I_MPI_FABRICS shm:tcp ./osu_latency
# OSU MPI Latency Test v5.4.3
# Size          Latency (us)
0                      13.55
1                      12.81
2                      13.04
4                      13.08
8                      12.80
16                     12.83
32                     13.00
64                     13.02
128                    13.00
256                    13.51
512                    13.89
1024                   15.13
2048                   23.55
4096                   31.95
8192                   30.90
16384                  32.39
32768                  39.90
65536                  90.76
131072                108.62
262144                169.00
524288                250.63
1048576               426.61
2097152               827.51
4194304              1607.94
```
