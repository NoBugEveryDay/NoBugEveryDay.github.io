---
title: 安装OneAPI-2023.2.0的一点记录
date: 2023-09-25T00:00:00.000Z
slug: install-intel-oneapi-2023
categories:
  - Linux
  - 安装教程
tags:
  - Linux
  - OneAPI
---
## 摘要

本来以为安装Intel OneAPI全家桶应该挺容易的，以前也一直是直接加载全家桶。这次想分模块管理已安装的东西，就遇到了一些抽象的东西，在这里记录一下，不知道是不是我搞错了什么，感到了一丝迷惑。

<!-- more --> 

## Task

安装`l_BaseKit_p_2023.2.0.49397_offline.sh` 和 `l_HPCKit_p_2023.2.0.49440_offline.sh`

## 创建modulefiles

```bash
./modulefiles-setup.sh --output-dir=./modulefiles --ignore-latest
```

但是这样得到的`modulefiles`有些问题

1. 没有编译器相关的`modulefile`，需要自己用`env2`把`compiler/2023.2.0/env/vars.sh`转成一个`modulefile`

   ```bash
   ./env2 -from bash -to modulecmd -o "./compiler/2023.2.0/env/vars.sh"
   ```

2. `mkl/2023.2.0`的`modulefile`里需要将

   ```bash
   if { ![ is-loaded tbb ] }           { module load tbb }
   if { ![ is-loaded compiler-rt ] }   { module load compiler-rt }
   ```

   改为

   ```bash
   if { ![ is-loaded tbb/2021.10.0 ] }           { module load tbb/2021.10.0 }
   #if { ![ is-loaded compiler-rt ] }   { module load compiler-rt }
   ```

3. `mpi/2021.10.0`的`modulefile`里需要将所有的`intel64`改成`2021.10.0`

我一共暂时就只想用其中三个，但是每个都出问题了，还是直接加载大礼包算了

## 继续创建modulefiles

```bash
./env2 -from bash -to modulecmd -o "./software/oneapi/2023.2.0/setvars.sh"
```

但是使用modules管理环境还有一个问题，（应该是由于环境变量的管理）会产生一些以`_modshare`的环境变量，可能会引起一些报错，但大多应该只是warning

## 各种新的编译器

- `icc`： You may use ICC for performance on CPU targets.
- `icx`： `icx` is Intel nextgen compiler based on Clang /LLVM technology plus Intel proprietary optimizations and code generation.
