---
title: 使用Docker配置反向代理
date: 2021-12-24T00:00:00.000Z
slug: docker-reverse-proxy
categories:
  - Docker
tags:
  - Docker
  - Nginx
---
## 摘要

经常我们会需要将本地机器上起的其他http服务放到公网上，这就需要将特定的域名的访问转到这个docker容器内，并且往往还需要添加https，有时候还希望有个用户名和密码的认证，以防其他人访问。本文讲述如何使用Nginx反向代理将本机跑在其他容器里的http服务，转为https，并且添加用户名和密码认证。

<!-- more --> 

## 目录配置

我的目录配置如下

```
nginx-proxy/
├── create.sh
├── nginx.conf
├── passwd
│   └── test
└── ssl
    └── test.sysu.tech
        ├── key
        └── pem
```

## 启动脚本

`create.sh`如下

```shell
#!/bin/bash

docker rm -f nginx_proxy

docker run -d \
    -v /ssd-raid/nginx-proxy/nginx.conf:/etc/nginx/nginx.conf \
    -v /ssd-raid/nginx-proxy/ssl:/root/ssl \
    -v /ssd-raid/nginx-proxy/passwd:/passwd \
    --name=nginx_proxy \
    -p 80:80 \
    -p 443:443 \
    --restart=unless-stopped \
    nginx
```

## Nginx配置文件

`nginx.conf`如下

```conf
user  nginx;
worker_processes  1;

error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;


events {
    worker_connections  1024;
}


http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;

    keepalive_timeout  65;

    #gzip  on;

    include /etc/nginx/conf.d/*.conf;

    # For HEXO
    server {
        listen       80;
        server_name  blog.sysu.tech;

        #charset koi8-r;

        access_log  /root/host.access.log  main;

        location / {
            proxy_pass   http://192.168.1.2:8081;
        }
    }

    # For test
    server {
        listen       443 ssl;
        server_name  test.sysu.tech;

        ssl_certificate       /root/ssl/test.sysu.tech/pem;
        ssl_certificate_key   /root/ssl/test.sysu.tech/key;

        # password
        auth_basic "Please input password";
        auth_basic_user_file /passwd/test;

        #charset koi8-r;

        access_log  /root/host.access.log  main;

        location / {
            proxy_pass   http://192.168.1.2:12345;
        }
    }
}
```

## 配置反向代理

配置反向代理的关键就是在`nginx.conf`中的如下配置

```conf
server_name  blog.sysu.tech;
location / {
	proxy_pass   http://192.168.1.2:12345;
}
```

这里的`http://192.168.1.2:12345`就是从本地能访问到的方式，`nobugeveryday.github.io`就是它的域名。（将域名解析到本地ip此处省略）

## 配置https

配置反向代理的关键就是在`nginx.conf`中的如下配置

```conf
listen       443 ssl;
server_name  test.sysu.tech;
ssl_certificate       /root/ssl/test.sysu.tech/pem;
ssl_certificate_key   /root/ssl/test.sysu.tech/key;
```

这里的`pem`和`key`就是你配置域名的ssl证书得来的，我是直接阿里云上申请的，能直接生成Nginx能用的证书

## 配置访问密码

配置反向代理的关键就是在`nginx.conf`中的如下配置

```conf
auth_basic "Please input password";
auth_basic_user_file /passwd/test;
```

其中`/passwd/test`中的就是用户名和密码，需要用`htpasswd`命令生成，例如

```shell
htpasswd -bc /ssd-raid/nginx-proxy/passwd/test test 123456
```

## 配置流量统计

推荐使用这个插件https://github.com/vozlt/nginx-module-vts

但是装这个插件也挺麻烦，直接使用现成的镜像https://hub.docker.com/r/ktxcx/nginx-vts

其他所有配置都不需要改，只需要在`nginx.conf`增加，就可以在对应的页面访问到了

```conf
http {
    vhost_traffic_status_zone;

    ...

    server {

        ...

        # 只需要某一个Server添加即可
        location /status {
            vhost_traffic_status_display;
            vhost_traffic_status_display_format html;
        }
    }
}
```
