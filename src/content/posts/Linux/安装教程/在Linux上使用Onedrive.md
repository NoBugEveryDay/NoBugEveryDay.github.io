---
title: 在Linux上使用OneDrive
date: 2020-01-09T00:00:00.000Z
slug: use-onedrive-on-linux
categories:
  - Linux
  - 安装教程
tags:
  - Linux
  - OneDrive
---
## 摘要

本文介绍如何在Centos7.6环境中安装无GUI的Onedrive客户端并实现同步

<!-- more --> 

## 寻找解决方案

其实无论在百度还是在Google上搜索Linux+OneDrive都能看到一堆解决方案，然后会有一堆GitHub仓库。这应该是因为OneDrive开放了接口给开发者。这里姑且把比较容易能搜到的几种无GUI的Onedrive客户端都看一下，然后找一个合适的用吧~

| GitHub地址                               | Watch | Star | Folk |
| ---------------------------------------- | ----- | ---- | ---- |
| <https://github.com/skilion/onedrive>    | 157   | 3.2k | 483  |
| <https://github.com/xybu/onedrive-d-old> | 92    | 819  | 147  |
| <https://github.com/abraunegg/onedrive>  | 45    | 1.5k | 483  |

最后这个https://github.com/abraunegg/onedrive虽然star少一点，但是实在持续维护的，而且似乎支持docker，走你！

## 安装

参考：<https://github.com/abraunegg/onedrive/blob/master/docs/Docker.md>

```shell
docker pull driveone/onedrive
cd /wolf1
mkdir onedrive
cd onedrive
mkdir data
mkdir conf
chown -R orange:user /wolf1/onedrive
docker run -it --restart unless-stopped --name onedrive -v /wolf1/onedrive/conf:/onedrive/conf -v /wolf1/onedrive/data:/onedrive/data driveone/onedrive
```

草！用5G的辣鸡账户就能登录，用1T的账户就登录不上了，日！

返回的是invalid_client……
