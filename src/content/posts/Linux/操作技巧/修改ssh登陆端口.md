---
title: 修改ssh登陆端口
date: 2019-10-09T00:00:00.000Z
slug: change-ssh-port
categories:
  - Linux
  - 操作技巧
tags:
  - Linux
  - ssh
---
## 摘要

今天登陆服务器突然发现root密码正在缓慢的被爆破，然后果断先换一个ssh端口再说

<!-- more --> 

## 修改ssh配置文件

修改`/etc/ssh/sshd_config`，注意这里是带`d`的，一开始改错了，被坑了好久

找到端口号并修改

## 在selinux上注册新的ssh端口

如果不进行这一步直接重启sshd可能会出现无法重启，查看详细信息会提示端口无法绑定

```shell
yum -y install policycoreutils-python
semanage port -l | grep ssh
# 这时候会显示只有一个22
semanage port -a -t ssh_port_t -p tcp 2222 # 添加一个2222端口
# 上面这条命令可能会报该端口不可用的错误，换一个就好
semanage port -l | grep ssh
# 这时候会多显示一个2222，如果没有说明没设置成功
```

## 禁止root直接登录

当创建了其他用户的情况下，可以禁用root登录来获取更高的安全性

修改`/etc/ssh/sshd_config`中的`PermitRootLogin`为no即可

## 重启服务

```shell
systemctl restart sshd # 重启服务
```
