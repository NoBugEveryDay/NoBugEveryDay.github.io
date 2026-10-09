---
title: 如何进行HPCC测试
date: 2020-05-13T00:00:00.000Z
slug: hpcc-benchmark
categories:
  - Benchmark
tags:
  - Benchmark
  - HPCC
---
## 摘要

HPCC是一个测试集，包含`RandomAcess`，`PTRANS`，`DGEMM`，`STREAM`，`FFT`，`Latency/Bandwidth`，`HPL`。

本文简要介绍如何编译运行HPCC。

<!-- more --> 

**本文内容为荣裕大佬的测试记录，非原创内容**

## 编译运行

HPCC编译主要依赖HPL内的Makefile，修改其中的makefile即可

```bash
cp ./hpl/setup/Make.xxxx ./hpl/
```

一堆Makefile里随便CP一个

```bash
vi ./hpl/Make.Linux
```

以下为使用ICC+MKL的Makefile

```makefile
#  
#  -- High Performance Computing Linpack Benchmark (HPL)                
#     HPL - 2.0 - September 10, 2008                          
#     Antoine P. Petitet                                                
#     University of Tennessee, Knoxville                                
#     Innovative Computing Laboratory                                 
#     (C) Copyright 2000-2008 All Rights Reserved                       
#                                                                       
#  -- Copyright notice and Licensing terms:                             
#                                                                       
#  Redistribution  and  use in  source and binary forms, with or without
#  modification, are  permitted provided  that the following  conditions
#  are met:                                                             
#                                                                       
#  1. Redistributions  of  source  code  must retain the above copyright
#  notice, this list of conditions and the following disclaimer.        
#                                                                       
#  2. Redistributions in binary form must reproduce  the above copyright
#  notice, this list of conditions,  and the following disclaimer in the
#  documentation and/or other materials provided with the distribution. 
#                                                                       
#  3. All  advertising  materials  mentioning  features  or  use of this
#  software must display the following acknowledgement:                 
#  This  product  includes  software  developed  at  the  University  of
#  Tennessee, Knoxville, Innovative Computing Laboratory.             
#                                                                       
#  4. The name of the  University,  the name of the  Laboratory,  or the
#  names  of  its  contributors  may  not  be used to endorse or promote
#  products  derived   from   this  software  without  specific  written
#  permission.                                                          
#                                                                       
#  -- Disclaimer:                                                       
#                                                                       
#  THIS  SOFTWARE  IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
#  ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES,  INCLUDING,  BUT NOT
#  LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
#  A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE UNIVERSITY
#  OR  CONTRIBUTORS  BE  LIABLE FOR ANY  DIRECT,  INDIRECT,  INCIDENTAL,
#  SPECIAL,  EXEMPLARY,  OR  CONSEQUENTIAL DAMAGES  (INCLUDING,  BUT NOT
#  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
#  DATA OR PROFITS; OR BUSINESS INTERRUPTION)  HOWEVER CAUSED AND ON ANY
#  THEORY OF LIABILITY, WHETHER IN CONTRACT,  STRICT LIABILITY,  OR TORT
#  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
#  OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. 
# ######################################################################
#  
# ----------------------------------------------------------------------
# - shell --------------------------------------------------------------
# ----------------------------------------------------------------------
#
SHELL        = /bin/sh
#
CD           = cd
CP           = cp
LN_S         = ln -s
MKDIR        = mkdir
RM           = /bin/rm -f
TOUCH        = touch
#
# ----------------------------------------------------------------------
# - Platform identifier ------------------------------------------------
# ----------------------------------------------------------------------
#
ARCH         = $(arch)
#
# ----------------------------------------------------------------------
# - HPL Directory Structure / HPL library ------------------------------
# ----------------------------------------------------------------------
#
TOPdir       = ../../..
INCdir       = $(TOPdir)/include
BINdir       = $(TOPdir)/bin/$(ARCH)
LIBdir       = $(TOPdir)/lib/$(ARCH)
#
HPLlib       = $(LIBdir)/libhpl.a 
#
# ----------------------------------------------------------------------
# - Message Passing library (MPI) --------------------------------------
# ----------------------------------------------------------------------
# MPinc tells the  C  compiler where to find the Message Passing library
# header files,  MPlib  is defined  to be the name of  the library to be
# used. The variable MPdir is only used for defining MPinc and MPlib.
#
# Mlib 可以选择静态连接mpiicxx.a
MPdir        = ${I_MPI_ROOT}
MPinc        = -I$(MPdir)/intel64/include
Mlib         = 
#
# ----------------------------------------------------------------------
# - Linear Algebra library (BLAS or VSIPL) -----------------------------
# ----------------------------------------------------------------------
# LAinc tells the  C  compiler where to find the Linear Algebra  library
# header files,  LAlib  is defined  to be the name of  the library to be
# used. The variable LAdir is only used for defining LAinc and LAlib.
# 关于MKL的fftw2编译之后提及
LAdir        = ${MKLROOT}
LAinc        = -I$(LAdir)/include -I$(LAdir)/include/fftw
LAlib        = ${MKLROOT}/lib/intel64/libmkl_scalapack_lp64.a -Wl,--start-group ${MKLROOT}/lib/intel64/libmkl_intel_lp64.a \
               ${MKLROOT}/lib/intel64/libmkl_intel_thread.a\
               ${MKLROOT}/lib/intel64/libmkl_core.a \
               ${MKLROOT}/lib/intel64/libmkl_cdft_core.a \
               ${MKLROOT}/lib/intel64/libfftw2xc_double_intel.a \
	       ${MKLROOT}/lib/intel64/libmkl_blacs_intelmpi_lp64.a \
               ${MKLROOT}/lib/intel64/libfftw2x_cdft_DOUBLE_ilp64.a \
               -Wl,--end-group -liomp5 -lpthread -lm -ldl
#
# ----------------------------------------------------------------------
# - F77 / C interface --------------------------------------------------
# ----------------------------------------------------------------------
# You can skip this section  if and only if  you are not planning to use
# a  BLAS  library featuring a Fortran 77 interface.  Otherwise,  it  is
# necessary  to  fill out the  F2CDEFS  variable  with  the  appropriate
# options.  **One and only one**  option should be chosen in **each** of
# the 3 following categories:
#
# 1) name space (How C calls a Fortran 77 routine)
#
# -DAdd_              : all lower case and a suffixed underscore  (Suns,
#                       Intel, ...),                           [default]
# -DNoChange          : all lower case (IBM RS6000),
# -DUpCase            : all upper case (Cray),
# -DAdd__             : the FORTRAN compiler in use is f2c.
#
# 2) C and Fortran 77 integer mapping
#
# -DF77_INTEGER=int   : Fortran 77 INTEGER is a C int,         [default]
# -DF77_INTEGER=long  : Fortran 77 INTEGER is a C long,
# -DF77_INTEGER=short : Fortran 77 INTEGER is a C short.
#
# 3) Fortran 77 string handling
#
# -DStringSunStyle    : The string address is passed at the string loca-
#                       tion on the stack, and the string length is then
#                       passed as  an  F77_INTEGER  after  all  explicit
#                       stack arguments,                       [default]
# -DStringStructPtr   : The address  of  a  structure  is  passed  by  a
#                       Fortran 77  string,  and the structure is of the
#                       form: struct {char *cp; F77_INTEGER len;},
# -DStringStructVal   : A structure is passed by value for each  Fortran
#                       77 string,  and  the  structure is  of the form:
#                       struct {char *cp; F77_INTEGER len;},
# -DStringCrayStyle   : Special option for  Cray  machines,  which  uses
#                       Cray  fcd  (fortran  character  descriptor)  for
#                       interoperation.
#
F2CDEFS      = -DAdd_ -DF77_INTEGER=long -DStringSunStyle 
#
# ----------------------------------------------------------------------
# - HPL includes / libraries / specifics -------------------------------
# ----------------------------------------------------------------------
#
HPL_INCLUDES = -I$(INCdir) -I$(INCdir)/$(ARCH) $(LAinc) $(MPinc)
HPL_LIBS     = $(HPLlib) $(LAlib) $(MPlib) -lm
#
# - Compile time options -----------------------------------------------
#
# -DHPL_COPY_L           force the copy of the panel L before bcast;
# -DHPL_CALL_CBLAS       call the cblas interface;
# -DHPL_CALL_VSIPL       call the vsip  library;
# -DHPL_DETAILED_TIMING  enable detailed timers;
#
# By default HPL will:
#    *) not copy L before broadcast,
#    *) call the BLAS Fortran 77 interface,
#    *) not display detailed timing information.
#
HPL_OPTS     = -DHPL_CALL_CBLAS -DUSING_FFTW -DRA_SANDIA_OPT2 -DLONG_IS_64BITS -DHPCC_MEMALLCTR -DMKL_INT=long -DHPCC_FFT_235
#
# ----------------------------------------------------------------------
#
HPL_DEFS     = $(F2CDEFS) $(HPL_OPTS) $(HPL_INCLUDES)
#
# ----------------------------------------------------------------------
# - Compilers / linkers - Optimization flags ---------------------------
# ----------------------------------------------------------------------
#
CC           = mpiicc
CCNOOPT      = $(HPL_DEFS)
CCFLAGS      = $(HPL_DEFS)  -std=c99 -xHOST -O3 -ipo -no-prec-div -static-intel -fp-model fast=2 -ansi-alias -fno-alias 
#
# On some platforms,  it is necessary  to use the Fortran linker to find
# the Fortran internals used in the BLAS library.
#
LINKER       = mpiicc 
LINKFLAGS    = $(CCFLAGS) -z relro -z now -Wl,-R'$$ORIGIN/lib/intel64' -liomp5 -L$(MKL_LIB) -mkl
#
ARCHIVER     = xiar
ARFLAGS      = r
RANLIB       = echo
#
# ----------------------------------------------------------------------
```

**之后编译MKL库中的fftw2**

```bash
sudo su
module load nvme/intel/2018.4
cd $MKLROOT
cd interfaces/
cd fftw2xc 
make libintel64 PRECISION=MKL_DOUBLE interface=ilp64 compiler=intel
cd ..
cd fftw2x_cdft
make libintel64 PRECISION=MKL_DOUBLE interface=ilp64 compiler=intel
```

*注意这里需要ilp64 主要问题是其接口为 int 不然有可能出现爆int*, 但其他时候不需要ilp64,会使得HPL出现段错误

**正式编译**

```bash
make arch=Linux -j
```

之后会生成`_hpccinf.txt`

```bash
cp _hpccinf.txt hpccinfo.txt
```

**运行**

```bash
mpirun -n xxx ./hpcc
# 结果在 hpccout.txt中
```

**关于编译选项**

```
-DHPCC_FFT_235` ：如没有此定义 运行`MPIFFT`时 N(进程数)会自动变为2的幂，当使用此定义时`N=2^x * 3^y * 5^z
```

`-DHPCC_FFTW_ESTIMATE`：影响FFTW库的调用方式，会降低性能，但会加速FFT时间。

`-DHPCC_MEMALLCTR`： 可以很大的N

`-DHPL_USE_GETPROCESSTIMES` ： 将使用特定于Windows的GetProcessTimes（）函数来测量经过的CPU时间。

`-DUSE_MULTIPLE_RECV`： 同时多个非阻塞接收，默认只有一个非阻塞接收。

`-DRA_SANDIA_NOPT`：如果定义了此符号，则不会使用Global RandomAccess的HPC Challenge标准算法。 相反，将使用桑迪亚国家实验室的替代实施方案。 它通过MPI进程形成的虚拟超立方体拓扑在软件中路由消息。

`-DRA_SANDIA_OPT2` ： 如果定义了此符号，则不会使用Global RandomAccess的HPC Challenge标准算法。 相反，将使用桑迪亚国家实验室的替代实施方案。 该实现针对作为2的幂的处理器的数量进行了优化。 优化是在发送和展开数据更新循环之前对数据进行排序。 如果进程数不是幂2，则代码与使用RA_SANDIA_NOPT设置执行的代码相同。

`-DRA_TIME_BOUND_DISABLE` ： 如果定义了此符号，则将使用标准的Global RandomAccess代码而不受时间限制。 对于大多数运行，这是不鼓励的，因为对于大型阵列大小，标准算法往往很慢，因为短MPI消息的开销很大。

`-DUSING_FFTW` ： 使用FFTW库

## BUG

修改注释掉一处 fftw_destroy_plan(p);

位置：`./FFT/tstfft.c`

原因：N开大后段错误

影响：没有销毁释放内存，无其他影响

## 修改代码只运行部分测试

修改 `src/hpcc.c`

注释掉不要测试的注释即可

## 结果解读

### 前缀意义

- MPI 全集群

- Star 所有进程自己跑自己的

- Single 所有进程按顺序跑

一般来说Single的性能会好于Star，因为多核一起跑往往会导致CPU降频还有共享内存带宽的问题

### 1. RandomAccess

RandomAccess measures the rate of random updates of memory.

#### 1.1. MPIRandomAccess

#### 1.2. StarRandomAccess

#### 1.3. SingleRandomAccess

#### 1.4. MPIRandomAccess LCG

 LCG = Linear Congruential Generator 线性同余生成器

我的理解就是生成的数可能更随机了叭

#### 1.5. StarRandomAccess LCG

#### 1.6. SingleRandomAccess LCG

### 2. PTRANS

PTRANS measures the rate of transfer for large arrays of data from multiprocessor’s memory.

全集群运行，使用HPL中的参数变化而成

M=N=HPL(N/2)

NB=MB=HPL(NB)

P=HPL(Q)

Q=HPL(Q)

### 3. DGEMM

DGEMM measures the floating point execution rate for double precision real matrix-matrix multiplication.

#### 3.1. StarDGEMM

#### 3.2. SingleDGEMM

### 4.STREAM

STREAM is a benchmark that measures sustainable memory bandwidth (in GB/s).

#### 4.1 StarSTREAM

#### 4.2 SingleSTREAM

### 5. FFT

FFT measures the floating point rate of execution of double precision complex one-dimensional Discrete Fourier Tranform (DFT).

#### 5.1. MPIFFT

在这个测试中，如果结果不稳定，可能是因为N开得不够大

#### 5.2. StarFFT

#### 5.3. SingleFFT

### 6. Latency/Bandwidth

### 7. HPL

不建议跑这个测试
