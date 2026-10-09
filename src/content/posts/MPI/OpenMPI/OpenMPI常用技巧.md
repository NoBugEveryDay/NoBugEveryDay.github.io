---
title: OpenMPI常用技巧
date: 2019-02-20T00:00:00.000Z
slug: openmpi-tips
categories:
  - MPI
  - OpenMPI
tags:
  - MPI
  - OpenMPI
---
## 摘要

OpenMPI常用技巧

<!-- more --> 

## mpirun参数
### `-x NAME[=value]`
可以将环境变量NAME传递给所有进程，或者在所有进程启动前将环境变量NAME设置为value
### `--allow-run-as-root`
允许使用root用户运行程序
### `--prefix [openmpi-build目录]`
在集群上mpirun时如果其他节点没有在登陆环境变量中加载openmpi，则用这个参数指定openmpi所在位置
### `--map-by node`
只用这个参数openmpi才会machinefile里按顺序，一个host一个进程，如果某一个host要多一个进程，多写一次就好。
### `--mca btl openib,self,vader`
这个参数将显示指定openmpi使用IB网，其中vader表示同节点内进程使用共享内存通信，self表示进程和它自己通信，不加self可能导致不能和自己通信
### `--mca btl_openib_if_include mlx5_2`
和上面一个参数联用，可以指定用于ib通信的网卡，这里的网卡名称由`ibstat`得到
### `--mca btl tcp,self,vader`
这个参数将指定openmpi使用TCP/IP协议进行通信
### `--mca btl_tcp_if_include eth4`
和上面一个参数联用，可以指定用于通信的设备，这里的设备名称由`ifconfig`得到
### `--mca pml ob1 --mca btl openib,self,vader --mca btl_openib_cpc_include rdmacm --mca btl_openib_rroce_enable 1`
这个参数将指定openmpi使用RoCEv2协议进行通信
### `-hostfile [file]` / `-machinefile [file]`
file中在每一个hostname后面可以加上slots=n，表示在这个host上运行n个进程
## 一些帮助文档中常见的缩写
- MCA = Modular Component Architecture 组件模块
- CPC = Connection Pseudo-Component
- btl =  Byte transfer layer (point-to-point byte movement)
- bml= BTL management layer (managing multiple devices)
- pml= MPI point-to-point management layer
## ompi_info
ompi_info指令可以获取mpirun中的各种参数的帮助信息
比如不清楚`mpirun -n 2 -machinefile machinefile --mca btl vader,self ./test` 中的参数就可以

```shell
$ ompi_info --param btl vader --level 9
MCA btl: vader (MCA v2.1.0, API v3.0.0, Component v3.1.6)
           MCA btl vader: ---------------------------------------------------
           MCA btl vader: parameter "btl_vader_free_list_num" (current value:
                          "8", data source: default, level: 9 dev/all, type:
                          int)
                          Initial number of fragments to allocate for shared
                          memory communication.
# 后面其他参数省略
```
如果想查看btl中的全部就用
```shell
ompi_info --param btl all --level 9
```

如果想要查看设置collective操作的算法的参数

```shell
ompi_info --param coll tuned --level 9
```

## 通过其他方法设置参数

有时要通过slurm启动mpi程序，不能通过`--mca key=value`的方法来设置参数，此时可以通过设置环境变量或者配置文件来设置参数

参考：https://www.open-mpi.org/faq/?category=tuning#setting-mca-params
