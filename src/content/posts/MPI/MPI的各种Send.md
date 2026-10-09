---
title: MPI的各种Send
date: 2021-08-07T00:00:00.000Z
slug: mpi-send-variants
categories:
  - MPI
tags:
  - MPI
---
## 摘要

一直知道MPI有好几种Send：`MPI_Send`、`MPI_Bsend`、`MPI_Ssend`、`MPI_Rsend`、`MPI_Isend`、`MPI_Ibsend`、`MPI_Issend`、`MPI_Irsend`

`MPI_Send_init`之类的，但是一直没搞明白它们有什么区别，本文介绍这些东西之间有啥区别。

<!-- more --> 

## 前缀后缀含义

很容易注意到，不同前缀后缀代表不同的特性。

`I`：表示非阻塞式的发送，是我们最熟悉的前缀，返回后`send_buffer`仍然不可用，必要调用[`MPI_Wait`](https://www.rookiehpc.com/mpi/docs/mpi_wait.php)或者[`MPI_Test`](https://www.rookiehpc.com/mpi/docs/mpi_test.php)之后才可以继续使用`send_buffer`。必须使用[MPI_Irecv](https://www.rookiehpc.com/mpi/docs/mpi_irecv.php)接收

`B`：表示buffered，发送的内容会被拷贝一份，然后返回，之后具体什么时候发送用户无法感知。注意必须搭配使用[`MPI_Buffer_attach`](https://www.rookiehpc.com/mpi/docs/mpi_buffer_attach.php)提前分配buffer的空间，不然可能会退化为MPI_Send。

`S`：表示synchronous，直到对方接收完成才会返回。

`R`：表示ready，接收方必须已经调用了recv，这样可以略微提升性能。

`init`：只是初始化这个发送，暂时不发送，在调用[MPI_Start](https://www.rookiehpc.com/mpi/docs/mpi_start.php)之后才会开始真正的发送。

这些前缀组合形成了标准中的各种Send接口

- [MPI_Bsend](https://www.rookiehpc.com/mpi/docs/mpi_bsend.php)
- [MPI_Bsend_init](https://www.rookiehpc.com/mpi/docs/mpi_bsend_init.php)
- [MPI_Ibsend](https://www.rookiehpc.com/mpi/docs/mpi_ibsend.php)
- [MPI_Irsend](https://www.rookiehpc.com/mpi/docs/mpi_irsend.php)
- [MPI_Isend](https://www.rookiehpc.com/mpi/docs/mpi_isend.php)
- [MPI_Issend](https://www.rookiehpc.com/mpi/docs/mpi_issend.php)
- [MPI_Rsend](https://www.rookiehpc.com/mpi/docs/mpi_rsend.php)
- [MPI_Rsend_init](https://www.rookiehpc.com/mpi/docs/mpi_rsend_init.php)
- [MPI_Send](https://www.rookiehpc.com/mpi/docs/mpi_send.php)
- [MPI_Send_init](https://www.rookiehpc.com/mpi/docs/mpi_send_init.php)
- [MPI_Sendrecv](https://www.rookiehpc.com/mpi/docs/mpi_sendrecv.php)
- [MPI_Sendrecv_replace](https://www.rookiehpc.com/mpi/docs/mpi_sendrecv_replace.php)
- [MPI_Ssend](https://www.rookiehpc.com/mpi/docs/mpi_ssend.php)
- [MPI_Ssend_init](https://www.rookiehpc.com/mpi/docs/mpi_ssend_init.php)

## 部分接口解释

### [`MPI_Ibsend`](https://www.rookiehpc.com/mpi/docs/mpi_ibsend.php)

返回后buffer不可用，因为可能正在复制。调用[`MPI_Wait`](https://www.rookiehpc.com/mpi/docs/mpi_wait.php)或者[`MPI_Test`](https://www.rookiehpc.com/mpi/docs/mpi_test.php)之后buffer可用，但是可能并没有完成发送。

## 参考资料

https://www.rookiehpc.com/mpi/docs/

https://www.mcs.anl.gov/research/projects/mpi/
