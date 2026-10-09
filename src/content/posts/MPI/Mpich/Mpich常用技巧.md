---
title: Mpich常用技巧
date: 2020-05-11T00:00:00.000Z
slug: mpich-tips
categories:
  - MPI
  - Mpich
tags:
  - MPI
  - Mpich
---
## 摘要

本文介绍Mpich在使用时常用的一些技巧

<!-- more --> 

## ssh定制

有时候系统的ssh是更改过的，是alias到别的地方的，所以在运行时要加类似如下参数

```bash
mpirun -launcher ssh -launcher-exec /usr/bin/nss_yhpc_ssh
```

## hostfile环境变量

有时候需要反复使用一个hostfile，每次运行时都加`-f hostfile`略麻烦，使用环境变量`HYDRA_HOST_FILE`可以指定hostfile所在的绝对路径，这样每次运行时只需要加`-ppn`来指定每个机器上运行的进程数即可（默认会每个节点都用）。如果再增加`-n `也是可以的，节点将会从前往后选用，每个节点`-ppn`个。

## 绑核

mpich的绑核机制并不完善，官方只提供了两个绑核参数，见：https://wiki.mpich.org/mpich/index.php/Using_the_Hydra_Process_Manager#Process-core_Binding

- `-bind-to <object[:num]>` 指定每一个进程绑定到什么多少个什么东西上面，常用object选项有：`socket`，`core`
- `-map-by <object[:num]>` 指定每两个进程之间隔多少个什么东西，默认和上面一样

在使用了`-bind-to`参数后，使用环境变量`HYDRA_TOPO_DEBUG=1`可以输出一个节点上的绑核结果

例子：如果在一台双路、每颗CPU有24核的节点上

例1：

```shell
HYDRA_TOPO_DEBUG=1 mpirun -launcher ssh -launcher-exec /usr/bin/nss_yhpc_ssh -ppn 8 -bind-to core echo -n ""
process 0 binding: 100000000000000000000000
process 1 binding: 010000000000000000000000
process 2 binding: 001000000000000000000000
process 3 binding: 000100000000000000000000
process 4 binding: 000010000000000000000000
process 5 binding: 000001000000000000000000
process 6 binding: 000000100000000000000000
process 7 binding: 000000010000000000000000
```

例2：

```shell
HYDRA_TOPO_DEBUG=1 mpirun -launcher ssh -launcher-exec /usr/bin/nss_yhpc_ssh -ppn 8 -bind-to core:2 echo -n ""
process 0 binding: 110000000000000000000000
process 1 binding: 001100000000000000000000
process 2 binding: 000011000000000000000000
process 3 binding: 000000110000000000000000
process 4 binding: 000000001100000000000000
process 5 binding: 000000000011000000000000
process 6 binding: 000000000000110000000000
process 7 binding: 000000000000001100000000
```

例3：

```shell
HYDRA_TOPO_DEBUG=1 mpirun -launcher ssh -launcher-exec /usr/bin/nss_yhpc_ssh -ppn 8 -bind-to core:2 -map-by core:3 echo -n ""
process 0 binding: 110000000000000000000000
process 1 binding: 000110000000000000000000
process 2 binding: 000000110000000000000000
process 3 binding: 000000000110000000000000
process 4 binding: 000000000000110000000000
process 5 binding: 000000000000000110000000
process 7 binding: 000000000000000000000110
process 6 binding: 000000000000000000110000
```

例4：

```shell
HYDRA_TOPO_DEBUG=1 mpirun -launcher ssh -launcher-exec /usr/bin/nss_yhpc_ssh -ppn 8 -bind-to socket echo -n ""
process 0 binding: 111111111111000000000000
process 1 binding: 000000000000111111111111
process 2 binding: 111111111111000000000000
process 3 binding: 000000000000111111111111
process 4 binding: 111111111111000000000000
process 5 binding: 000000000000111111111111
process 6 binding: 111111111111000000000000
process 7 binding: 000000000000111111111111
```

这东西似乎有一个缺陷是，没法在一颗CPU上连续绑定，比如上面例子中的8个进程，我希望前4个绑定在CPU0上的0123核，后4个我希望绑定在CPU1上的0123核。

这时候就只能借助`numactl`来帮忙，`--cpunodebind=`可以用来指定绑在哪一颗CPU上，`--physcpubind=`可以用来指定在哪个核上运行（与top中看到的相对应）

```shell
#!/bin/bash

#echo $PMI_RANK
LOCAL_RANK=$(expr $PMI_RANK % 8)
CORE_RANK=$(expr $LOCAL_RANK % 4)

EXE="echo -n \"\""

if [ $LOCAL_RANK -lt 4 ] ; then
	#numactl --cpunodebind=0 ${EXE}
	numactl --physcpubind=${CORE_RANK} ${EXE}
else
	#numactl --cpunodebind=1 ${EXE}
	numactl --physcpubind=$(expr ${CORE_RANK} + 12) ${EXE}
fi
```
