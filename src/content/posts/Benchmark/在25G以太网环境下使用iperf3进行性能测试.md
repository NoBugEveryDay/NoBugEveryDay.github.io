---
title: 在25G以太网环境下使用iperf3进行性能测试
date: 2019-02-19T00:00:00.000Z
slug: iperf3-25g-test
categories:
  - Benchmark
tags:
  - Benchmark
  - iperf3
---
## 摘要

在25G以太网环境下使用iperf3进行性能测试

<!-- more --> 

## TCP

### 单线程

```shell
$ ./iperf3 -c cpn57-eth4     
Connecting to host cpn57-eth4, port 5201
[  4] local 10.25.1.58 port 33116 connected to 10.25.1.57 port 5201
[ ID] Interval           Transfer     Bandwidth       Retr  Cwnd
[  4]   0.00-1.00   sec  2.73 GBytes  23.5 Gbits/sec    0   1.76 MBytes       
[  4]   1.00-2.00   sec  2.70 GBytes  23.2 Gbits/sec  183    889 KBytes       
[  4]   2.00-3.00   sec  2.40 GBytes  20.6 Gbits/sec   21   1.27 MBytes       
[  4]   3.00-4.00   sec  2.72 GBytes  23.4 Gbits/sec    0   1.31 MBytes       
[  4]   4.00-5.00   sec  2.74 GBytes  23.5 Gbits/sec    0   1.31 MBytes       
[  4]   5.00-6.00   sec  2.74 GBytes  23.5 Gbits/sec    0   1.33 MBytes       
[  4]   6.00-7.00   sec  2.74 GBytes  23.5 Gbits/sec    0   1.33 MBytes       
[  4]   7.00-8.00   sec  2.74 GBytes  23.5 Gbits/sec    0   1.33 MBytes       
[  4]   8.00-9.00   sec  2.74 GBytes  23.5 Gbits/sec    0   1.33 MBytes       
[  4]   9.00-10.00  sec  2.74 GBytes  23.5 Gbits/sec    0   1.33 MBytes       
- - - - - - - - - - - - - - - - - - - - - - - - -
[ ID] Interval           Transfer     Bandwidth       Retr
[  4]   0.00-10.00  sec  27.0 GBytes  23.2 Gbits/sec  204             sender
[  4]   0.00-10.00  sec  27.0 GBytes  23.2 Gbits/sec                  receiver

iperf Done.
```

### 双线程

```shell
$ ./iperf3 -c cpn57-eth4 -P 2
Connecting to host cpn57-eth4, port 5201
[  4] local 10.25.1.58 port 33122 connected to 10.25.1.57 port 5201
[  6] local 10.25.1.58 port 33124 connected to 10.25.1.57 port 5201
[ ID] Interval           Transfer     Bandwidth       Retr  Cwnd
[  4]   0.00-1.00   sec  1.37 GBytes  11.8 Gbits/sec    0    839 KBytes       
[  6]   0.00-1.00   sec  1.37 GBytes  11.7 Gbits/sec    0    796 KBytes       
[SUM]   0.00-1.00   sec  2.74 GBytes  23.5 Gbits/sec    0             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  4]   1.00-2.00   sec  1.37 GBytes  11.8 Gbits/sec    0    887 KBytes       
[  6]   1.00-2.00   sec  1.37 GBytes  11.8 Gbits/sec    0    834 KBytes       
[SUM]   1.00-2.00   sec  2.74 GBytes  23.5 Gbits/sec    0             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  4]   2.00-3.00   sec  1.37 GBytes  11.8 Gbits/sec    0    887 KBytes       
[  6]   2.00-3.00   sec  1.37 GBytes  11.8 Gbits/sec    0    834 KBytes       
[SUM]   2.00-3.00   sec  2.74 GBytes  23.5 Gbits/sec    0             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  4]   3.00-4.00   sec  1.37 GBytes  11.8 Gbits/sec    0    887 KBytes       
[  6]   3.00-4.00   sec  1.37 GBytes  11.8 Gbits/sec    0    834 KBytes       
[SUM]   3.00-4.00   sec  2.74 GBytes  23.5 Gbits/sec    0             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  4]   4.00-5.00   sec  1.37 GBytes  11.8 Gbits/sec    0    887 KBytes       
[  6]   4.00-5.00   sec  1.37 GBytes  11.8 Gbits/sec    0    834 KBytes       
[SUM]   4.00-5.00   sec  2.74 GBytes  23.5 Gbits/sec    0             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  4]   5.00-6.00   sec  1.36 GBytes  11.7 Gbits/sec    0    930 KBytes       
[  6]   5.00-6.00   sec  1.36 GBytes  11.7 Gbits/sec    0    874 KBytes       
[SUM]   5.00-6.00   sec  2.73 GBytes  23.4 Gbits/sec    0             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  4]   6.00-7.00   sec  1.37 GBytes  11.8 Gbits/sec    0    930 KBytes       
[  6]   6.00-7.00   sec  1.37 GBytes  11.8 Gbits/sec    0    874 KBytes       
[SUM]   6.00-7.00   sec  2.74 GBytes  23.5 Gbits/sec    0             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  4]   7.00-8.00   sec  1.37 GBytes  11.8 Gbits/sec    0    930 KBytes       
[  6]   7.00-8.00   sec  1.37 GBytes  11.8 Gbits/sec    0    874 KBytes       
[SUM]   7.00-8.00   sec  2.74 GBytes  23.5 Gbits/sec    0             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  4]   8.00-9.00   sec  1.37 GBytes  11.8 Gbits/sec    0    930 KBytes       
[  6]   8.00-9.00   sec  1.37 GBytes  11.8 Gbits/sec    0    874 KBytes       
[SUM]   8.00-9.00   sec  2.74 GBytes  23.5 Gbits/sec    0             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  4]   9.00-10.00  sec  1.36 GBytes  11.7 Gbits/sec    0   1.17 MBytes       
[  6]   9.00-10.00  sec  1.36 GBytes  11.7 Gbits/sec    0   1.06 MBytes       
[SUM]   9.00-10.00  sec  2.73 GBytes  23.4 Gbits/sec    0             
- - - - - - - - - - - - - - - - - - - - - - - - -
[ ID] Interval           Transfer     Bandwidth       Retr
[  4]   0.00-10.00  sec  13.7 GBytes  11.8 Gbits/sec    0             sender
[  4]   0.00-10.00  sec  13.7 GBytes  11.8 Gbits/sec                  receiver
[  6]   0.00-10.00  sec  13.7 GBytes  11.8 Gbits/sec    0             sender
[  6]   0.00-10.00  sec  13.7 GBytes  11.8 Gbits/sec                  receiver
[SUM]   0.00-10.00  sec  27.4 GBytes  23.5 Gbits/sec    0             sender
[SUM]   0.00-10.00  sec  27.4 GBytes  23.5 Gbits/sec                  receiver

iperf Done.
```

## UDP

### 单线程

```shell
$ ./iperf3 -c cpn57-eth4 -u -b 0     
Connecting to host cpn57-eth4, port 5201
[  4] local 10.25.1.58 port 56689 connected to 10.25.1.57 port 5201
[ ID] Interval           Transfer     Bandwidth       Total Datagrams
[  4]   0.00-1.00   sec  1.76 GBytes  15.1 Gbits/sec  230830  
[  4]   1.00-2.00   sec  1.53 GBytes  13.2 Gbits/sec  200750  
[  4]   2.00-3.00   sec  1.53 GBytes  13.1 Gbits/sec  200120  
[  4]   3.00-4.00   sec  1.53 GBytes  13.1 Gbits/sec  199970  
[  4]   4.00-5.00   sec  1.52 GBytes  13.1 Gbits/sec  199540  
[  4]   5.00-6.00   sec  1.52 GBytes  13.1 Gbits/sec  199430  
[  4]   6.00-7.00   sec  1.52 GBytes  13.1 Gbits/sec  199390  
[  4]   7.00-8.00   sec  1.52 GBytes  13.0 Gbits/sec  198780  
[  4]   8.00-9.00   sec  1.52 GBytes  13.1 Gbits/sec  199410  
[  4]   9.00-10.00  sec  1.52 GBytes  13.1 Gbits/sec  199400  
- - - - - - - - - - - - - - - - - - - - - - - - -
[ ID] Interval           Transfer     Bandwidth       Jitter    Lost/Total Datagrams
[  4]   0.00-10.00  sec  15.5 GBytes  13.3 Gbits/sec  0.057 ms  960521/2027432 (47%)  
[  4] Sent 2027432 datagrams

iperf Done.
```

惨不忍睹
