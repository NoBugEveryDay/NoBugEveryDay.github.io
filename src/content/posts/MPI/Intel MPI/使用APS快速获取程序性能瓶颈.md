---
title: 使用APS快速获取程序性能瓶颈
date: 2019-03-23T00:00:00.000Z
slug: intel-aps-profiling
categories:
  - MPI
  - Intel MPI
tags:
  - MPI
  - Intel MPI
  - APS
---
APS是一种不需要重新编译程序，就能分析程序所在瓶颈的工具

<!-- more --> 

1. 在运行的程序前面加上`aps`即可

   - 对于mpirun的程序，指令类似如下

     ```shell
     mpirun -n 4 -machinefile machinefile aps ./myApp
     ```

   - 对于非mpirun的程序，指令类似如下

     ```shell
     aps ./myApp
     ```

2. 如果要获取MPI的一些详细信息，需要加上环境变量`MPS_STAT_LEVEL`，其取值含义如下

| Level       | Information is collected about                               |
| ----------- | ------------------------------------------------------------ |
| 1 (default) | MPI functions and their times                                |
| 2           | MPI functions and amount of transmitted data                 |
| 3           | MPI functions, communicators, and message sizes              |
| 4           | MPI functions, communicators, communication directions and aggregated traffic for each direction |
| 5           | MPI functions, communicators, message sizes, and communication directions |

如果是用mpirun运行程序，建议使用类似如下指令
```shell
mpirun -n 4 -machinefile machinefile aps -genv MPS_STAT_LEVEL 5 ./myApp
```
3. ps. 对于应用cesm会产生不过：在执行完cesm.exe后无法继续执行后续脚本，任务会被挂起到后台，需要使用`fg [%N]`命令将任务切换到前台执行完。

4. 在执行目录会生成名称为`aps_result_[date]`的文件夹，可以执行以下操作
   - 生成html查看程序性能大致性能信息，执行如下命令
     ```shell
     aps-report aps_result_[date]
     ```
     即可生成一个html
   - 在命令行查看详细信息，使用`aps-report -help`查看其它参数，加参数即可。（不知道为啥官网有将其它结果也可视化的html方法，但是我尝试失败了，只能命令行查看）
