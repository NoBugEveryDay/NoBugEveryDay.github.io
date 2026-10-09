---
title: OpenMPI1.10.7+Intel2018u4安装
date: 2019-03-21T00:00:00.000Z
slug: install-openmpi-1-10-7
categories:
  - MPI
  - OpenMPI
tags:
  - MPI
  - OpenMPI
  - intel
---
## 摘要

本文介绍如何使用Intel2018u4安装OpenMPI1.10.7

<!-- more --> 

## 指令
```shell
./configure --prefix=`pwd`/build-intel2018u4 --enable-orterun-prefix-by-default CC=icc CXX=icpc FC=ifort CFLAGS="-xHost -O3 -ip" CXXFLAGS="-xHost -O3 -ip" FCFLAGS="-xHost -O3 -ip" LDFLAGS="-Wc,-static-intel -L/GPUFS/nsccgz_yfdu_16/fgn/software/zlib-1.2.11/build-2018u4/lib"
make -j
make install
```
`-enable-orterun-prefix-by-default`：可以让运行时不用指定prefix
`-Wc,-static-intel`：可以静态链接intel的一些库，以防运行OpenMPI的指令时找不到库
