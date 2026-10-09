---
title: 使用acme.sh配置https加密
date: 2022-04-08T00:00:00.000Z
slug: acme-sh-https
categories:
  - 网络
tags:
  - 网络
  - acme.sh
  - https
  - ssl
---
## 摘要

对于自建的网站，最好使用https加密一下，以防止被劫持和流量监控。TLS加密的证书可以通过阿里云之类的服务商直接在网页上申请，然后下载使用，但是现在阿里云的免费证书数量限制为了20个。所以本文介绍使用`acme.sh`脚本来申请"[Let's Encrypt](https://letsencrypt.org/)"的免费证书，这里数量不受限制，并且还可以自动更新。

<!-- more --> 

## 安装

**注意：这里的邮箱要用有效邮箱，因为会被自动用来注册**

```shell
curl https://get.acme.sh | sh -s email=your_email@your_email.com
```

然后会脚本会被安装到`~/.acme.sh`目录，后面下载的证书也会被先暂存在这个文件夹

并且还会把这个脚本设置为每天定时任务：检查是否有证书需要更新证书

如果卡在下载了，可能是国内网络问题，可以手动安装，详细说明可以参照官方https://github.com/acmesh-official/acme.sh#2-or-install-from-git

```bash
wget https://github.com/acmesh-official/acme.sh/archive/refs/tags/3.0.5.tar.gz
tar -xvf 3.0.5.tar.gz
cd acme.sh-3.0.5/
./acme.sh --install -m my@example.com
```

## 申请证书

```shell
cd  ~/.acme.sh
./acme.sh  --issue -d your.host --webroot /your/web/root/
```

这里`your.host`就是你的域名，`/your/web/root/`是你网站的根目录

这个脚本申请证书的逻辑是：将一些文件放到你网站的根目录，认证服务器会使用这个域名访问 http://your.host 来找这些文件，以证明这个域名是的所有权是你的，然后签发证书

因此想要这一步成功运行，还需要确保：

1. 将域名`your.host`解析到你服务器的ip
2. 将`/your/web/root/`设置为你网站的根目录

这里可以[使用Docker搭建HFS](/Docker/使用Docker搭建HFS/)是最简单的方法，如果有多个域名解析，还可以[使用Docker配置反向代理](/Docker/使用Docker配置反向代理/)

## 安装证书

首先，配置你的web服务器从目录`/your/web/ssl/your.host/`读取秘钥文件，然后执行一下命令

```shell
cd  ~/.acme.sh
./acme.sh --install-cert -d your.host \
    --key-file       /your/web/ssl/your.host/key.pem  \
    --fullchain-file /your/web/ssl/your.host/cert.pem \
    --reloadcmd      "docker restart nginx_proxy"
```

这一步将证书安装到目录`/your/web/ssl/your.host/`，并且帮你执行重启web服务器的命令

这一步之所以要让这个脚本帮你重启web服务器，是因为这个脚本帮你自动更新证书之后，会帮你自动更新到这个目录，并且帮你重启web服务器

## 更新证书

如果要手动更新某个域名的证书

```shell
./acme.sh --renew --force -d your.host
```

如果要手动更新所有域名的证书

```shell
./acme.sh --renew-all
```

## 移除证书

```shell
./acme.sh --list
```

可以通过这个命令查看当前维护证书的域名

```shell
./acme.sh --remove -d your.host
```

然后通过这个命令移除某个域名的证书
