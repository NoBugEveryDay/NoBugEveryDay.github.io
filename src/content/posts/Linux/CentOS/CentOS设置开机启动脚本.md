---
title: CentOS设置开机启动脚本
date: 2019-05-02T00:00:00.000Z
slug: centos-startup-scripts
categories:
  - Linux
  - CentOS
tags:
  - Linux
  - CentOS
---
## 参考
[Centos7开机启动自己的脚本](https://www.jianshu.com/p/8a5d968afc7f "Centos7开机启动自己的脚本")

## 步骤
1. 编写要开机启动的脚本，这里我们假设这个脚本是`/root/wifi-init.sh`
2. 执行如下命令将`/etc/rc.d/rc.local`文标记为可执行文件
```shell
chmod +x /etc/rc.d/rc.local
```
3. 打开/etc/rc.d/rc.local文件,在最后面添加
```shell
. /root/wifi-init.sh
```
