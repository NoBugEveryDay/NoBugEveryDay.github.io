---
title: 如何进行NPB测试
date: 2020-05-10T00:00:00.000Z
slug: npb-benchmark
categories:
  - Benchmark
tags:
  - Benchmark
  - NPB
---
## 摘要

[NPB(Nas Parallel Benchmark)](https://www.nas.nasa.gov/publications/npb.html)是NASA整的一套高性能测试集，大概是1990+年的时候弄出来的，现在已经到了`v3.4`版本了（2018年更新的），采用上古语言Fortran编写（不知道为啥既然挺多人喜欢用的不出一个C版本的），以下内容将简单介绍这玩意的安装与使用。因为是第一次踩坑，可能有些地方说的不对~

<!-- more --> 

## 版本区分

这玩意有好几个测试子集，分别是[NPB 3.4](https://www.nas.nasa.gov/assets/npb/NPB3.4.tar.gz)，[NPB 3.4-MZ](https://www.nas.nasa.gov/assets/npb/NPB3.4-MZ.tar.gz)，[GridNPB 3.1](https://www.nas.nasa.gov/assets/npb/GridNPB3.1.tar.gz)。这几个东西每个里面包含的测试内容还不一样

*这些不好翻译，直接丢原文*

### NPB 3.4

一般提到NPB一般都是指这个叭，它里面包含的内容如下，

- five kernels
  - IS - Integer Sort, random memory access
  - EP - Embarrassingly Parallel
  - CG - Conjugate Gradient, irregular memory access and communication
  - MG - Multi-Grid on a sequence of meshes, long- and short-distance communication, memory intensive
  - FT - discrete 3D fast Fourier Transform, all-to-all communication
- three pseudo applications
  - BT - Block Tri-diagonal solver
  - SP - Scalar Penta-diagonal solver
  - LU - Lower-Upper Gauss-Seidel solver
- Benchmarks for unstructured computation, parallel I/O, and data movement
  - UA - Unstructured Adaptive mesh, dynamic and irregular memory access
  - BT-IO - test of different parallel I/O techniques
  - DC - Data Cube
  - DT - Data Traffic

### NPB 3.4-MZ

- BT-MZ - uneven-size zones within a problem class, increased number of zones as problem class grows
- SP-MZ - even-size zones within a problem class, increased number of zones as problem class grows
- LU-MZ - even-size zones within a problem class, a fixed number of zones for all problem classes

### GridNPB 3.1

- ED - Embarrassingly Distributed
- HC - Helical Chain
- VP - Visualization Pipeline
- MB - Mixed Bag

## 编译安装 NPB 3.4

```bash
wget https://www.nas.nasa.gov/assets/npb/NPB3.4.tar.gz
tar -xvf NPB3.4.tar.gz
cd NPB3.4/NPB3.4-MPI/config
cp make.def.template make.def

vim make.def
# 根据需要修改编译器及编译参数

make ft CLASS=S
# ft是根据上面的版本选择要编译的模块，CLASS是运算量的大小

# 没有报错就可以修改如下文件来进行批量编译
vim config/suite.def
make suite
```

每一个测试模块的算例大小在编译是用`CLASS=`来指定，从小到大是`S,W,A,B,C,D,E,F`，部分测试模块可能没有某些大小的测试模块，具体的算例大小参数见https://www.nas.nasa.gov/publications/npb_problem_sizes.html。

网传的很多编译里面有用`NPROCS=`来指定编译出指定进程数运行的版本，但是这个参数貌似已经失效了？试了一下并没有用

## 运行

编译出来的可执行文件在`bin`里面，运行会发现很多都要求进程数为2的指数，如果不是2的指数，要么不能运行，要么不做验证且会变慢

### IS

- `E`算例需要约480G内存

### EP

- `E`算例需要约55G内存
- `F`算例需要约55G内存

这个测试需要的内存似乎生恒定的

### CG

- `D`算例需要约100G内存
- `E`算例需要约320G内存

### MG

- `E`算例需要约300G内存
- `F`算例需要约1760G内存

### FT

- 进程数必须为2的指数
- `D`算例需要256G内存
- `E`算例需要约1024G内存

### BT

- `E`算例需要约512G内存

### SP

- E算例需要416G内存

### LU

- E算例需要233.6G内存

## Reference

https://www.nas.nasa.gov/publications/npb.html
