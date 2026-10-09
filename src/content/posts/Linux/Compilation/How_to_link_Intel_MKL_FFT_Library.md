---
title: How to link Intel MKL FFT Library
date: 2021-03-01T00:00:00.000Z
slug: link-intel-mkl-fft
categories:
  - Linux
  - Compilation
tags:
  - Linux
  - Compilation
---
## Abstract

Sometimes we want to use the FFT Library in MKL in order to improve performance. This blog introduces how to do it.

<!-- more --> 

## Introduction

**Counterintuitively, although FFT in integrate into MKL, it still needs to be compiled before use.** 

## Compile FFT Library

Firstly, enter the FFT library interface folder. If you don't have the full authority of this folder, a copy operation is needed.

```shell
cd $MKLROOT/interfaces
```

Then, for each directory with prefix `fftw`, enter that directory and execute the following compile command

```bash
make -j libintel64 \
	mpi=mpich2 \
	INSTALL_DIR=`pwd`/../lib64 \
	MKLROOT=${MKLROOT}
```

For more parameters details, just type make

```shell
$ make
Usage: make libia32|libintel64|libmic
            [PRECISION={MKL_DOUBLE|MKL_SINGLE}]
            [compiler=compiler_name]

  compiler_name - {pgi|gnu|intel}
        Default value: intel
        Intel(R) C Compiler as default

Additional macros:
  MKLROOT=<path>
        Path to Intel(R) MKL root directory with header files and libraries.
        Default value: ../..

  INSTALL_DIR=<path>
        Install the library to the specified location.
        Default value: $(MKLROOT)/lib/<arch>

  INSTALL_LIBNAME=<name>
        Specify the name of the library.
        Default value depends on PRECISION and compiler used:
          libfftw2xc_double_intel.a
```

It seems that, only static library is provided. Precision can be specified according to demand.

Finally, just link all the *.a files during link procedure.

## Reference

https://software.intel.com/content/www/cn/zh/develop/blogs/fftw-wrapper-mkl-dft.html
