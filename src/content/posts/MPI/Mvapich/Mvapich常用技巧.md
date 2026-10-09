---
title: Mvapich常用技巧
date: 2019-03-31T00:00:00.000Z
slug: mvapich-tips
categories:
  - MPI
  - Mvapich
tags:
  - MPI
  - Mvapich
---
## 摘要

Mvapich常用技巧

<!-- more --> 

[http://mvapich.cse.ohio-state.edu/static/media/mvapich/mvapich2-2.3-userguide.html](http://mvapich.cse.ohio-state.edu/static/media/mvapich/mvapich2-2.3-userguide.html "http://mvapich.cse.ohio-state.edu/static/media/mvapich/mvapich2-2.3-userguide.html")
## 环境变量
### `MV2_IBA_HCA` 选择网卡
### `MV2_DEFAULT_PORT` 选择端口，一般为1
### `MV2_CPU_BINDING_POLICY` 绑核策略，有两个取值
- `bunch` 将会把一个CPU核放满再放下一个
- `scatter` 如果有两个CPU，将会轮换放

### `MV2_SHOW_CPU_BINDING` 如果值为1则显示绑核策略
### `MV2_CPU_MAPPING` 手动指定绑核策略
Under the second scheme, users can also use their own mapping to bind processes to CPU’s on modern multi-core systems. The feature is especially useful on multi-core systems, where performance may be different if processes are mapped to different cores. The mapping can be specified by setting the environment variable MV2_CPU_MAPPING (Section  11.13).
For example, if you want to run 4 processes per node and utilize cores 0, 1, 4, 5 on each node, you can specify:
`mpirun_rsh -np 64 -hostfile hosts MV2_CPU_MAPPING=0:1:4:5 ./a.out`
or
`mpiexec -n 64 -f hosts -env MV2_CPU_MAPPING 0:1:4:5 ./a.out`
In this way, process 0 on each node will be mapped to core 0, process 1 will be mapped to core 1, process 2 will be mapped to core 4, and process 3 will be mapped to core 5. For each process, the mapping is separated by a single “:”.
MVAPICH2 supports binding one process to multiple cores in the same node with “,” or “-”. For example:
`mpirun_rsh -np 64 -hostfile hosts MV2_CPU_MAPPING=0,2,3,4:1:5:6 ./a.out`
or
`mpirun_rsh -np 64 -hostfile hosts MV2_CPU_MAPPING=0,2-4:1:5:6 ./a.out`
In this way, process 0 on each node will be mapped to core 0, core 2, core 3, and core 4; process 1 will be mapped to core 1, process 2 will be mapped to core 5, and process 3 will be mapped to core 6. This feature is designed to support the case that one rank process will spawn multiple threads and set thread binding in the program.
