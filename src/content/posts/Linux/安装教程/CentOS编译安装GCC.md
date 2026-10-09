---
title: CentOS编译安装GCC
date: 2019-08-27T00:00:00.000Z
slug: build-gcc-from-source-on-centos
categories:
  - Linux
  - 安装教程
tags:
  - Linux
  - GCC
---
## 摘要

本文介绍如何在CentOS7.6环境下安装GCC7.4到用户自定义目录，并且不需要root

<!-- more --> 

## 参考

官方教程：https://gcc.gnu.org/install/configure.html

https://www.hualuoo.com/linux_study/72.html

## 下载

地址：https://gcc.gnu.org/

![1566910777025.png](CentOS编译安装GCC/1566910777025.png)

随便找个源，在目录`Index of /software/gcc/releases/gcc-7.4.0`下找到了源码，下载下来

## 安装

官方强烈建议：

>We use srcdir to refer to the toplevel source directory for GCC; we use objdir to refer to the toplevel build/object directory.
>
>First, we **highly** recommend that GCC be built into a separate directory from the sources which does **not** reside within the source tree. This is how we generally build GCC; building where srcdir == objdir should still work, but doesn’t get extensive testing; building where objdir is a subdirectory of srcdir is unsupported.
>
>To configure GCC:
>
>```
>% mkdir objdir
>% cd objdir
>% srcdir/configure [options] [target]
>```

于是我们
```bash
cd /public/fgn/software/gcc/install-package
tar -xvf gcc-7.4.0.tar.gz
cd /public/fgn/software/gcc/7.4
mkdir install
/public/fgn/software/gcc/install-package/gcc-7.4.0/configure --prefix=`pwd`/install
```

然后会陆陆续续出现如下报错

### 缺少gmp报错

```
checking for the correct version of gmp.h... no
configure: error: Building GCC requires GMP 4.2+, MPFR 2.4.0+ and MPC 0.8.0+.
Try the --with-gmp, --with-mpfr and/or --with-mpc options to specify
their locations.  Source code for these libraries can be found at
their respective hosting sites as well as at
ftp://gcc.gnu.org/pub/gcc/infrastructure/.  See also
http://gcc.gnu.org/install/prerequisites.html for additional info.  If
you obtained GMP, MPFR and/or MPC from a vendor distribution package,
make sure that you have installed both the libraries and the header
files.  They may be located in separate packages.
```

在http://gcc.gnu.org/install/prerequisites.html是怎么说的

> Several support libraries are necessary to build GCC, some are required, others optional. While any sufficiently new version of required tools usually work, library requirements are generally stricter. Newer versions may work in some cases, but it’s safer to use the exact versions documented. We appreciate bug reports about problems with newer versions, though. If your OS vendor provides packages for the support libraries then using those packages may be the simplest way to install the libraries.
>
> - GNU Multiple Precision Library (GMP) version 4.3.2 (or later)
>
>   Necessary to build GCC. **If a GMP source distribution is found in a subdirectory of your GCC sources named gmp, it will be built together with GCC**. Alternatively, if GMP is already installed but it is not in your library search path, you will have to configure with the --with-gmp configure option. See also --with-gmp-lib and --with-gmp-include. The in-tree build is only supported with the GMP version that download_prerequisites installs.
>
> - MPFR Library version 2.4.2 (or later)
>
>   Necessary to build GCC. It can be downloaded from [https://www.mpfr.org](https://www.mpfr.org/). **If an MPFR source distribution is found in a subdirectory of your GCC sources named mpfr, it will be built together with GCC**. Alternatively, if MPFR is already installed but it is not in your default library search path, the --with-mpfr configure option should be used. See also --with-mpfr-lib and --with-mpfr-include. The in-tree build is only supported with the MPFR version that download_prerequisites installs.
>
> - MPC Library version 0.8.1 (or later)
>
>   Necessary to build GCC. It can be downloaded from http://www.multiprecision.org/mpc/. **If an MPC source distribution is found in a subdirectory of your GCC sources named mpc, it will be built together with GCC.** Alternatively, if MPC is already installed but it is not in your default library search path, the --with-mpc configure option should be used. See also --with-mpc-lib and --with-mpc-include. The in-tree build is only supported with the MPC version that download_prerequisites installs.
>
> - isl Library version 0.15 or later.
>
>   Necessary to build GCC with the Graphite loop optimizations. It can be downloaded from [ftp://gcc.gnu.org/pub/gcc/infrastructure/](ftp://gcc.gnu.org/pub/gcc/infrastructure/). **If an isl source distribution is found in a subdirectory of your GCC sources named isl, it will be built together with GCC.** Alternatively, the --with-isl configure option should be used if isl is not installed in your default library search path.
>
> - zstd Library.
>
>   Necessary to build GCC with zstd compression used for LTO bytecode. The library is searched in your default library patch search. Alternatively, the --with-zstd configure option should be used.

可以看出只要，新建几个文件夹，把源码下载下来，解压，就可以了

```bash
cd /public/fgn/software/gcc/install-package/gcc-7.4.0
mkdir gmp
cd gmp
wget ftp://gcc.gnu.org/pub/gcc/infrastructure/gmp-6.1.0.tar.bz2
tar -xvf gmp-6.1.0.tar.bz2
mv gmp-6.1.0/* ./ && rm -r gmp-6.1.0
# 对于mpfr、mpc、isl同理
cd /public/fgn/software/gcc/7.4
/public/fgn/software/gcc/install-package/gcc-7.4.0/configure --prefix=`pwd`/install
```

官方没提供zstd的下载，也没说zstd可以像其他的几个一样把源码放进文件夹就好了，所以就没管了，后面证实这样也可以。

一开始我只下载了gmp的库，发现`configure`就能过了，但是在编译的时候出现了如下的蜜汁报错，把其他的几个包都打上就好了

```
g++ -std=gnu++98 -c   -g -DIN_GCC     -fno-exceptions -fno-rtti -fasynchronous-unwind-tables -W -Wall -Wno-narrowing -Wwrite-strings -Wcast-qual -Wno-format -Wmissing-format-attribute -Woverloaded-virtual -pedant
ic -Wno-long-long -Wno-variadic-macros -Wno-overlength-strings -fno-common  -DHAVE_CONFIG_H -DGENERATOR_FILE -fno-PIE -I. -Ibuild -I/public/fgn/software/gcc/install-package/gcc-7.4.0/gcc -I/public/fgn/software/gc
c/install-package/gcc-7.4.0/gcc/build -I/public/fgn/software/gcc/install-package/gcc-7.4.0/gcc/../include  -I/public/fgn/software/gcc/install-package/gcc-7.4.0/gcc/../libcpp/include  \
        -o build/genmddeps.o /public/fgn/software/gcc/install-package/gcc-7.4.0/gcc/genmddeps.c
In file included from ./bconfig.h:3:0,
                 from /public/fgn/software/gcc/install-package/gcc-7.4.0/gcc/genmddeps.c:18:
./auto-host.h:2363:16: error: declaration does not declare anything [-fpermissive]
 #define rlim_t long
                ^
```

### 缺少32位库报错

```
configure: error: I suspect your system does not have 32-bit development libraries (libc and headers). If you have them, rerun configure with --enable-multilib. If you do not have them, and want to build a 64-bit-only compiler, rerun configure with --disable-multilib.
```

我们不需要编译32位的程序，所以只要添加参数`--disable-multilib`

```bash
/public/fgn/software/gcc/install-package/gcc-7.4.0/configure --prefix=`pwd`/install --disable-multilib
```

### Make

然后`configure`就没有别的报错了，开始编译

```bash
make -j
make install
```

最后出现了如下内容

```
----------------------------------------------------------------------
Libraries have been installed in:
   /public/fgn/software/gcc/7.4/install/lib/../lib64

If you ever happen to want to link against installed libraries
in a given directory, LIBDIR, you must either use libtool, and
specify the full pathname of the library, or use the `-LLIBDIR'
flag during linking and do at least one of the following:
   - add LIBDIR to the `LD_LIBRARY_PATH' environment variable
     during execution
   - add LIBDIR to the `LD_RUN_PATH' environment variable
     during linking
   - use the `-Wl,-rpath -Wl,LIBDIR' linker flag
   - have your system administrator add LIBDIR to `/etc/ld.so.conf'

See any operating system documentation about shared libraries for
more information, such as the ld(1) and ld.so(8) manual pages.
----------------------------------------------------------------------
```

然后检查一下

```bash
make check
```

## 制作modulefile

```bash
#%Module 1.0

set DIR /public/fgn/software/gcc/7.4/install

prepend-path PATH $DIR/bin
prepend-path CPATH $DIR/install
prepend-path LD_LIBRARY_PATH $DIR/lib64
prepend-path LIBRARY_PATH $DIR/lib64
prepend-path MANPATH $DIR/share/man
```
