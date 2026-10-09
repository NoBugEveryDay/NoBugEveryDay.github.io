---
title: Intel MPI 常用技巧
date: 2019-02-20T00:00:00.000Z
slug: intel-mpi-tips
categories:
  - MPI
  - Intel MPI
tags:
  - MPI
  - Intel MPI
---
## 摘要

Intel MPI 常用技巧

<!-- more --> 

## 参数
### `-machinefile [file]`
将会在file中按照顺序将进程映射过去，如果进程数大于file中的host数量，将会从头映射
### `-hostfile [file] -ppn n`
将会按顺序为file中每个host分配n个进程

### `I_MPI_PIN=disable`

如果需要绑核，推荐disable掉默认绑核，然后使用 `numactl` 手动绑核
