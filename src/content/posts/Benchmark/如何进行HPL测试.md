---
title: 如何进行HPL测试
date: 2019-08-30T00:00:00.000Z
slug: hpl-benchmark
categories:
  - Benchmark
tags:
  - Benchmark
  - HPL
---
<script type="text/javascript"
   src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML">
</script>


## 简介

HPL的计算任务是解一个大规模的稠密矩阵线性方程组，CPU/GPU的性能是其主要性能影响因素。它是当前top500所采用的测试程序，是非常常用的高性能测试工具。本文将介绍如何将这两种测试程序在集群上跑出尽可能高的性能。

<!-- more --> 

## 环境

本测试方法完全基于Intel的MKL库，因此需要安装`Intel Parallel Stdio`(这里使用的版本是2018update4)，并且直接使用其已经编译好的现成二进制包。并且我的环境中`public`是`NFS`

## 准备程序

程序位于`/path to/Intel Parallel Stdio/mkl/benchmarks/mp_linpack`，将其复制出来使用

```bash
cp -r /public/fgn/software/intel/2018.4/mkl/benchmarks/mp_linpack/* /public/fgn/benchmark/hpl
```

## 设置求解问题参数

编辑`HPL.dat`可以设置要求解的问题的参数，主要需要设置3个参数

### N：矩阵边长

该参数位于文件第六行，将设置求解的矩阵的规模，其大小取决于可用内存的大小，计算公式如下
$$
N=\frac{M*1024^3}{8}*90\%
$$
其中M为可用内存大小，单位为GB，如果是对集群进行测试，注意M是集群的内存总和。90%是一个经验值，可以根据实际情况调高或者调低。最后算出来的结果也可以上下浮动到一个比较好看的数值。

### NB：块大小

该参数位于文件第8行，这个的值取决于处理器的型号，Intel官方给出的建议如下

|                          Processor                           |  NB  |
| :----------------------------------------------------------: | :--: |
| Intel® Xeon® Processor X56*/E56*/E7-*/E7*/X7* (codenamed Nehalem or Westmere) | 256  |
| Intel Xeon Processor E26*/E26* v2 (codenamed Sandy Bridge or Ivy Bridge) | 256  |
| Intel Xeon Processor E26* v3/E26* v4 (codenamed Haswell or Broadwell) | 192  |
| Intel® Core™ i3/i5/i7-6* Processor (codenamed Skylake Client) | 192  |
|  Intel® Xeon Phi™ Processor 72* (codenamed Knights Landing)  | 336  |
| Intel Xeon Processor supporting Intel® Advanced Vector Extensions 512 (Intel® AVX-512) instructions (codenamed Skylake Server) | 384  |

但实际上建议把里面的值都测一下，看哪个更合适、

### P * Q

该参数位于文件第11、12行，取决于进程数，必须`进程数=P*Q`。而进程数取决于有几个CPU，注意这里是有几个CPU是物理CPU的个数，不是指核数，如果是双路服务器，就应该算2个CPU，这样测试结果才能够高。

## 设置脚本

编辑运行脚本`runme_intel64_static`中的来指定运行时的一些参数。另外也还有一个`runme_intel64_dynamic`，是使用动态库的版本，两个差不多，可以根据需要使用。

### MPI_PROC_NUM

该参数位于第21行，为总进程数，必须`进程数=P*Q`

### MPI_PER_NODE

改参数位于第27行，为每个节点进程数，取决于每个节点的CPU数量，如果是双路服务器就填2，四路服务器就填4，一个CPU就填1

### HOSTFILE

如果是需要多机运行吗，就需要在第74行的`mpirun`后添加参数`-hostfile hostfile`，然后新建一个名为`hostfile`的文件，里面一行一个的写上节点hostname

## 运行

```bash
./runme_intel64_static
```

要注意最后又校验通过的提示，如下

```
||Ax-b||_oo/(eps*(||A||_oo*||x||_oo+||b||_oo)*N)=        0.0031984 ...... PASSED
```

## 使用其他MPI编译器运行

这玩意还支持使用其他MPI编译器编译运行，这里以OpenMPI3.1.4为例

### 编译

```bash
module load module load openmpi/3.1.4-intel2018.4 # 加载环境
MKLROOT=/public/fgn/software/intel/2018.4/mkl ./build.sh
```

这里手动指定了`MKLROOT`是因为刚刚我们是把代码复制到了其他地方运行，所以要手动指定一下库的位置

### 修改运行脚本

首先也复制一份使用静态库的代码，然后对其进行修改

```bash
cp runme_intel64_static runme_intel64_openmpi3.1.4
vim runme_intel64_openmpi3.1.4
# 修改如下行数的指令
47 export HPL_EXE=xhpl
74 mpirun -hostfile hostfile -npernode ${MPI_PER_NODE} -np ${MPI_PROC_NUM} -x MPI_PER_NODE -x HPL_EXE ./runme_intel64_prv "$@" | tee -a $OUT
```

修改第47行是因为刚刚编译生成的可执行文件名问`xhpl`。

修改第74行是因为OpenMPI3.1.4的很多运行参数与Intel MPI有所不同，且需要手动传过去两个重要的变量`MPI_PER_NODE`和`HPL_EXE`

### 运行

```bash
./runme_intel64_openmpi3.1.4
```
