---
title: Docker安装教程
date: 2019-08-26T00:00:00.000Z
slug: docker-install-guide
categories:
  - Linux
  - 安装教程
tags:
  - Linux
  - Docker
---
## 摘要

本文介绍如何在CentOS7.6及Ubuntu16.04下安装Docker

<!-- more --> 

## 在CentOS7.6中安装Docker

### 参考

https://www.cnblogs.com/yufeng218/p/8370670.html

https://www.cnblogs.com/whgfu/articles/9466859.html

### 安装依赖

```shell
sudo yum install -y yum-utils device-mapper-persistent-data lvm2
```

### 增加yum源

```shell
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

### 安装docker

```shell
sudo yum install docker-ce
```

### 切换源

按照上述的操作步骤，会发现docker下载得非常慢，这是由于使用的yum源的原因，将其切换为阿里源

```shell
# 删除旧源
rm /etc/yum.repos.d/docker-ce.repo
# 添加阿里源
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
# 重新安装docker
sudo yum install docker-ce
```

### 启动并加入开机启动

```shell
sudo systemctl start docker
sudo systemctl enable docker
```
### 修改国内镜像源

```shell
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://ergtnl8j.mirror.aliyuncs.com"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

## 在CentOS7.6中【离线】安装Docker

由于一些原因无法联网，只能选择离线安装

### 参考

https://docs.docker.com/install/linux/docker-ce/centos/

### 安装依赖

同前面的依赖，不过需要挂载本地镜像来安装

### 下载安装包

一开始下载了好一些，不断装装卸卸，最后只用到了如下的

- https://download.docker.com/linux/centos/7/x86_64/stable/Packages/
  - containerd.io-1.2.6-3.3.el7.x86_64.rpm
  - docker-ce-19.03.2-3.el7.x86_64.rpm
  - docker-ce-cli-19.03.2-3.el7.x86_64.rpm
- http://mirrors.atosworldline.com/public/centos/7/extras/x86_64/Packages/
  - container-selinux-2.107-3.el7.noarch.rpm

然后按照一定的依赖的顺序，使用`yum install`来一个个安装上即可

### 其余步骤同上面的在线安装

## 在Ubuntu16.04中安装Docker

### 参考

https://blog.csdn.net/u010889616/article/details/80170767

### 安装

```shell
apt install docker.io
systemctl start docker
systemctl enable docker
```

### 查看是否安装成功

```shell
$ docker -v
Docker version 17.12.1-ce, build 7390fc6
```

### 修改国内镜像源

```shell
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://ergtnl8j.mirror.aliyuncs.com"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

经实验，这个方法在树莓派上的ubuntu也适用

## 修改日志大小

有一些容器容易产生大量的屏幕日志，这些都在docker的log里面，时间长了容易炸。

在前面创建的`/etc/docker/daemon.json`中增加以下字段

```json
{
  "registry-mirrors": ["https://ergtnl8j.mirror.aliyuncs.com"],
  "log-opts": {
      "max-size": "10m"
  }
}
```

然后再重启docker就好

```shell
sudo systemctl daemon-reload
sudo systemctl restart docker
```
