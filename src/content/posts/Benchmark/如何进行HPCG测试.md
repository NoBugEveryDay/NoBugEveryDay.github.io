---
title: 如何进行HPCG测试
date: 2019-08-30T00:00:00.000Z
slug: hpcg-benchmark
categories:
  - Benchmark
tags:
  - Benchmark
  - HPCG
---
## 简介

HPCG是当前top500所采用的测试程序，是一个精简的大型稀疏方程组并行求解器，内存/显存带宽是其主要影响因素，是常用的高性能测试工具。本文将介绍如何将这两种测试程序在集群上跑出尽可能高的性能。

<!-- more --> 

## 环境

本测试方法完全基于Intel的MKL库，因此需要安装`Intel Parallel Stdio`(这里使用的版本是2018update4)，并且直接使用其已经编译好的现成二进制包。并且我的环境中`public`是`NFS`

## 准备程序

程序位于`/path to/Intel Parallel Stdio/mkl/benchmarks/hpcg`，将其复制出来使用

```
cp -r /public/fgn/software/intel/2018.4/mkl/benchmarks/hpcg /public/fgn/benchmark
```

## 运行

```bash
cd /public/fgn/benchmark/hpcg
cd bin
OMP_NUM_THREADS=10 mpirun -n 2 ./xhpcg_avx2 # 这里选择适合自己架构的可执行文件即可
```

## 使用其他MPI编译器进行编译

在根目录下有个`QUICKSTART`介绍了如何使用其他MPI编译器进行编译，下面以使用`OpenMPI3.1.4`为例，进行编译

```bash
# 创建测试文件夹
mkdir build
cd build
mkdir openmpi3.1.4
cd openmpi3.1.4
# 选用现成OPENMPI_IOMP_AVX2作为配置文件
../../configure OPENMPI_IOMP_AVX2
# 不知道为啥configure并不会自己帮你复制过来……
cp ../../setup/Make.OPENMPI_IOMP_AVX2 ./setup/
make -j MKLROOT=/public/fgn/software/intel/2018.4/mkl MKL_INCLUDE=/public/fgn/software/intel/2018.4/mkl/include CXX=mpicxx
# 这里要记得指定CXX，不然会翻车……
cd bin
vim rankfile # 这里蜜汁不用rankfile就会翻车
mpirun -n 4 -x OMP_NUM_THREADS=10 -rankfile rankfile -x LD_LIBRARY_PATH ./xhpcg_avx2
```
