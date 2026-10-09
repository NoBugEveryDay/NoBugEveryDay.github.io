---
title: I_MPI_FABRICS
date: 2019-02-18T00:00:00.000Z
slug: intel-mpi-fabrics-env
categories:
  - MPI
  - Intel MPI
tags:
  - MPI
  - Intel MPI
---
## 摘要

I_MPI_FABRICS参数设置

This topic is an excerpt from the *Intel® MPI Library Reference Manual for* *Linux* *OS* which provides further details on the I_MPI_FABRICS environment variable.

Select a particular network fabric to be used for communication.

<!-- more --> 

## Syntax

```
I_MPI_FABRICS=<fabric>|<intra-node fabric>:<inter-nodes fabric>
```

Where

- <fabric> := {shm, dapl, tcp, tmi, ofa, ofi}
- <intra-node fabric> := {shm, dapl, tcp, tmi, ofa, ofi}
- <inter-nodes fabric> := {dapl, tcp, tmi, ofa, ofi}

## Arguments

| Argument   | Definition                                                   |
| :--------- | :----------------------------------------------------------- |
| *<fabric>* | Define a network fabric                                      |
| shm        | Shared-memory                                                |
| dapl       | DAPL-capable network fabrics, such as InfiniBand*, iWarp*, Dolphin*, and XPMEM* (through DAPL*) |
| tcp        | TCP/IP-capable network fabrics, such as Ethernet and InfiniBand* (through IPoIB*) |
| tmi        | Network fabrics with tag matching capabilities through the Tag Matching Interface (TMI), such as Intel® True Scale Fabric and Myrinet* |
| ofa        | Network fabric, such as InfiniBand* (through OpenFabrics* Enterprise Distribution (OFED*) verbs) provided by the Open Fabrics Alliance* (OFA*) |
| ofi        | OFI (OpenFabrics Interfaces*)-capable network fabric including Intel® True Scale Fabric, and TCP (through OFI* API) |

For example, to select the winOFED* InfiniBand* device, use the following command:

```
$ mpirun -n <# of processes>  \ -env I_MPI_FABRICS shm:dapl <executable>  
```

For these devices, if *<provider>* is not specified, the first DAPL* provider in the /etc/dat.conf file is used. The shm fabric is available for both Intel® and non-Intel microprocessors, but it may perform additional optimizations for Intel microprocessors than for non-Intel microprocessors.

## NOTE

Ensure the selected fabric is available. For example, use shm only if all the processes can communicate with each other through the availability of the /dev/shm device. Use dapl only when all processes can communicate with each other through a single DAPL provider.

---

摘自：https://scc.ustc.edu.cn/zlsc/tc4600/intel/2016.0.109/mpi/User_Guide/I_MPI_FABRICS.htm
