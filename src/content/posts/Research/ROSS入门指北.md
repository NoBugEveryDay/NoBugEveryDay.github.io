---
title: ROSS入门指北
date: 2021-07-03T00:00:00.000Z
slug: ross-simulator-guide
categories:
  - Research
tags:
  - ROSS
  - islip
---
## 简介

ROSS（Rensselaer’s Optimistic Simulation System）是一个 *乐观的并行离散事件模拟器*  的库。通过调用这个库我们能够较为轻松地将离散事件模拟并行化，大大缩短运行时间。它有两个特点：1. 它能够并行，并且可扩展性较好，原因请见第二点特点。2. 它采用了乐观的离散事件模拟方法，简单来解释就是每个进程都根据自己已知的情况尽量向前模拟即可，然后隔三差五地进行一次同步，如果发现因为有错过某些事件导致模拟错误，则进行回滚。

<!-- more --> 

## 相关文档

[官方wiki](https://ross-org.github.io/)

[代码仓库](https://github.com/ROSS-org/ROSS)

[官方样例集](https://github.com/ROSS-org/ROSS-Models)

相关论文：

- [*ROSS: a high-performance, low memory, modular time warp system*](https://dl.acm.org/doi/10.5555/336146.336157)

- [*Virtual time*](https://doi.org/10.1145/3916.3988)

## 一些概念

- LP: Logical Process 即被模拟的进程
- PE: Processing Element 即实际用来模拟的进程
- KP: Kernel Process 由一些LP组成的组
- VT: Virtual Time 被模拟的时间
- LVT: Local Virtual Time 局部的Virtual Time，一般是LP中的时间
- GVT: Global Virtual Time 所有LVT里面最小的一个，GVT以前的事件都是已经被最终敲定的事件，不会被回滚
- fossil collection：回收GVT之前的事件

举个简单的例子：假设你要模拟一个大型网络，希望通过模拟知道这个网络的性能。假设这个网络有1000个节点，那么每个LP就是这个网络中的一个节点，你运行的ROSS里面有1000个LP。假设你要用你自己的电脑来完成这个模拟，你的电脑是i7-11700K，有8个核心（这里我们不用超线程），你把这8个核全用上，一个核上跑一个模拟的进程，就是一个PE，你运行的ROSS就有8个PE。我们将模拟的任务进行均分，一个CPU核要模拟125个节点，也就是一个PE中包含125个LP。每个PE上的这125个LP又会分成若干个组，这里我们假设分成5组，那么一个PE上就是5个KP，一个KP中有25个LP。假设你要模拟这个网络运行100纳秒之后的状态，这个时间就是VT。假设第0个进程当前模拟到第66纳秒了，第1个进程模拟到第88纳秒，那么第0个进程的LVT就是66，第1个进程的LVT就是88。ROSS中VT的单位是用户自定义的，ROSS中的VT是以浮点数的形式实现的，所以怎么方便怎么来就行了。假设8个进程中LVT的最小值就是第0个进程的，那么此时的GVT就是66，这个时间之前发生的事情是确定地，正确地，不会再被回滚了。如果这是第0号进程中的某个LP发送了一个事件X给第1号进程中的某个LP，并且指定这个事情是要在第67纳秒发生的，那是第1号进程已经模拟到了第88纳秒，那怎么办呢？需要将所有已经发生的相关事件全部回滚，恢复到原来的状态，一直倒退到第67纳秒，然后把这个事件X执行了，再去执行接下来的事件。因为其中存在回滚的机制，因此需要将已经发生过的事情全部存下来。但是GVT之前的事情是已经完全敲定的了，所以将相关的存储空间进行释放，这一个过程叫做fossil collection。

还有一个疑问是，为什么要再分一次组，组织成若干个KP。我也不知道，没能完全领悟其中的奥妙，论文中是这么说的：

> A Kernel Process is a shared data structure among a collection of LPs that manages the processed eventlist for those LPs as a single, continuous list. The net effect of this approach is that the tw scheduler function executes forward on an LP by LP basis, but rollbacks and more importantly fossil collects on a KP by KP basis. Because KPs are much fewer in number than LPs, fossil collection overheads are dramatically reduced.

## 安装方法

```bash
module load IMPI/2018.1.163-icc-18.0.1 cmake/3.14.3-gcc-4.8.5
mkdir build
cd build
cmake .. \
    -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_C_COMPILER=icc \
    -DCMAKE_C_FLAGS_RELEASE="-O3 -xhost -ipo -std=c99" \
    -DMPI_C_COMPILER=mpiicc \
    -DMPI_C_COMPILE_OPTIONS="-O3 -xhost -ipo -std=c99" \
    -DCMAKE_INSTALL_PREFIX=`pwd`/../install \
    -DROSS_BUILD_MODELS=ON \
    -LAH
# 修改完毕
make -j
make -j install
```

## 运行方法

由于在编译时加了参数`-DROSS_BUILD_MODELS=ON`，所以`models`文件夹中的项目也会一同编译，这里有一个样例程序

### 运行参数

可以用`./install/bin/phold --help`先看下它有什么参数

```bash
$ ./install/bin/phold --help
./install/bin/phold --help 

Wed Jun  9 19:42:29 2021

ROSS Version: HEAD-HASH-NOTFOUND

usage: phold [options] [-- [args]]

PHOLD Model:
  --remote=dbl          desired remote event rate (default 0.25)
  --nlp=n               number of LPs per processor (default 8)
  --mean=dbl            exponential distribution mean for timestamps (default 1.00)
  --mult=dbl            multiplier for event memory allocation (default 1.40)
  --lookahead=dbl       lookahead for events (default 1.00)
  --start-events=n      number of initial messages per LP (default 1)
  --stagger=n           Set to 1 to stagger event uniformly across 0 to end time. (default 0)
  --memory=n            additional memory buffers (default 100)
  --run=str             user supplied run name (default undefined)

ROSS MPI Kernel:
  --read-buffer=n       network read buffer size in # of events (default 16)
  --send-buffer=n       network send buffer size in # of events (default 1024)

ROSS Kernel:
  --synch=n             Sychronization Protocol: SEQUENTIAL=1, CONSERVATIVE=2, OPTIMISTIC=3, OPTIMISTIC_DEBUG=4, OPTIMISTIC_REALTIME=5 (default 0)
  --nkp=n               number of kernel processes (KPs) per pe (default 16)
  --end=dbl             simulation end timestamp (default 100000.00)
  --batch=n             messages per scheduler block (default 16)
  --extramem=n          Number of extra events allocated per PE. (default 0)
  --buddy-size=n        delta encoding buddy system allocation (2^X) (default 0)
  --lz4-knob=n          LZ4 acceleration factor (higher = faster) (default 17)
  --cons-lookahead=dbl
                        Set g_tw_lookahead (default 0.01)
  --max-opt-lookahead=n
                        Optimistic simulation: maximum lookahead allowed in virtual clock time (default 18446744073709551615)
  --avl-size=n          AVL Tree contains 2^avl-size nodes (default 18)

ROSS MPI GVT:
  --gvt-interval=n      GVT Interval: Iterations through scheduling loop (synch=1,2,3,4), or ms between GVTs (synch=5) (default 16)
  --report-interval=dbl
                        percent of runtime to print GVT (default 0.01)

ROSS Timing:
  --clock-rate=n        CPU Clock Rate (default 1000000000)

ROSS Instrumentation:
  --engine-stats=n      Collect sim engine level stats; 0 don't collect, 1 GVT-sampling, 2 RT sampling, 3 VT sampling, 4 All sampling modes (default 0)
  --model-stats=n       Collect model level stats (requires model-level implementation); 0 don't collect, 1 GVT-sampling, 2 RT sampling, 3 VT sampling, 4 all sampling modes (default 0)
  --num-gvt=n           number of GVT computations between GVT-based sampling points (default 10)
  --rt-interval=n       real time sampling interval in ms (default 1000)
  --vt-interval=dbl     Virtual time sampling interval (default 1000000.00)
  --vt-samp-end=dbl     End time for virtual time sampling (if different from g_tw_ts_end) (default 0.00)
  --pe-data=n           Turn on/off collection of sim engine data at PE level (default 1)
  --kp-data=n           Turn on/off collection of sim engine data at KP level (default 0)
  --lp-data=n           Turn on/off collection of sim engine data at LP level (default 0)
  --event-trace=n       collect detailed data on all events for specified LPs; 0, no trace, 1 full trace, 2 only events causing rollbacks, 3 only committed events (default 0)
  --stats-prefix=str    prefix for filename(s) for stats output (default )
  --stats-path=str      path to directory to save instrumentation output (default )
  --buffer-size=n       size of buffer in bytes for stats collection (default 8000000)
  --buffer-free=n       percentage of free space left in buffer before writing out at GVT (default 15)
  --disable-output=n    used for perturbation analysis; buffer never dumped to file when 1 (default 0)

Specialized ROSS LPs:
  --sample-count=n      Number of samples to allocate in memory (default 65536)
  --help                show this message
```

可以发现这些参数分为了几个大的部分：`PHOLD Model`、`ROSS MPI Kernel`、`ROSS Kernel`、`ROSS MPI GVT`、`ROSS Timing`、`ROSS Instrumentation`、`Specialized ROSS LPs`。虽然总共有很多参数，但是需要用到的其实很少。接下来就对每个部分的参数进行逐一解释

#### `PHOLD Model`

这个部分是用户自定义的参数，你写的代码想从命令行获取的参数都在这个里面，当然这个部分的名字也是可以改的。如果有需要有好几部分用户自定义参数也可以。因为这只是个实例程序，因此不对这个部分的参数进行解释，其实我也没研究这些参数是干什么的

#### `ROSS MPI Kernel`

这个的作用我也不清楚，目前没有用上

#### `ROSS Kernel`

这一部分有几个比较重要的参数

- `--synch=n`：用来设置并行方式， `1`是串行模拟；`3`是并行模拟，每经过`--gvt-interval=n`个事件同步一次；`5`也是并行模拟，每经过`--gvt-interval=n`毫秒同步一次。这个参数必须设置
- `--nkp=n`：`kp`的数量，会影响映射
- `--end=n`：模拟停止的虚拟时间
- `--extramem=n`：如果运行的时候提示你这玩意不够大`Out of events in GVT! Consider increasing --extramem`，就把这玩意开大就行，其他情况下应该不用管
- `--max-opt-lookahead=n`：LP最多允许往GVT前面模拟多长时间，根据程序的特性来调整可以减少回滚

其他的我也没用过，感觉用处不大

#### `ROSS MPI GVT`

- `--gvt-interval=n`：与`--synch=n`配合使用，见前面
- `--report-interval=0.?`：运行每隔百分之多少屏幕输出一行东西

#### `ROSS Timing`

- `--clock-rate=n`：CPU频率，建议设置，方便计时结果更人性化

#### `ROSS Instrumentation`

用于采样的，但是我感觉它这个采样不是很好用，不建议用，建议自己手动实现

### 运行方法

```bash
mpirun -n 2 ./install/bin/phold --synch=3 --extramem=100000 --report-interval=0.2 --clock-rate=2700000000
```

对于这个算例这样就能比较正常地跑起来

### 输出解读

```
./install/bin/phold --synch=3 --extramem=100000 --report-interval=0.2 --clock-rate=2700000000 

Wed Jun  9 20:20:32 2021

ROSS Version: HEAD-HASH-NOTFOUND

tw_net_start: Found world size to be 2 
========================================
PHOLD Model Configuration..............
   Lookahead..............1.000000
   Start-events...........1
   stagger................0
   Mean...................0.000000
   Mult...................1.400000
   Memory.................100
   Remote.................0.250000
========================================


ROSS Core Configuration: 
	Total PEs                                                    2
	Total KPs                                          [Nodes (2) x KPs (16)] 32
	Total LPs                                                   16
	Simulation End Time                                  100000.00
	LP-to-PE Mapping                                        linear


ROSS Event Memory Allocation:
	Model events                                            100112
	Network events                                              16
	Total events                                               127

*** START PARALLEL OPTIMISTIC SIMULATION WITH SUSPEND LP FEATURE ***

GVT #8176: simulation 20% complete, max event queue size 59 (GVT = 20002.0000).
AVL tree size: 9
GVT #16596: simulation 40% complete, max event queue size 61 (GVT = 40002.0000).
AVL tree size: 16
GVT #25145: simulation 60% complete, max event queue size 61 (GVT = 60002.0000).
AVL tree size: 24
GVT #33611: simulation 80% complete, max event queue size 61 (GVT = 80003.0000).
AVL tree size: 12
GVT #42021: simulation 100% complete, max event queue size 61 (GVT = MAX).
AVL tree size: 1
*** END SIMULATION ***


	: Running Time = 3.3462 seconds

TW Library Statistics:
	Total Events Processed                                 4602092
	Events Aborted (part of RBs)                                 0
	Events Rolled Back                                     3002108
	Event Ties Detected in PE Queues                       3193468
	Efficiency                                              -87.63 %
	Total Remote (shared mem) Events Processed                   0
	Percent Remote Events                                     0.00 %
	Total Remote (network) Events Processed                 199288
	Percent Remote Events                                    12.46 %

	Total Roll Backs                                        408244
	Primary Roll Backs                                      147511
	Secondary Roll Backs                                    260733
	Fossil Collect Attempts                                  84044
	Total GVT Computations                                   42022

	Net Events Processed                                   1599984
	Event Rate (events/sec)                               478150.5
	Total Events Scheduled Past End Time                        32

TW Memory Statistics:
	Events Allocated                                        100128
	Memory Allocated                                         33942
	Memory Wasted                                              645

TW Network Statistics:
	Remote sends                                            934542
	Remote recvs                                            934542

TW Data Structure sizes in bytes (sizeof):
	PE struct                                                  616
	KP struct                                                  144
	LP struct                                                  136
	LP Model struct                                              8
	LP RNGs                                                     80
	Total LP                                                   224
	Event struct                                               152
	Event struct with Model                                    160

TW Clock Cycle Statistics (MAX values in secs at 2.7000 GHz):
	Initialization                                          0.0336
	Priority Queue (enq/deq)                                0.1960
	AVL Tree (insert/delete)                                0.0313
	LZ4 (de)compression                                     0.0000
	Buddy system                                            0.0000
	Event Processing                                        0.6529
	Event Cancel                                            0.6272
	Event Abort                                             0.0000

	GVT                                                     1.3369
	Fossil Collect                                          0.0262
	Primary Rollbacks                                       0.4011
	Network Read                                            0.3853
	Other Network                                           1.0643
	Instrumentation (computation)                           0.0000
	Instrumentation (write)                                 0.0000
	Total Time (Note: Using Running Time above for Speedup)      3.3383

TW GVT Statistics: MPI AllReduce
	GVT Interval                                                16
	GVT Real Time Interval (cycles)                    0
	GVT Real Time Interval (sec)                        0.00000000
	Batch Size                                                  16

	Forced GVT                                                   0
	Total GVT Computations                                   42022
	Total All Reduce Calls                                  125710
	Average Reduction / GVT                                   2.99
```

可以发现输出也有好几部分，这里也来每个部分都解读一下

#### `ROSS Core Configuration`

```
ROSS Core Configuration: 
	Total PEs                                                    2
	Total KPs                                          [Nodes (2) x KPs (16)] 32
	Total LPs                                                   16
	Simulation End Time                                  100000.00
	LP-to-PE Mapping                                        linear
```

这一部分是PE、KP、LP总数，模拟的截止虚拟时间，以及映射方法

// TODO ……啊，怎么又这么多要解释啊？自己看叭，就字面意思

### `TW Library Statistics`

- ...
- `Total Roll Backs`：总共回滚的次数
- `Primary Roll Backs`：由于收到了一个乱序事件所引起的回滚
- `Secondary Roll Backs`：由于收到了一个回滚指令所引起的回滚
- ...
- `Fossil Collect Attempts`：在GVT同步后，会进行一次过期事件回收，这里是过期事件回收的总次数

### `TW Network Statistics`

- `Remote sends`：总共执行的MPI_Send数量
- `Remote recv`：总共执行的MPI_Recv数量

### `TW Clock Cycle Statistics`

这个地方比较迷，会发现所有的时间加起来并不等于`Total Time`。经过一番研究，其中部分的计时内容如下所示

- `Initialization`：初始化时间

- `Priority Queue`：和有限队列的相关调用`tw_pq_*`所花的时间，调用了非常多次，难以统计相互关系

- `Event Processing`：用来执行`event_f`的时间

- `Event Cancel`：用来周期性执行回滚的时间，调用`tw_sched_cancel_q()`的时间，包括`revent_f`的时间，但不完全是，还有一部分是用来执行其他回滚相关操作的时间

- `GVT`：计算GVT所话的时间，其中包含`Network Read`中的②

- `Fossil Collect`：回收小于GVT的事件的事件，在每次GVT之后调用

- `Primary Rollbacks`：`tw_kp_rollback_to()`的时间，`Other Network`中的②包含在这里面

- `Network Read`：调用`tw_net_read()`的时间，读取网络事件的时间，包含多个部分

  1. 在主循环中不断读取网络事件的时间
  2. 计算GVT时读取时间

- `Other Network`：包含两部分

  1. 执行`event_f`时调用`tw_event_send()`用来发送到其他节点的事件的时间，这个时间是，包含在`Event Processing`中的

  2. 回滚事件时将事件发送回源发送节点的时间，这个时间是不包含在`Event Cancel`中的

- `Total Time`：实际运行时间，理论上`Total Time` ＞ `GVT` + `Fossil Collect` + `Event Processing` + `Event Cancel` + `Primary Rollbacks`，但实际上会小于，令人费解，看了很久代码也没搞清楚为啥

以`--synch=5`为例，主循环在`tw_scheduler_optimistic_realtime()`中的重要部分大概如下所示

```c
for (;;) {
    if (tw_nnodes() > 1) {
        start = tw_clock_read();
        tw_net_read(me);
        me->stats.s_net_read += tw_clock_read() - start;
    }

    tw_gvt_step1_realtime(me); // simple function, just ignore it
    tw_sched_event_q(me); // include {Primary Rollbacks} and part of [Priority Queue]
    tw_sched_cancel_q(me); // only {Event Cancel}
    tw_gvt_step2(me); // only {GVT} and {Fossil Collect}

    if (TW_STIME_DBL(me->GVT) > g_tw_ts_end) {
        break;
    }

    tw_sched_batch_realtime(me);  // inlcude {Event Processing} and some others
}
```

需要注意的一点是：虽然有时候Efficiency是负数或者很低，但是也不用担心，因为它这个的计算方式是拿回滚的数量除net event数量。建议缩短模拟时间之后比较串行和并行运行的时间

### `TW GVT Statistics: MPI AllReduce`

- `Forced GVT`：在执行事件的过程中要产生新事件，但是没有空事件了，需要强制停止模拟，进行GVT，然后回收过期事件以获得空事件
- `Total All Reduce Calls`：总共调用Allreduce的次数，每次要计算GVT的时候，都会调用Allreduce，不过要特别注意，在调用Allreduce之前会调用若干次Allreduce来确保所有进程的同步，保证所有已经发送给其他进程的消息都已经被接收

## 编程方法

虽然[官方wiki](https://ross-org.github.io/)中的一个页面[Building a Model with ROSS](https://ross-org.github.io/setup/build-model-with-ross.html)中提到了一个[模板](https://github.com/ROSS-org/template-model/tree/submodule/src)，但是这个模板似乎是有bug的，我猜可能是面向之前版本的ROSS的模板叭。[官方样例集](https://github.com/ROSS-org/ROSS-Models)这里还有很多样例不过好像也是有bug，我猜也是面向之前版本的ROSS的。

这里可以参考[我改过的模板](https://github.com/NoBugEveryDay/ROSS-templete)，这里用ROSS实现了一个islip交换机的并行模拟

## 注意事项

经过我的实践，感觉有一些很容易踩的坑，在这里记录一下

1. 在事件回滚时一定要注意回滚回了原来的样子，如果操作并不是可逆的，可以在事件中创建变量来存储这个值，但是要注意不能用用来传递变量的值来存储它。举个例子：如果你的事件消息有2个变量：a和b，你使用a来传递了事件信息，b并没有用到，那么你可以用b来储存历史值，但是绝对不能用a，因为被回滚的事件会再次被执行，如果a的值被修改了，就会产生错误。
2. 多加assert，多做检测，这种代码编码难度较高，很容易出bug
