---
title: Docker网络配置
date: 2021-05-31T00:00:00.000Z
slug: docker-network-config
categories:
  - Docker
tags:
  - Docker
  - Network
---
## 摘要

在docker的使用过程中，尝尝会因为docker自建默认网络和现有网络的网段相冲突导致有些网络无法访问

本文记录如何修改docker默认网段以及docker-compose中的网段

<!-- more --> 

## 修改docker默认网段

修改`vim /etc/docker/daemon.json`

```json
{
  "default-address-pools": [ 
    {"base":"192.168.211.0/24","size":24}
  ],
  "registry-mirrors": ["https://ergtnl8j.mirror.aliyuncs.com"]
}
```

主要是第一个字段，第二个字段是之前就为docker添加的镜像仓库，这里要注意json格式，否则docker daemon无法启动

然后需要使修改生效

```shell
systemctl stop docker
sudo ip link set dev docker0 down
sudo brctl delbr docker0
systemctl restart docker
```

如果找不到`brctl`命令装一下就好`yum install -y bridge-utils`

## 修改docker-compose中的网段

在`docker-compose.yml`中加上如下这段

```yaml
networks:
  default:
    driver: bridge
    ipam:
      config:
        - subnet: 192.168.212.0/24
```

其中subnet字段可以改成想要的网段，其他的啥都不用改即可

可能需要用到的命令

```shell
docker network ls
docker network inspect [NETWORK_NAME]
docker network rm [NETWORK_NAME]
docker network prune	# Remove all unused networks
docker-compose down 	# Stop and remove containers, networks, images, and volumes
```
