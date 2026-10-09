---
title: 如何进行stream测试.md
date: 2020-09-19T00:00:00.000Z
slug: stream-benchmark
categories:
  - Benchmark
tags:
  - Benchmark
  - stream
---
## 摘要

stream是一个比较古老的、可以在linux上测试内存性能的软件。本文将介绍如何使用

<!-- more --> 

从 https://www.cs.virginia.edu/stream/FTP/Code/ 这里下载源码，只用下载其中的`stream.c`即可

然后参考原来的makefile去编译

```bash
icc -O3 -xhost -qopenmp -DSTREAM_ARRAY_SIZE=80000000 -DNTIMES=100 -ffreestanding stream.c -o stream
```

在我DDR3双通道1600Mhz的平台上测得的结果如下

```
./stream 
-------------------------------------------------------------
STREAM version $Revision: 5.10 $
-------------------------------------------------------------
This system uses 8 bytes per array element.
-------------------------------------------------------------
Array size = 80000000 (elements), Offset = 0 (elements)
Memory per array = 610.4 MiB (= 0.6 GiB).
Total memory required = 1831.1 MiB (= 1.8 GiB).
Each kernel will be executed 20 times.
 The *best* time for each kernel (excluding the first iteration)
 will be used to compute the reported bandwidth.
-------------------------------------------------------------
Number of Threads requested = 8
Number of Threads counted = 8
-------------------------------------------------------------
Your clock granularity/precision appears to be 1 microseconds.
Each test below will take on the order of 71439 microseconds.
   (= 71439 clock ticks)
Increase the size of the arrays if this shows that
you are not getting at least 20 clock ticks per test.
-------------------------------------------------------------
WARNING -- The above is only a rough guideline.
For best results, please be sure you know the
precision of your system timer.
-------------------------------------------------------------
Function    Best Rate MB/s  Avg time     Min time     Max time
Copy:           19217.8     0.066727     0.066605     0.067606
Scale:          19191.2     0.066779     0.066697     0.066856
Add:            20549.5     0.093581     0.093433     0.093817
Triad:          20473.6     0.094264     0.093779     0.100686
-------------------------------------------------------------
```

和理论性能25600MB/s有20%的差距，还可以
