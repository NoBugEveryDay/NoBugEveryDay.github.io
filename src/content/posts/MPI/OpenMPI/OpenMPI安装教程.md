---
title: OpenMPI安装教程
date: 2019-08-30T00:00:00.000Z
slug: install-openmpi
categories:
  - MPI
  - OpenMPI
tags:
  - MPI
  - OpenMPI
---
## 摘要

本文介绍如何在CentOS7.6系统上使用Intel2018.4编译器安装OpenMPI1.10.7和OpenMPI3.1.4

<!-- more --> 

## OpenMPI1.10.7

安装命令

```shell
./configure --prefix=`pwd`/install --enable-orterun-prefix-by-default CC=icc CXX=icpc FC=ifort CFLAGS="-xHost -O3 -ip" CXXFLAGS="-xHost -O3 -ip" FCFLAGS="-xHost -O3 -ip" LDFLAGS="-Wc,-static-intel" --with-ucx=/usr
make -j
make -j check
make -j install
```

`-enable-orterun-prefix-by-default`：可以让运行时不用指定prefix

`-Wc,-static-intel`：可以静态链接intel的一些库，以防运行OpenMPI的指令时找不到库

`--with-ucx=/usr`：是OpenMPI1.10.7的bug，不加会在编译过程中出现如下的

```
libtool:   error: require no space between '-L' and '-lrt'
make[2]: *** [libmca_pml_ucx.la] Error 1
```

最后配置modulefile



## OpenMPI3.1.4

```shell
./configure --prefix=`pwd`/install --enable-orterun-prefix-by-default CC=icc CXX=icpc FC=ifort CFLAGS="-xHost -O3 -ip" CXXFLAGS="-xHost -O3 -ip" FCFLAGS="-xHost -O3 -ip" LDFLAGS="-Wc,-static-intel"
make -j
make -j check
make -j install
```

`-enable-orterun-prefix-by-default`：可以让运行时不用指定prefix

`-Wc,-static-intel`：可以静态链接intel的一些库，以防运行OpenMPI的指令时找不到库

如果没有事先安装`zlib`库的话，还需要安装`zlib`，并在configure中的`LDFLAGS`中添加：`-L/path/to/zlib-1.2.11/build-2018u4/lib`

最后我的configure结果如下

```
Open MPI configuration:
-----------------------
Version: 3.1.4
Build MPI C bindings: yes
Build MPI C++ bindings (deprecated): no
Build MPI Fortran bindings: mpif.h, use mpi, use mpi_f08
MPI Build Java bindings (experimental): no
Build Open SHMEM support: yes
Debug build: no
Platform file: (none)

Miscellaneous
-----------------------
CUDA support: no
PMIx support: internal
 
Transports
-----------------------
Cisco usNIC: no
Cray uGNI (Gemini/Aries): no
Intel Omnipath (PSM2): no
Intel SCIF: no
Intel TrueScale (PSM): no
Mellanox MXM: no
Open UCX: yes
OpenFabrics OFI Libfabric: no
OpenFabrics Verbs: yes
Portals4: no
Shared memory/copy in+copy out: yes
Shared memory/Linux CMA: yes
Shared memory/Linux KNEM: no
Shared memory/XPMEM: no
TCP: yes
 
Resource Managers
-----------------------
Cray Alps: no
Grid Engine: no
LSF: no
Moab: no
Slurm: yes
ssh/rsh: yes
Torque: no
 
OMPIO File Systems
-----------------------
Generic Unix FS: yes
Lustre: yes
PVFS2/OrangeFS: no
```
