---
title: 使用Docker部署Hexo5.2
date: 2020-10-15T00:00:00.000Z
slug: deploy-hexo5-2-with-docker
categories:
  - Hexo
tags:
  - Hexo
  - Docker
---
## 摘要

突然想要折腾一下，解决之前`hexo3.9.0`的一些小问题：代码块没有水平滚动条、无法显示数学公式的问题，于是干脆顺便升级一下新的`hexo5.2.0`

<!-- more --> 

## 容器内装HEXO

```bash
docker run -it --net=host centos:7.6.1810
curl -sL https://rpm.nodesource.com/setup_14.x | bash -
yum install -y git-core nodejs
npm install -g hexo-cli
```

这里是在VPS上做得，国内`npm install`太慢了，因为docker内无法用`ipv6`会导致`yum install`失败，所以用了参数`--net=host`

## 保存Hexo镜像

```shell
docker commit -m "Hexo5 origin submit" -a "Orange" 1ac140d51bcf hexo5
```

此处省略保存镜像再拉回本地再导入镜像的步骤

## 初始化博客目录

```bash
docker run -it \
  --name="hexo5" \
  -v /ssd-raid/hexo5/blog:/root/hexo5/blog \
  hexo5
cd /root/hexo5
hexo init blog # 新建工作目录
cd blog
npm install
npm install hexo-deployer-git --save
git clone https://github.com/next-theme/hexo-theme-next themes/next
```

这个文件夹也是在墙外VPS上做的然后拉回来的

## 启动容器并启动Hexo

使用一个脚本，将nas里的博客同步过来

```shell
./start.sh
```

`start.sh`如下

```shell
#!/bin/bash

docker rm -f hexo

MOUNT_PATH=/wolf1/seafile/backup/feng/admin

if [ "`ls -A "${MOUNT_PATH}/virtual-drive-dir/My Libraries/私人资料库"`" = "" ]
then
	echo "The seadrive dir ${MOUNT_PATH}/virtual-drive-dir/My Libraries/私人资料库 is empty! The seadrive may have some error, abort start hexo!"
	exit 1
fi

docker run -d \
  --name="hexo" \
  -p 8080:4000 \
  -v /ssd-raid/hexo5/blog:/root/hexo5/blog \
  -v "/wolf1/seafile/backup/feng/admin/virtual-drive-dir/My Libraries/学习/blog":/root/ori-post \
  hexo5 /root/hexo5/blog/start.sh
```

其中`/root/hexo/blog/start.sh`用于在容器中转换图片文件路径并启动server，内容如下

```shell
#!/bin/bash

set -e

. /root/.nvm/nvm.sh
. /root/.nvm/bash_completion

cd /root/hexo5/blog
hexo clean
rsync -axvh --delete /root/ori-post/* /root/hexo5/blog/source/_posts
/root/hexo5/blog/convert-image.sh /root/hexo5/blog/source/_posts/
hexo generate
hexo server
```

其中`convert-image.sh`如下

```shell
#/bin/bash

set -e

if [ -z "$1" ]
then
    echo "Use with path!"
    exit
fi

echo cd $1
cd "$1"

IFS=$(echo -en "\n\b")

for file in *
do
    if [ -d "$file" ]
    then
        /root/hexo5/blog/convert-image.sh `pwd`/$file
    elif [ "${file##*.}" = "md" ]
    then
        echo convert $file
        sed -i "s/!\[.*\](\(.\+\)\/\(.\+\))/{% asset_img \2 %}/" "$file"
    fi
done
```

## 美化配置

把`_config.yml`目录下

- `post_asset_folder`设置为`true`这样才能读到图片

- `prismjs:`的`enable:`设置为`true`来启用基于`prism`的代码高亮，这个对`bash`和`shell`的支持更好一些

其他见`Hexo美化设置`

## Github配置

参考：https://hexo.io/zh-cn/docs/one-command-deployment

```shell
docker exec -it hexo bash
cd /root/hexo5/blog
hexo deploy
```

## 数学公式

然后在文章大开头加如下内容就可以使公式渲染

```html
<script type="text/javascript"
   src="https://cdn.jsdelivr.net/npm/mathjax@2/MathJax.js?config=TeX-AMS-MML_HTMLorMML">
</script>
```

但是这个由于github的安全机制，无法在推到github上之后继续渲染公式

可以考虑用如下的动态将公式转成图片的网址来进行渲染（ps.要去掉方括号后面的空格）

```markdown
![a=x+y] (https://latex.codecogs.com/png.axy.png?\textbf{a=x+y})
```

但是有一个巨大的问题就是无法显示行内公式，该问题到现在我也还没解决

## 更新：cdn.jsdelivr.net无法访问

由于cdn.jsdelivr.net国内无法访问了，所以要对js的cdn做一些修改

修改`themes/next/_config.yml`中的

```yml
vendors:
  plugins: jsdelivr
```

为

```yml
vendors:
  plugins: unpkg
```

同时上面一节的数学公式一章的部分也要改成

```html
<script type="text/javascript"
   src="https://unpkg.com/mathjax@2/MathJax.js?config=TeX-AMS-MML_HTMLorMML">
</script>
