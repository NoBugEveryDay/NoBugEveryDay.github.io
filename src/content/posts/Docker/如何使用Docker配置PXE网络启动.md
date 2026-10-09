---
title: 如何使用Docker配置PXE网络启动
date: 2022-08-23T00:00:00.000Z
slug: docker-pxe-boot
categories:
  - Docker
tags:
  - Docker
  - PXE
  - dnsmasq
  - HFS
---
## 摘要

本文介绍如何使用Docker部署PXE网络启动

<!-- more --> 

## 参考

https://yunfwe.github.io/2018/06/03/2018/%E4%B8%80%E6%AD%A5%E6%AD%A5%E6%90%AD%E5%BB%BAPXE%E7%BD%91%E7%BB%9C%E8%A3%85%E6%9C%BA/

https://serverfault.com/questions/302445/how-do-i-mac-filter-with-dhcp-server

## 启动流程

首先我们要知道PXE网络启动是怎么运作的：

这里我们称需要网络启动的服务器为客户端，假设它的ip是192.168.4.9；负责帮助网络中其他机器进行网络启动的服务器为服务端，假设它的ip是192.168.4.10。

1. 服务端部署好DHCP服务器、tftp服务器，可能还需要配置HTTP服务器，准备为客户端服务
2. 客户端在BIOS配置选择PXE启动
3. 客户端向通过DHCP向服务器端获取ip地址
4. 服务端的DHCP服务器分配一个ip地址给客户端，并在该数据包中附上`dhcp-boot`字段指定网络启动的文件名
5. 客户端根据`dhcp-boot`字段中指定的网络启动文件名，到服务端的tftp服务器获取该文件
6. 成功下载该文件之后，客户端以该文件作为一个引导开始启动

## DHCP服务器及tftp服务器部署

最方便的方法就是使用Docker进行部署，可以参考[使用Docker自建DNS服务器](/Docker/使用Docker自建DNS服务器/)

```bash
docker run \
        --name dnsmasq \
        -d \
        --host=net \
        -v /root/dnsmasq/dnsmasq.conf:/etc/dnsmasq.conf \
        -v /root/dnsmasq/pxeboot:/data/pxeboot \
        --log-opt "max-size=100m" \
        -e "HTTP_USER=3bd0d" \
        -e "HTTP_PASS=1e1f6" \
        --restart always \
        jpillora/dnsmasq
```

配置文件`/root/dnsmasq/dnsmasq.conf`如下

```bash
interface=eno1

#enable dhcp
dhcp-range=192.168.4.10,192.168.4.200,12h
dhcp-option=3,192.168.4.9
dhcp-boot=undionly.kpxe

# enable tftp
enable-tftp
tftp-root=/data/pxeboot
```

不过我这里遇到了一个特殊情况：网络中已经有其他DHCP服务器了，并且我不希望我的DHCP干扰网络中其他的正常ip分配。所以我希望我的DHCP服务器只对某个固定的MAC地址分配ip，配置如下

```bash
interface=eno1

# enable dhcp
dhcp-range=192.168.4.10,static
dhcp-host=00:11:22:33:44:55,192.168.4.10
dhcp-boot=#TODO，见后文

# enable tftp
enable-tftp
tftp-root=/data/pxeboot
```

## HTTP服务器搭建

最方便的方法就是使用Docker进行部署，可以参考[使用Docker搭建HFS](/Docker/使用Docker搭建HFS/)

```bash
docker run -dit \
  --name hfs -p 80:80 \
  --restart unless-stopped \
  -v /root/hfs:/usr/local/apache2/htdocs/ \
  httpd:2.4
```

## Legacy模式启动Centos7.9

首先！上面的`dhcp-boot`字段需要填入`legacy/undionly.kpxe`

然后`docker restart dnsmasq`来重启生效

### 编译`undionly.kpxe`

```
cd /root/dnsmasq/pxeboot/prepare/legacy
git clone git://git.ipxe.org/ipxe.git
cd ipxe/src
vim embed.ipxe
```

写入如下内容：

```
#!ipxe
dhcp
chain tftp://${next-server}/menu.ipxe
```

其中 `${next-server}` 会自动解析为 dhcp 服务器的地址，tftp 也搭建在这个地址上。当通过 dhcp 获取到IP地址后，通过 tftp 协议请求 `menu.ipxe` 文件，然后 ipxe 会解析和执行文件里的内容，这个文件可以说就是 ipxe 的配置文件了。接着编译出 undionly.kpxe，这样 undionly.kpxe 才会默认就加载同目录下的 menu.ipxe 文件了。

```
make bin/undionly.kpxe EMBED=embed.ipxe
cp bin/undionly.kpxe /root/dnsmasq/pxeboot/
```

其中编译步骤需要 `lzma.h` 这个头文件，需要安装你的发行版上提供这个头文件的软件包。编译好的 `undionly.kpxe` 可以保存下来下次搭建环境的时候直接用，如果服务是搭建在 Windows 系统上也可以使用这个编译好的文件。

然后编辑 `menu.ipxe` 文件，配置接下来的文件都通过 http 协议来访问，并且链接到 pxelinux.0。

```
vim /root/dnsmasq/pxeboot/menu.ipxe
```

写入如下内容：

```
#!ipxe
set 210:string http://192.168.4.9/pxefiles/pxelinux
set 209:string pxelinux.cfg/default
chain ${210:string}pxelinux.0
```

其中 `set 210:string` 定义了请求的文件的主目录，因为之前创建的 `/root/hfs/` 为 http 的根目录，`/root/hfs/pxefiles/` 目录中存放 pxelinux.0 相关的数据文件。
`set 209:string` 则定义了 pxelinux.0 直接加载 `pxelinux.cfg/default` 这个配置文件，否则 pxelinux.0 会阶梯性的查找配置文件，如果都没找到最后默认才加载 `pxelinux.cfg/default`。

### 安装 pxelinux.0 引导文件

接下来的操作就是在 `/root/hfs/pxefiles/` 目录下进行了，因为 `ipxe` 启动后剩下的文件都是通过 http 协议访问的。

pxelinux.0 可以通过发行版的 `syslinux` 包来获取，或者自己从官方下载也可，这里采用从官方下载的方式。

```
cd /root/hfs/pxefiles/pxelinux/prepare
wget https://mirrors.edge.kernel.org/pub/linux/utils/boot/syslinux/Testing/3.86/syslinux-3.86-pre4.tar.xz
tar xf syslinux-3.86-pre4.tar.xz
cd syslinux-3.86-pre4
cp com32/menu/vesamenu.c32 /root/hfs/pxefiles/pxelinux/
cp core/pxelinux.0 /root/hfs/pxefiles/pxelinux/
cp memdisk/memdisk /root/hfs/pxefiles/pxelinux/
```

syslinux 最新版是16年发布的 6.04，但是使用中发现无法引导 ESXI，而且 pxelinux.0 引导后还要加载好几个 `.c32` 文件，所以采用老一点的 3.86 版本。 接着给 pxelinux.0 提供配置文件

```
cd /root/hfs/pxefiles/pxelinux/
mkdir pxelinux.cfg
vim pxelinux.cfg/default
```

写入以下内容：

```
default vesamenu.c32
timeout 300

menu title Welcome to PXE server!
menu color border 0 #ffffffff #00000000
menu color sel 7 #ffffffff #ff000000
menu color title 0 #ffffffff #00000000
menu color tabmsg 0 #ffffffff #00000000
menu color unsel 0 #ffffffff #00000000
menu color hotsel 0 #ff000000 #ffffffff
menu color hotkey 7 #ffffffff #ff000000
menu color scrollbar 0 #ffffffff #00000000

label local
    menu label Boot from local drive
    menu default
    localboot 0xffff

label centos7.9
    menu label CentOS7.9
    kernel http://192.168.4.9/pxefiles/centos7.9/images/pxeboot/vmlinuz
    append initrd=http://192.168.4.9/pxefiles/centos7.9/images/pxeboot/initrd.img ks=http://192.168.4.9/pxefiles/centos7.9/ks-minimal-vmware.cfg
```

其中 `timeout 300` 会在引导界面30秒无操作就就启动下面 `label` 中定义为 `menu default` 的条目。到这一步已经可以尝试将虚拟机或者主机通过 PXE 启动，看看是否可以加载出引导界面了。

### 准备Centos7.9镜像

首先将系统iso镜像中的全部问价复制到`/root/hfs/pxefiles/centos7.9`

然后准备文件`vim /root/hfs/pxefiles/centos7.9/ks-minimal-vmware.cfg `来配置镜像地址

```
url --url http://192.168.4.9/pxefiles/centos7.9/
```

如果需要无人值守的自动安装系统，可以看别的教程如何配置`ks-minimal-vmware.cfg`

### 小结

总结一下从头到尾读取的文件为：

- (tftp)`/root/dnsmasq/pxeboot/legacy/undionly.kpxe`
- (tftp)`/root/dnsmasq/pxeboot/legacy/menu.ipxe`
- `http://192.168.4.9/pxefiles/pxelinux/{pxelinux.0, memdisk, vesamenu.c32}`
- `http://192.168.4.9/pxefiles/pxelinux/pxelinux.cfg/default`
- `http://192.168.4.9/pxefiles/centos7.9/images/pxeboot/{vmlinuz, initrd.img}`
- `http://192.168.4.9/pxefiles/centos7.9/ks-minimal-vmware.cfg`
- `http://192.168.4.9/pxefiles/centos7.9/*`(正式启动镜像)

## UEFI模式启动Centos7.9

首先！上面的`dhcp-boot`字段需要填入`shim.efi`

然后`docker restart dnsmasq`来重启生效

### 准备启动文件

需要从Centos7.9镜像文件中提取`shim.efi`和`grubx64.efi`两个文件

```bash
mount -t iso9660 /path_to_image/name_of_image.iso /mount_point -o loop,ro
cp /mount_point/Packages/shim-version-architecture.rpm /root/dnsmasq/pxeboot/uefi/centos7.9/prepare
cp /mount_point/Packages/grub2-efi-version-architecture.rpm /root/dnsmasq/pxeboot/uefi/centos7.9/prepare
umount /mount_point
cd /root/dnsmasq/pxeboot/uefi/centos7.9/prepare
rpm2cpio shim-version-architecture.rpm | cpio -dimv
rpm2cpio grub2-efi-version-architecture.rpm | cpio -dimv
cp boot/efi/EFI/redhat/shim.efi /root/dnsmasq/pxeboot/
cp boot/efi/EFI/redhat/grubx64.efi /root/dnsmasq/pxeboot/
```

这个地方让我有点强迫症的是`grubx64.efi`的文件位置必须放在根目录下，后面的`grub.cfg`也是

### 准备启动项文件

编辑`/root/dnsmasq/pxeboot/grub.cfg`

```cfg
set timeout=60
menuentry 'CentOS' {
  linuxefi uefi/centos7.9/vmlinuz ip=dhcp inst.repo=http://192.168.4.9/pxefiles/centos7.9/
  initrdefi uefi/centos7.9/initrd.img
}
```

### 小结

总结一下从头到尾读取的文件为：

- (tftp)`/root/dnsmasq/pxeboot/shim.efi`
- (tftp)`/root/dnsmasq/pxeboot/grubx64.efi`
- (tftp)`/root/dnsmasq/pxeboot/grub.cfg`
- (tftp)`/root/dnsmasq/pxeboot/uefi/{vmlinuz,initrd.img}`
- `http://192.168.4.9/pxefiles/centos7.9/*`(正式启动镜像)

## 启动一个完整的系统

如果你像我一样有这样的特殊需求：需要使用10台服务器做实验，但是一台台配环境太麻烦（每一台的系统都经过许多人的蹂躏，环境很坑），于是配好了一台服务器的环境（或者说得到特许重装了一台的系统），于是剩下9台可以通过网络启动的方式直接拉取现有这一台上的系统，于是就得到了10台一模一样的环境，并且还不影响其他9台服务器上现有的环境（因为用网络启动直接把整个操作系统装入内存，不使用硬盘，别人要使用的时候直接恢复从硬盘启动即可）。
