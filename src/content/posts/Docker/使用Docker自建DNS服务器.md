---
title: 使用Docker自建DNS服务器
date: 2022-06-19T00:00:00.000Z
slug: docker-dns-server
categories:
  - Docker
tags:
  - Docker
  - dnsmasq
---
## 摘要

有时候因为一些特殊需求，我们需要自建DNS服务器来进行一些域名解析，本文介绍如果使用Docker来搭建DNS服务器

<!-- more --> 

本文中的方法是基于`dnsmasq`的Docker镜像来实现的

```bash
docker run \
        --name dnsmasq \
        -d \
        -p 53:53/udp \
        -v /root/dnsmasq/dnsmasq.conf:/etc/dnsmasq.conf \
        -v /root/dnsmasq/hosts:/etc/hosts \
        --log-opt "max-size=100m" \
        -e "HTTP_USER=3bd0d" \
        -e "HTTP_PASS=1e1f6" \
        --restart always \
        jpillora/dnsmasq
```

其中`/root/dnsmasq/dnsmasq.conf`是`dnsmasq`的配置文件，如下

```bash
# dnsmasq config, for a complete example, see:
# http://oss.segetech.com/intra/srv/dnsmasq.conf

# log all dns queries
# log-queries
# 为了减少负载，不做log，出问题可以debug

# dont use hosts nameservers
# no-resolv
# 这里要直接使用本地默认的DNS以解析指定域名以外的其他域名

# 上级DNS服务器
# server=192.168.1.1
# 但是如果会形成循环解析，就注释掉前面的，然后在这里填上合适的值

# Normally responses which come form /etc/hosts and the DHCP lease
# file have Time-To-Live set as zero, which conventionally means
# do not cache further. If you are happy to trade lower load on the
# server for potentially stale date, you can set a time-to-live (in
# seconds) here.
local-ttl=600
# ！这个值很关键，不然自定义的解析TTL默认为0

# By  default,  dnsmasq  will  send queries to any of the upstream
# servers it knows about and tries to favour servers to are  known
# to  be  up.  Uncommenting this forces dnsmasq to try each query
# with  each  server  strictly  in  the  order  they   appear   in
# /etc/resolv.conf
# strict-order
# 如果多个DNS上级服务器之间有优先级，就取消注释这里

# explicitly define host-ip mappings
# address=/sysu.tech/192.168.3.55
# 除了修改hosts以外，还可以在这里修改解析，但是不知道为什么会直接泛域名解析
```

然后在`/root/dnsmasq/hosts`像平常写hosts那样写即可。
