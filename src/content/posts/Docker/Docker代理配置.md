---
title: Docker代理配置
date: 2024-12-07T00:00:00.000Z
slug: docker-proxy-setup
categories:
  - Docker
tags:
  - Docker
  - Proxy
---
## 摘要

由于docker被墙，各种镜像代理也逐渐不能用，因此要给docker配个代理。最简单的方法其实是把docker pull的流量代理到本地，因为本地一般都有梯子，这样不用为服务器装代理了。

<!-- more --> 

## 方法

"docker pull" 命令是由 dockerd 守护进程执行。而 dockerd 守护进程是由 systemd 管理。因此，如果需要在执行 "docker pull" 命令时使用 HTTP/HTTPS 代理，需要通过 systemd 配置。

- 为`dockerd`创建配置文件夹。

```
sudo mkdir -p /etc/systemd/system/docker.service.d
```

- 为`dockerd`创建 HTTP/HTTPS 网络代理的配置文件，文件路径是`/etc/systemd/system/docker.service.d/http-proxy.conf`。并在该文件中添加相关环境变量。

```
[Service]
Environment="HTTP_PROXY=127.0.0.1:7890"
Environment="HTTPS_PROXY=127.0.0.1:7890"
Environment="NO_PROXY=localhost,127.0.0.1,.example.com"
```

- 刷新配置并重启docker服务。

```
sudo systemctl daemon-reload
sudo systemctl restart docker
```

- 最后通过`ssh -R`代理到本地

```
ssh -R 7890:127.0.0.1:7890 hz
```

## 参考

https://yeasy.gitbook.io/docker_practice/advanced_network/http_https_proxy
