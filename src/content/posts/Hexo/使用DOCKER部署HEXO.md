---
title: 使用Docker部署Hexo
date: 2019-10-30T00:00:00.000Z
slug: deploy-hexo-with-docker
categories:
  - Hexo
tags:
  - Hexo
  - Docker
---
## 摘要

由于在VPS上已经安装了LAMP+WordPress，但是WordPress排版爆炸了，所以想换着试一下，但是还不想完全弃用原来的，想把两个都部署上作为一个过渡

<!-- more --> 

## 环境

阿里云轻量型应用服务器Ubuntu-1核 - 2GB内存 - 系统盘 40GB SSD云盘 - 深圳

```shell
$ uname -a
Linux SZ-vpn 4.4.0-93-generic #116-Ubuntu SMP Fri Aug 11 21:17:51 UTC 2017 x86_64 x86_64 x86_64 GNU/Linux
```

## 安装docker

参考：https://blog.csdn.net/u010889616/article/details/80170767

```shell
apt install docker.io
systemctl start docker
systemctl enable docker
```

查看是否安装成功

```bash
$ docker -v
Docker version 17.12.1-ce, build 7390fc6
```

修改国内镜像源

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

## 在Docker中安装Ubuntu

```shell
docker pull ubuntu:18.04
```

## 容器内装HEXO

```bash
docker run -it ubuntu
apt-get update
apt-get install -y wget
apt-get install -y git-core
cd /root
mkdir hexo
cd hexo
wget https://raw.github.com/creationix/nvm/v0.33.11/install.sh
chmod +x install.sh
./install.sh
NVM_NODEJS_ORG_MIRROR=https://npm.taobao.org/mirrors/node nvm install stable # 换源
npm install -g hexo-cli
npm install hexo-server --save
npm install hexo-asset-image –save
```

## 保存Hexo镜像

```shell
docker commit -m "Hexo origin submit" -a "Orange" 1ac140d51bcf hexo
```

## 初始化博客目录

```bash
mkdir blog # 在host上建一个目录
docker run -it --name="hexo-server" -v /root/hexo/blog:/root/hexo/blog hexo
cd /root/hexo
hexo init blog # 新建工作目录
cd blog
npm install
```

## 启动容器并启动Hexo

```shell
docker run -d --name="hexo" -p 80:4000 -v /root/hexo/blog:/root/hexo/blog hexo /root/hexo/blog/start.sh
```

`start.sh`如下

```shell
#!/bin/bash

. /root/.nvm/nvm.sh
. /root/.nvm/bash_completion

cd /root/hexo/blog
hexo clean
/root/hexo/blog/convert-image.sh /root/hexo/blog/source/_posts/ # 转换图片引用方式脚本
hexo generate
hexo server
```

## 新建文章

```shell
docker exec -it CONTAINER_ID /bin/bash
hexo new "TITLE" -p PATH
```

当然直接新建是最方便的

## 一些测试

1. 在`source/_post`文件夹下可以建文件夹，在文件夹下新建md可以直接
2. 文件名可以为中文
3. 文件夹名可以为中文

## 在文章中插入图片

参考：https://hexo.io/zh-cn/docs/asset-folders

在Hexo的文章中插入图片是最坑的，非要用它自己特定的语法，在本地编辑的时候没法预览。虽然说有相关插件，但是到了Hexo3，这些插件要么在文章预览时显示图片，点进去不显示，要么在文章预览时不显示，点进去才显示，非常智障。

为了在本地编辑能够预览，上传之后也能正常显示，干脆写了个脚本在启动Hexo server之前来转换格式。

为了方便整理每篇文章的图片，我选择在每篇文章的旁边建一个同名目录放图片的形式，这需要设置`_config.yml`的`post_asset_folder: true`

转换脚本如下

```shell
#/bin/bash

if [ -z $1 ]
then
    echo "Use with path!"
    exit
fi

echo cd $1
cd $1
for file in `ls`
do
    if [ -d $file ]
    then
        /root/hexo/blog/convert-image.sh `pwd`/$file
    elif [ "${file##*.}" = "md" ]
    then
        echo convert $file
        sed -i "s/!\[.\+\](\(.\+\)\/\(.\+\))/{% asset_img \2 \1 %}/" $file
    fi
done
```

## 总结

个人觉得Hexo还是非常完美的，几乎完美符合我对个人博客的预期，该有的功能都有，累赘的东西一个都没有，除了文章中插入图片的方法过于狗屎。希望后面不要打脸叭~

![1564761064698.png](使用DOCKER部署HEXO/1564761064698.png)

## 更新

现在使用了基于`Seafile`的NAS，也将Hexo迁移到了NAS上。博客在PC上保存了之后能自动同步上NAS，所以将Hexo的启动逻辑改为了先同步更改到Hexo目录

`start.sh`更改为如下

```shell
#!/bin/bash

. /root/.nvm/nvm.sh
. /root/.nvm/bash_completion

cd /root/hexo/blog
hexo clean
rsync -axvh --delete /root/ori-post/* /root/hexo/blog/source/_posts
/root/hexo/blog/convert-image.sh /root/hexo/blog/source/_posts/
hexo generate
hexo server
```

启动命令

```shell
docker run -d \
--name="hexo" \
-p 80:4000 \
-v /ssd-raid/hexo/blog:/root/hexo/blog \
-v "/wolf1/seafile/backup/feng/admin/virtual-drive-dir/My Libraries/学习/blog":/root/ori-post \
hexo /root/hexo/blog/start.sh
```

由于每一次修改都要重启Hexo，其实有点浪费，干脆写一个能自动更新的脚本吧

`update.sh`如下

```shell
#!/bin/bash

cd /root/hexo/blog
rsync -axvh --delete /root/ori-post/* /root/hexo/blog/source/_posts
hexo clean
/root/hexo/blog/convert-image.sh /root/hexo/blog/source/_posts/
hexo generate
```

执行update.sh的命令如下

```shell
docker exec hexo /root/hexo/blog/update.sh
```

但是使用这个脚本会导致图片爆炸……算了……还是暴力`docker restart hexo`吧
