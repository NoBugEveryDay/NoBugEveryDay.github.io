---
title: Intel Parallel Studio只加载icc等非mpi编译指令
date: 2019-03-21T00:00:00.000Z
slug: intel-parallel-studio-icc-only
categories:
  - MPI
  - Intel MPI
tags:
  - MPI
  - Intel MPI
---
特别注意，在使用Intel Parallel Studio时很容易犯的一个错是直接把它的整个环境加载进来，这样会导致在使用其他MPI时运行出错，一定要只加载icc等编译器的环境
加载这个环境的方法是
```shell
source /path/to/parallel studio/compilers_and_libraries_2018/linux/pkg_bin/compilervars_arch.sh intel64
```
这样可能还会少license，我的解决方法是把上面的指令转成module，然后通过加载完整的环境把完整环境中的license路径加到新的module中
