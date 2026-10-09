---
title: Docker基础命令
date: 2019-09-19T00:00:00.000Z
slug: docker-basic-commands
categories:
  - Docker
tags:
  - Docker
---
## 摘要

这里是一些Docker基础命令

<!-- more --> 

## 运行容器

```shell
docker run [options] IMAGE [arg]
--name="容器名"
-d：后台运行容器，并返回容器ID，也即启动守护式容器
-i：以交互模式运行容器，通常与-t同时使用
-t：为容器重新分配一个伪终端，通常与-i同时使用
-P：随机端口映射
-p：指定端口映射，有以下四种格式
	ip:hostPort:containerPort
	ip::containerPort
	hostPort:containerPort
	containerPort
-v HOST_PATH:CONTANER_PATH
docker run -it ubuntu # 开启Ubuntu镜像并进入到其终端中
docker run -d ubuntu service xxx start # 启动容器并开启服务（不然没有任务运行就自动stop了）
```

## 进入到正在运行的容器

```bash
docker exec -it CONTAINER_ID [command] # 在容器中运行指令，如果是/bin/bash就能进入终端
docker attach CONTAINER_ID # 直接进入容器命令终端，不会启动新的进程
```

## 查看正在运行的容器

```shell
docker ps [options]
-a：列出所有正在运行的容器+历史上运行的容器
-l：显示最近创建的容器
-n：显示最近的n个容器
-q：静默模式，只显示容器编号
--no-trunc：不截断输出
```

## 退出容器（容器内）

```shell
exit # 停止容器并退出
ctrl+P+Q # 不停止容器但退出
```

## 启动容器

```shell
docker start CONTAINER_ID # 把处于exit状态的容器启动起来
```

## 重启容器

```shell
docker restart CONTAINER_ID # 重启容器
```

## 停止容器

```shell
docker stop CONTAINER_ID # 停止容器
```

## 强制停止容器

```shell
docker kill CONTAINER_ID # 强制停止容器
```

## 删除容器

```shell
docker rm CONTAINER_ID # 删除容器
docker rm `docker ps -a -q` # 删除所有容器
```

## 复制文件

```bash
docker cp CONTAINER_ID:PATH PATH 
```

## 查看容器日志

```bash
docker logs [options] CONTAINER_ID
-t：加入时间戳
-f：实时输出
--tail n：打印最后的n条
```

## 查看容器的进程

```shell
docker top CONTAINER_ID
```

## 查看容器信息

```bash
docker inspect CONTAINER_ID
```

## 保存镜像

```shell
docker commit -m "Comments" -a "Author" CONTAINER_ID IMAGE_NAME
```

## 导出镜像

```shell
docker save [IMAGE ID] > NAME.tar
```

## 导入镜像

```shell
docker load < NAME.tar
docker tag IMAGE_ID IMAGE_NAME:latest
```
