---
title: 如何计算CPU算力理论峰值
date: 2019-02-19T00:00:00.000Z
slug: cpu-peak-performance
categories:
  - Benchmark
tags:
  - Benchmark
---
**CPU理论峰值=主频×核心数×CPU每时钟周期双精度浮点数运算次数**

<!-- more --> 

主频：即CPU内核工作的时钟频率，当CPU能超频时，建议按照超频频率计算，不能超频时按照默频计算

- 核心数：即CPU核心数，这里注意不要把超线程统计进去
- CPU每时钟周期双精度浮点数运算次数，主要由两部分组成
	- 向量化处理器：例如`Intel Skylake`系列处理器支持`AVX-512`指令，那么每个周期就可以对8个双精度（64位）浮点数进行计算
	- FMA（乘加处理器）：在以`Intel Skylake`系列为代表的处理器中含有乘加运算单元，当有1个FMA的时候就需要乘2，有2个FMA就需要乘4,有3个FMA就需要乘6，没有FMA就不用乘。

---
**例子**

- Xeon Phi 7210
  1.3GHz\*64(核心数)\*32(每周期运算次数)=2662GFlops≈2.6TFlops

- Xeon(R) Silver 4114
  2.2GHz\*10(核心数)\*16(AVX-512、1个FMA)=352GFlops

- Intel® Xeon® Gold 6150
  2.7GHz\*18(核心数)\*32(AVX-512、2个FMA)=1555GFlops≈1.5TFlops

- Intel® Xeon® Processor E3-1275L v3 @ 2.70GHz

  3.3Ghz(全核睿频)\*4(核心数)\*16(AVX2、2个FMA)=211.2GFlops

  ps. E3-1275L v3属于Haswell架构，支持AVX2指令集(256bit)，有2个FMA

- Intel(R) Xeon(R) CPU E5-2692 v2 @ 2.20GHz

  2.6Ghz(全核睿频)\*12(核心数)\*8(AVX)=249.6GFlops

  E5-2692 v2属于Ivy Bridge架构，支持AVX指令集(256bit)，但没有FMA，按理说应该是一个周期算4次，但是实际上是算8次，[这里](https://stackoverflow.com/questions/15655835/flops-per-cycle-for-sandy-bridge-and-haswell-sse2-avx-avx2)也说了是算8次，没完全搞懂

---
**GPU同理**
- P100（PCIe版）
1328MHz\*1792(FP64 CUDA Cores)=4.539TFlops≈4.7TFlops(官方)

FP64 CUDA Cores数量可以参考：https://news.mydrivers.com/1/624/624524.htm
