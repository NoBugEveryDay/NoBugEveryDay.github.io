---
title: 使用Docker安装openssh
date: 2020-10-08T00:00:00.000Z
slug: docker-openssh
categories:
  - Docker
tags:
  - Docker
  - openssh
---
## 摘要

偶然间突然有了需要把一个linux环境下的一个文件夹请别人ssh上来看的需求，于是直接用docker起个`openssh-server`然后再把目录挂进去

<!-- more --> 

首先需要用`ssh-keygen`命令生成一对秘钥，再用如下命令

```bash
docker run -d \
  --name=openssh-server \
  --hostname=openssh-server \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Asia/Shanghai \
  -e PUBLIC_KEY_FILE=/config/id_rsa.pub `#publi key` \
  -e SUDO_ACCESS=true `#allow sudo` \
  -e PASSWORD_ACCESS=false \
  -e USER_NAME=user \
  -p 22223:2222 \
  -v /ssd-raid/openssh-server/config:/config \
  -v /mnt/knl01:/mnt/knl01:ro \
  --restart unless-stopped \
  linuxserver/openssh-server
```

这里禁用了密码登录，并且上来之后可以使用sudo命令

---

但是上述方法的容器中有非常多的限制，还是使用一个完整的centos叭

```bash
docker run -d \
  --name knl01-server \
  --hostname=openssh-server \
  -p 22223:22 \
  --env "SSH_USER=tmpuser" \
  --env "SSH_SUDO=ALL=(ALL) NOPASSWD:ALL" \
  --env "SYSTEM_TIMEZONE=Asia/Shanghai" \
  --env "SSH_AUTHORIZED_KEYS=/var/run/config/authorized_keys" \
  -v /ssd-raid/openssh-server/centos/id_rsa.pub:/var/run/config/authorized_keys \
  -v /mnt/knl01:/mnt/knl01:ro \
  jdeathe/centos-ssh
```

然后再用一个frp映射到外网即可
