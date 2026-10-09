---
title: 使用Spack配置环境
date: 2020-11-24T00:00:00.000Z
slug: spack-environment-setup
categories:
  - Linux
  - 配置方法
tags:
  - Linux
  - Spack
---
## 摘要

Spack是一款在linux上能非常方便的安装和管理各种环境的工具，它有点像linux上的一个App Store，本文介绍如何使用它

<!-- more --> 

参考：

1. https://spack.readthedocs.io/en/latest/index.html
2. https://spack-tutorial.readthedocs.io/en/latest/ （这个更好）

## 环境依赖

官网说明中Spack依赖如下

1. Python 2 (2.6 or 2.7) or 3 (3.5 - 3.9) to run Spack
2. A C/C++ compiler for building
3. The `make` executable for building
4. The `tar`, `gzip`, `bzip2`, `xz` and optionally `zstd` executables for extracting source code
5. The `patch` command to apply patches
6. The `git` and `curl` commands for fetching
7. If using the `gpg` subcommand, `gnupg2` is required

在centos-7.6.1810最小化安装中还需要安装如下

```bash
yum install -y which make gcc gcc-c++ bzip2 patch git wget
```

ps. 这里没装zstd和gnupg2，wget是我图方便另外装的

## 安装Spack

```shell
cd
git clone https://github.com/spack/spack.git
```

然后会产生文件夹`~/spack`

这个过程会很漫长，建议直接到github上的release中直接下载一个最新的tarball

```shell
wget https://github.com/spack/spack/archive/v0.16.0.tar.gz
tar -xvf v0.16.0.tar.gz
rm -f v0.16.0.tar.gz
mv spack-0.16.0 spack
```

然后加载spack到环境变量中

```shell
. spack/share/spack/setup-env.sh
# 或者
source spack/share/spack/setup-env.sh 
```

## 基础命令

### spack list

可以搜索spack当前支持的软件，通过这个[链接](https://spack.readthedocs.io/en/latest/package_list.html#package-list)也可以在它的官网上看看有哪些支持的包

```bash
[root@spack ~]# spack list
3proxy
abduco
abi-compliance-checker
abi-dumper
abinit
abseil-cpp
abyss
accfft
acct
accumulo
...
```

同时这个命令也支持通配符匹配，如

```shell
[root@spack ~]# spack list mpi                               
==> 23 packages.
compiz                mpifileutils       openmpi        rempi
fujitsu-mpi           mpilander          pbmpi          spectrum-mpi
intel-mpi             mpileaks           phylobayesmpi  sst-dumpi
intel-mpi-benchmarks  mpip               pnmpi          umpire
mpi-bash              mpir               py-mpi4py      vampirtrace
mpich                 mpix-launch-swift  r-rmpi
```

### spack info <package_name>

可以查看一个包的详细信息，包含简介、源码地址、编译选项、依赖等信息

```bash
[root@spack ~]# spack info mpich  
AutotoolsPackage:   mpich

Description:
    MPICH is a high performance and widely portable implementation of the
    Message Passing Interface (MPI) standard.

Homepage: http://www.mpich.org

Maintainers: @raffenet @yfguo

Tags: 
    None

Preferred version:  
    3.3.2      http://www.mpich.org/static/downloads/3.3.2/mpich-3.3.2.tar.gz

Safe versions:  
    develop    [git] https://github.com/pmodels/mpich.git
    3.3.2      http://www.mpich.org/static/downloads/3.3.2/mpich-3.3.2.tar.gz
    3.3.1      http://www.mpich.org/static/downloads/3.3.1/mpich-3.3.1.tar.gz
    3.3        http://www.mpich.org/static/downloads/3.3/mpich-3.3.tar.gz
    3.2.1      http://www.mpich.org/static/downloads/3.2.1/mpich-3.2.1.tar.gz
    3.2        http://www.mpich.org/static/downloads/3.2/mpich-3.2.tar.gz
    3.1.4      http://www.mpich.org/static/downloads/3.1.4/mpich-3.1.4.tar.gz
    3.1.3      http://www.mpich.org/static/downloads/3.1.3/mpich-3.1.3.tar.gz
    3.1.2      http://www.mpich.org/static/downloads/3.1.2/mpich-3.1.2.tar.gz
    3.1.1      http://www.mpich.org/static/downloads/3.1.1/mpich-3.1.1.tar.gz
    3.1        http://www.mpich.org/static/downloads/3.1/mpich-3.1.tar.gz
    3.0.4      http://www.mpich.org/static/downloads/3.0.4/mpich-3.0.4.tar.gz

Variants:
    Name [Default]       Allowed values          Description
    =================    ====================    =============================

    argobots [off]       on, off                 Enable Argobots support
    device [ch3]         ch3, ch4                Abstract Device Interface
                                                 (ADI) implementation. The ch4
                                                 device is currently in
                                                 experimental state
    fortran [on]         on, off                 Enable Fortran support
    hwloc [on]           on, off                 Use external hwloc package
    hydra [on]           on, off                 Build the hydra process
                                                 manager
    libxml2 [on]         on, off                 Use libxml2 for XML support
                                                 instead of the custom
                                                 minimalistic implementation
    netmod [tcp]         tcp, mxm, ofi, ucx      Network module. Only single
                                                 netmod builds are supported.
                                                 For ch3 device
                                                 configurations, this presumes
                                                 the ch3:nemesis communication
                                                 channel. ch3:sock is not
                                                 supported by this spack
                                                 package at this time.
    pci [on]             on, off                 Support analyzing devices on
                                                 PCI bus
    pmi [pmi]            off, pmi, pmi2, pmix    PMI interface.
    romio [on]           on, off                 Enable ROMIO MPI I/O
                                                 implementation
    slurm [off]          on, off                 Enable SLURM support
    verbs [off]          on, off                 Build support for OpenFabrics
                                                 verbs.
    wrapperrpath [on]    on, off                 Enable wrapper rpath

Installation Phases:
    autoreconf    configure    build    install

Build Dependencies:
    argobots  findutils  libpciaccess  m4         python
    autoconf  hwloc      libtool       pkgconfig  slurm
    automake  libfabric  libxml2       pmix       ucx

Link Dependencies:
    argobots  hwloc  libfabric  libpciaccess  libxml2  pmix  slurm  ucx

Run Dependencies:
    None

Virtual Packages: 
    mpich@3: provides mpi@:3.0
    mpich@1: provides mpi@:1.3
    mpich provides mpi
```

### spack spec <package_name>

查看一个包的依赖关系

```shell
[root@spack ~]# spack spec gcc@4.8.5
Input spec
--------------------------------
gcc@4.8.5

Concretized
--------------------------------
gcc@4.8.5%gcc@4.8.5~binutils~bootstrap~nvptx~piclibs~strip languages=c,c++,fortran patches=0689c26bd7f38c5c9594eb8a4932ae7fce96cc8796c45839e050dc42c83112f1 arch=linux-centos7-haswell
    ^diffutils@3.7%gcc@4.8.5 arch=linux-centos7-haswell
        ^libiconv@1.16%gcc@4.8.5 arch=linux-centos7-haswell
    ^gmp@6.1.2%gcc@4.8.5 arch=linux-centos7-haswell
        ^autoconf@2.69%gcc@4.8.5 arch=linux-centos7-haswell
            ^m4@1.4.18%gcc@4.8.5+sigsegv patches=3877ab548f88597ab2327a2230ee048d2d07ace1062efe81fc92e91b7f39cd00,fc9b61654a3ba1a8d6cd78ce087e7c96366c290bc8d2c299f09828d793b853c8 arch=linux-centos7-haswell
                ^libsigsegv@2.12%gcc@4.8.5 arch=linux-centos7-haswell
            ^perl@5.32.0%gcc@4.8.5+cpanm+shared+threads arch=linux-centos7-haswell
                ^berkeley-db@18.1.40%gcc@4.8.5 arch=linux-centos7-haswell
                ^gdbm@1.18.1%gcc@4.8.5 arch=linux-centos7-haswell
                    ^readline@8.0%gcc@4.8.5 arch=linux-centos7-haswell
                        ^ncurses@6.2%gcc@4.8.5~symlinks+termlib arch=linux-centos7-haswell
                            ^pkgconf@1.7.3%gcc@4.8.5 arch=linux-centos7-haswell
        ^automake@1.16.2%gcc@4.8.5 arch=linux-centos7-haswell
        ^libtool@2.4.6%gcc@4.8.5 arch=linux-centos7-haswell
    ^mpc@1.1.0%gcc@4.8.5 arch=linux-centos7-haswell
        ^mpfr@3.1.6%gcc@4.8.5 patches=7a6dd71bcda4803d6b89612706a17b8816e1acd5dd9bf1bec29cf748f3b60008 arch=linux-centos7-haswell
```

### spack install <package_name>

使用如下命令将安装gcc-4.8.5版本，其他软件的安装方法类似

```bash
spack install gcc@4.8.5
```

如果安装的软件依赖于其他东西，spack都会自动安装，引起极度舒适。

虽然每个依赖都是逐个安装的，但是编译的时候会并行编译

### spack find

可以查看已安装的包，这时就可以看到刚刚安装的gcc及其所有依赖

```bash
[root@spack ~]# spack find
==> 17 installed packages
-- linux-centos7-haswell / gcc@4.8.5 ----------------------------
autoconf@2.69        gdbm@1.18.1      m4@1.4.18    pkgconf@1.7.3
automake@1.16.2      gmp@6.1.2        mpc@1.1.0    readline@8.0
berkeley-db@18.1.40  libiconv@1.16    mpfr@3.1.6
diffutils@3.7        libsigsegv@2.12  ncurses@6.2
gcc@4.8.5            libtool@2.4.6    perl@5.32.0
```

使用`-l`参数可以看到每个安装包的hash

使用`-f`参数可以看到每个包是用什么装的

```shell
[root@spack ~]# spack find -lf
==> 17 installed packages
-- linux-centos7-haswell / gcc@4.8.5 ----------------------------
letcmvn autoconf@2.69%gcc         fzl2npj libtool@2.4.6%gcc 
4hge4mk automake@1.16.2%gcc       7x2wh2t m4@1.4.18%gcc 
py7xb4v berkeley-db@18.1.40%gcc   kv3zuys mpc@1.1.0%gcc 
jknorwe diffutils@3.7%gcc         nol4vkt mpfr@3.1.6%gcc 
efm5erw gcc@4.8.5%gcc             tbpd5z4 ncurses@6.2%gcc 
7xh2soi gdbm@1.18.1%gcc           bzekmvr perl@5.32.0%gcc 
zn55wh7 gmp@6.1.2%gcc             z3r4unw pkgconf@1.7.3%gcc 
qazxaa4 libiconv@1.16%gcc         3jeiguw readline@8.0%gcc 
ymriiur libsigsegv@2.12%gcc
```

用参数`-d`可以看到每个包的依赖关系

```shell
[root@spack ~]# spack find -dlf gcc@4.8.5%gcc
==> 1 installed package
-- linux-centos7-haswell / gcc@4.8.5 ----------------------------
efm5erw gcc@4.8.5%gcc 
zn55wh7     gmp@6.1.2%gcc 
kv3zuys     mpc@1.1.0%gcc 
nol4vkt         mpfr@3.1.6%gcc
```

### spack uninstall

参考：https://spack.readthedocs.io/en/latest/basic_usage.html#spack-uninstall

注意在卸载后执行垃圾回收

### spack load / unload

和`module load`是差不多的单利，会修改 `PATH`, `MANPATH`, `CPATH`, `LD_LIBRARY_PATH` 

```shell
[root@spack ~]# which gcc
/usr/bin/gcc
[root@spack ~]# spack load gcc
[root@spack ~]# which gcc
/root/spack/opt/spack/linux-centos7-haswell/gcc-4.8.5/gcc-4.8.5-efm5erwkgytd3mrsuaxwqn2dk3xnz4ti/bin/gcc
[root@spack ~]# spack unload gcc
[root@spack ~]# which gcc
/usr/bin/gcc
```

### spack compiler

#### spack compiler list

或者`spack compilers`可以查看系统中有什么可用的编译器

```bash
[root@spack ~]# spack compiler list
==> Available compilers
-- gcc centos7-x86_64 -------------------------------------------
gcc@4.8.5
```

因为刚刚只装了gcc，所以只有这个

#### spack compiler info

可以查看编译器的详细信息

```bash
[root@spack ~]# spack compiler info gcc@4.8.5
gcc@4.8.5:
	paths:
		cc = /usr/bin/gcc
		cxx = /usr/bin/g++
		f77 = None
		fc = None
	modules  = []
	operating system  = centos7
```

#### spack compiler add

或者`spack compiler find`可以添加已有的编译器到spack中

```shell
$ spack compiler add /usr/local/tools/ic-13.0.079
==> Added 1 new compiler to ~/.spack/linux/compilers.yaml
    intel@13.0.079
```

不加路径时，也可以自动检测，但是不建议使用

当然也可以手动添加，详细参考：https://spack.readthedocs.io/en/latest/getting_started.html#manual-compiler-configuration

### spack clean

清理各种临时文件

### spack help

帮助手册，后面加具体的子命令可查询细节命令

```shell
[root@spack linux-centos7-haswell]# spack help info
usage: spack info [-h] package

get detailed information on a particular package

positional arguments:
  package     package name

optional arguments:
  -h, --help  show this help message and exit
```

## 进阶

### Specs

官方文档中非常常见的一个单词是`specs`，解释如下

> In Spack, that descriptor is called a *spec*. Spack uses specs to refer to a particular build configuration (or configurations) of a package. Specs are more than a package name and a version; you can use them to specify the compiler, compiler version, architecture, compile options, and dependency options for a build

就是用来描述一个包的详细信息的，既可以在包安装的时候指定参数，又可以指定要load哪一个包

主要选项有

- Package name identifier (`mpileaks` above)
- `@` Optional version specifier (`@1.2:1.4`)
- `%` Optional compiler specifier, with an optional compiler version (`gcc` or `gcc@4.7.3`)
- `+` or `-` or `~` Optional variant specifiers (`+debug`, `-qt`, or `~qt`) for boolean variants
- `name=` Optional variant specifiers that are not restricted to boolean variants
- `name=` Optional compiler flag specifiers. Valid flag names are `cflags`, `cxxflags`, `fflags`, `cppflags`, `ldflags`, and `ldlibs`.
- `target= os=` Optional architecture specifier (`target=haswell os=CNL10`)
- `^` Dependency specs (`^callpath@1.1`)

更多参见：https://spack.readthedocs.io/en/latest/basic_usage.html#specs-dependencies

### 高亮

如果spack输出太长，和`less`结合时会失去高亮，因此可以使用

```bash
spack find | less -R
# 或者
spack --color always | less -R
```

## Spack配置

### 配置文件作用域

Spack的配置文件有6个来源如下：

| Scope        | Directory                                         |
| ------------ | ------------------------------------------------- |
| Command-line | N/A                                               |
| Custom       | Custom directory, specified with `--config-scope` |
| User         | `~/.spack/`                                       |
| Site         | `$SPACK_ROOT/etc/spack/`                          |
| System       | `/etc/spack/`                                     |
| Defaults     | `$SPACK_ROOT/etc/spack/defaults/`                 |

其中上面的优先级更高，当配置冲突时会覆盖下面的配置

用户默认做的一些配置，如`spack compiler add`会写配置到`~/.spack/`中，这样可能会造成一些不好的影响，可以使用参数`--scope site`将配置写在spack的目录中

### 禁用 ~/.spack

一些临时目录和配置文件都会用到`~/.spack`，通过配置可以禁用

```bash
chmod -R -w ~/.spack
spack config --scope site edit config
```

编辑内容如下

```yaml
config:
  build_stage::
    - $tempdir/$user/spack-stage
    - $spack/spack-stage
  test_stage: $spack/spack-test
  misc_cache: $spack/spack-cache
```

其中的`::`用于覆盖优先级更低的列表配置，而不是增加

#### Update

经过吴老师指导，似乎这么改更合适

```yaml
config:
  test_stage: $spack/var/spack/cache/_test-stage/$user
  misc_cache: $spack/var/spack/cache/_misc-cache/$user
  build_stage:
  - $tempdir/$user/spack-stage
  - $spack/var/spack/cache/_build-stage/$user
```

## 在无网情况

一些情况下我们的机器上没有网，需要在有网机器上把包下载下来，然后传到无网机器上

### 在有网机器上

```shell
cd spack
source share/spack/setup-env.sh
spack mirror create -D -d spack-mirror-dir <package_name>@<version>
# 例如
spack mirror create -D -d spack-mirror-gcc-4.8.5 gcc@4.8.5
```

参数中

- `-D`：下载所有依赖
- `-d DIRECTORY`：下载到指定目录

然后把镜像目录复制到无网机器上

或者还有一种方式就是根据

### 在无网的机器上

```shell
spack mirror add --scope site MIRROR_NAME file://<path-to-mirror-dir>
# 例如
spack mirror add --scope site gcc-4.8.5 file://./gcc-4.8.5
```

然后使用如下命令可以查看已经添加的镜像

```shell
[root@spack ~]# spack mirror list
gcc-4.8.5       file:///root/spack/spack-mirror/spack-mirror-gcc-4.8.5
spack-public    https://spack-llnl-mirror.s3-us-west-2.amazonaws.com/
```

在不需要的时候可以用如下命令移除镜像

```shell
spack mirror remove --scope site MIRROR_NAME
# 例如
spack mirror remove --scope site gcc-4.8.5
```

### 下载各种镜像

```shell
spack mirror create -D -d gcc-4.8.5 gcc@4.8.5 pkg-config@0.29.2 
# pkg-config@0.29.2也是依赖，但不会自动下载
```

## 实例

### 组合安装

假设现在想安装软件`petsc`，有3种不同的编译器可选：`gcc`、`intel`、`pgi`，并且有3种MPI可选`openmpi`、`mvapich`、`mpich`。假设有这样两种场景：①由于不同用户的需求不同，你要编译所有组合来满足不同的用户需求；或者②你想测试这些组合的性能哪个更好。Spack可以轻松帮你解决这个问题，可以使用如下脚本

```shell
#!/bin/bash

compilers=(
    %gcc
    %intel
    %pgi
)

mpis=(
    openmpi+psm~verbs
    openmpi~psm+verbs
    mvapich2+psm~mrail
    mvapich2~psm+mrail
    mpich+verbs
)

for compiler in "${compilers[@]}"
do
    # Serial installs
    spack install szip           $compiler
    spack install hdf            $compiler
    spack install hdf5           $compiler
    spack install netcdf         $compiler
    spack install netcdf-fortran $compiler
    spack install ncview         $compiler

    # Parallel installs
    for mpi in "${mpis[@]}"
    do
        spack install $mpi            $compiler
        spack install hdf5~cxx+mpi    $compiler ^$mpi
        spack install parallel-netcdf $compiler ^$mpi
    done
done
```



## 缺点

当然，Spack也是有缺点的，就我目前的体验而言，有如下几点：

1. 学习成本相较于module而言要搞一些
2. 对于残废系统（即针对HPC环境进行了阉割的系统不友好）。在我使用的一个系统上spack就始终没能正常工作，虽然解决了一个巨坑的`lsb_release`bug之后，发现还有bug，就放弃了。
