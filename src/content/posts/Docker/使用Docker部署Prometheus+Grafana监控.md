---
title: 使用Docker部署Prometheus+Grafana监控
date: 2020-09-18T00:00:00.000Z
slug: docker-prometheus-grafana
categories:
  - Docker
tags:
  - Docker
  - 监控
---
## 摘要

Node exporter + Prometheus + Grafana是很好用的监控软件组合，本文介绍如何用docker来部署它们。

<!-- more --> 

## exporter安装

### Linux中node_exporter 安装

参考：https://github.com/prometheus/node_exporter 最下面的docker安装教程

```shell
docker pull quay.io/prometheus/node-exporter

docker run -d \
  --net="host" \
  --pid="host" \
  --cap-add=SYS_TIME \
  -v "/:/host:ro,rslave" \
  --name=node_exporter \
  --restart=unless-stopped \
  quay.io/prometheus/node-exporter \
  --path.rootfs=/host
  
```

然后可以通过 http://ip:9100/metrics 来看是否起来了

为了防止任何人都能获取到服务器信息，让9100端口只能使用特定ip访问

```shell
iptables -I INPUT -p tcp --dport 9100 -j DROP
iptables -I INPUT -s [允许的ip] -p tcp --dport 9100 -j ACCEPT
```

如果是ipv6

```shell
iptables -I INPUT -p tcp --dport 9100 -j DROP
ip6tables -I INPUT -p tcp --dport 9100 -j DROP
ip6tables -I INPUT -s [允许的ipv6] -p tcp --dport 9100 -j ACCEPT
```

### openwrt中node_exporter 安装

安装`prometheus-node-exporter-lua`等包即可

然后需要在`/etc/config/prometheus-node-exporter-lua`中修改一下监听的地址，再重启一下服务即可。

然后可以通过 http://ip:9100/metrics 来看是否起来了， http://ip:9100 是没有东西的

### Docker中cadvisor安装

```
docker pull google/cadvisor:latest

docker run \
  --volume=/:/rootfs:ro \
  --volume=/var/run:/var/run:ro \
  --volume=/sys:/sys:ro \
  --volume=/var/lib/docker/:/var/lib/docker:ro \
  --volume=/dev/disk/:/dev/disk:ro \
  --net="host" \
  --detach=true \
  --name=cadvisor \
  --restart=unless-stopped \
  --device=/dev/kmsg \
  google/cadvisor
```

然后可以通过 http://ip:8080/metrics 来看是否起来了

这里发现如果做了端口映射，就无法通过iptables来禁用端口，所以用了`--net="host"`

## Prometheus安装

参考：

https://github.com/prometheus/prometheus

https://www.cnblogs.com/xiao987334176/p/9930517.html

配置文件`/root/monitor/prometheus`

```shell
global:
  scrape_interval:     60s
  evaluation_interval: 60s
 
scrape_configs:
  - job_name: prometheus
    static_configs:
      - targets: ['localhost:9090']
        labels:
          instance: prometheus
 
  - job_name: linux
    static_configs:
      - targets: ['ip:9100']
        labels:
          instance: localhost
```

启动docker

```shell
docker pull prom/prometheus

docker run  -d \
  --net="host" \
  --name prometheus \
  --restart=unless-stopped \
  -v /ssd-raid/monitor/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```

然后可以通过 http://ip:9090/targets 看到配置的内容



## Grafana

创建配置目录

```shell
mkdir grafana
chmod 777 -R grafana
```

启动docker

```shell
docker pull grafana/grafana

docker run -d \
  -p 3000:3000 \
  --name=grafana \
  --restart=unless-stopped \
  -v /ssd-raid/monitor/grafana:/var/lib/grafana \
  grafana/grafana
```



官网这里还介绍了如何安装安装其他插件

https://grafana.com/docs/grafana/latest/installation/docker/



## 配置Grafana

首先要添加Prometheus，参考 https://www.cnblogs.com/xiao987334176/p/9930517.html

然后要添加监控面板，直接用模板即可，参考 https://www.cnblogs.com/xuliuzai/p/11134714.html

模板官网：https://grafana.com/grafana/dashboards

最后节点监控用的是模板`8919`

docker监控用的是模板`11277`，因为我有多个cadvisor实例，所以要在设置中将Variables中的instance变量的Hide取消，并将Include All Option打开，然后别忘了保存一下。

## 后续

直接把服务器状态信息暴露在公网上还是太危险了，虽然还没折腾，但是可以参考如下方案：

https://www.jianshu.com/p/d6963503310e

https://blog.whsir.com/post-4328.html

https://www.cnblogs.com/yanglei-xyz/p/12212530.html
