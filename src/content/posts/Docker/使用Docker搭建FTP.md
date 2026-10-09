---
title: 使用Docker搭建FTP
date: 2020-06-18T00:00:00.000Z
slug: docker-ftp-server
categories:
  - Docker
tags:
  - Docker
  - FTP
---
参考：https://www.hangge.com/blog/cache/detail_2449.html

```bash
docker run -d -v /root/ftp:/home/vsftpd \
  -p 20:20 -p 21:21 -p 21100-21110:21100-21110 \
  -e FTP_USER=[Username] -e FTP_PASS=[Password] \
  -e PASV_ADDRESS=[ipv4 address] \
  -e PASV_MIN_PORT=21100 -e PASV_MAX_PORT=21110 \
  --name ftp --restart=unless-stopped \
  fauria/vsftpd
```

记得把这里`/root/ftp`换成宿主机对应目录
