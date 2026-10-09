---
title: vscode编辑Markdown配置方法
date: 2022-06-24T00:00:00.000Z
slug: vscode-markdown-setup
categories:
  - Tools
tags:
  - vscode
  - Markdown
---
## 摘要

昨天我日常用的Markdown编辑软件typora彻底不再支持免费版，所以被迫转战vscode，顺便记录一下配置一下的过程。

<!-- more --> 

免责声明：以下是我觉得用得舒服的配置，你用得舒不舒服和我没有关系。

## 需要安装的插件

- `Markdown All in One`
- `Markdown Image`

不知道是不是vscode自带了插件`Markdown Preview Enhanced`我把它卸载了

## 配置方法

在`Markdown Image`的插件设置里，我把`Markdown-image › Base: File Name Format`设置为了`${mdname}/${hash}`，然后再把`Markdown-image › Local: Path`设置为`/`，这样就可以在粘贴图片时把文件复制存到和Markdown文件同名的文件夹下。


<!-- more -->
