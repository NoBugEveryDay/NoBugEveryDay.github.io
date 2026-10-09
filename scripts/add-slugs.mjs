#!/usr/bin/env node
/**
 * 一次性脚本：为全部公开博文注入英文扁平 slug（用户要求：URL 全部由可直接读取的字符组成）。
 * 规则：小写字母/数字/连字符；全局唯一；显示标题不变。
 * slug 存于 front-matter 的 slug 字段；URL = /<slug>/（扁平，不含分类路径）。
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const POSTS = path.resolve('src/content/posts');

// relpath（相对 src/content/posts）→ slug
const SLUGS = {
  'Linux/操作技巧/Linux bash Shell特殊变量.md': 'linux-bash-shell-special-variables',
  'Linux/操作技巧/Linux分区删除后恢复.md': 'recover-deleted-linux-partition',
  'Linux/操作技巧/Linux挂载硬盘.md': 'mount-new-disk-on-linux',
  'Linux/操作技巧/Linux操作小技巧汇总.md': 'linux-tips-collection',
  'Linux/操作技巧/Linux时间同步.md': 'linux-time-sync',
  'Linux/操作技巧/tmux常用操作.md': 'tmux-common-operations',
  'Linux/操作技巧/修改ssh登陆端口.md': 'change-ssh-port',
  'Linux/安装教程/CentOS编译安装GCC.md': 'build-gcc-from-source-on-centos',
  'Linux/安装教程/Docker安装教程.md': 'docker-install-guide',
  'Linux/安装教程/Modules安装教程.md': 'install-environment-modules',
  'Linux/安装教程/在Linux上使用Onedrive.md': 'use-onedrive-on-linux',
  'Linux/安装教程/安装OneAPI-2023.2.0的一点记录.md': 'install-intel-oneapi-2023',
  'Linux/CentOS/CentOS安装MySQL5.7.md': 'install-mysql57-on-centos',
  'Linux/CentOS/CentOS开机自动连接WiFi并固定地址.md': 'centos-auto-connect-wifi',
  'Linux/CentOS/CentOS挂载本地everything源.md': 'centos-local-everything-repo',
  'Linux/CentOS/CentOS设置开机启动脚本.md': 'centos-startup-scripts',
  'Linux/CentOS/Centos离线安装软件包.md': 'centos-offline-package-install',
  'Linux/CentOS/在CentOS7.6上为网卡BCM43228安装驱动.md': 'bcm43228-driver-centos7',
  'Linux/配置方法/SR-IOV配置方法.md': 'sr-iov-configuration',
  'Linux/配置方法/使用Spack配置环境.md': 'spack-environment-setup',
  'Linux/配置方法/硬盘加密挂载.md': 'encrypted-disk-mount',
  'Linux/Ubuntu/Perl正则表达式错误解决.md': 'fix-perl-regex-error',
  'Linux/Ubuntu/Ubuntu18.04安装MySQL.md': 'install-mysql-ubuntu1804',
  'Linux/Ubuntu/apt常用命令.md': 'apt-common-commands',
  'Linux/Ubuntu/缺少Perl module LibXML的解决方法.md': 'fix-missing-perl-libxml',
  'Linux/Compilation/How_to_link_Intel_MKL_FFT_Library.md': 'link-intel-mkl-fft',
  'Linux/Namespace/Linux Namespace IPC.md': 'linux-namespace-ipc',
  'Linux/Namespace/Linux Namespace Mount.md': 'linux-namespace-mount',
  'Linux/Namespace/Linux Namespace Network.md': 'linux-namespace-network',
  'Linux/Namespace/Linux Namespace PID.md': 'linux-namespace-pid',
  'Linux/Namespace/Linux Namespace UTS.md': 'linux-namespace-uts',
  'Linux/Namespace/Linux Namespace User.md': 'linux-namespace-user',
  'Linux/Namespace/Linux Namespace 简介.md': 'linux-namespace-intro',
  '旅游/南澳旅游计划.md': 'nanao-travel-plan',
  'Confluence/使用Docker安装Confluence.md': 'confluence-docker-deploy',
  'Research/Allreduce算法调研.md': 'allreduce-algorithms-survey',
  'Research/OpenSHMEM的一点调研.md': 'openshmem-notes',
  'Research/ROSS入门指北.md': 'ross-simulator-guide',
  'Research/RoCE在HPC中的应用分析.md': 'roce-in-hpc-analysis',
  'Research/SST是个啥？.md': 'what-is-sst',
  '其他/LibreELEC踩坑记录.md': 'libreelec-notes',
  '其他/Lingo学习笔记.md': 'lingo-notes',
  '论文研读/TupleQ：Fully-Asynchronous and Zero-Copy MPI over InfiniBand.md': 'tupleq-paper-reading',
  '论文研读/如何在Word中添加参考文献.md': 'add-references-in-word',
  '论文研读/操作系统虚拟化的研究现状与展望.md': 'os-virtualization-survey',
  '论文研读/胖树拓扑结构下路由算法学习.md': 'fat-tree-routing',
  'Benchmark/NUMA中的单双核绑定问题.md': 'numa-core-binding',
  'Benchmark/SSD测试记录.md': 'ssd-benchmark-notes',
  'Benchmark/【转】HPCG 3.0 reference implementation 阅读笔记.md': 'hpcg-reference-implementation-notes',
  'Benchmark/内存带宽计算.md': 'memory-bandwidth-calc',
  'Benchmark/在25G以太网环境下使用Perftest对RoCEv2性能进行测试.md': 'rocev2-perftest-25g',
  'Benchmark/在25G以太网环境下使用iperf3进行性能测试.md': 'iperf3-25g-test',
  'Benchmark/如何实现纳秒级计时.md': 'nanosecond-timing',
  'Benchmark/如何计算CPU算力理论峰值.md': 'cpu-peak-performance',
  'Benchmark/如何进行HPCC测试.md': 'hpcc-benchmark',
  'Benchmark/如何进行HPCG测试.md': 'hpcg-benchmark',
  'Benchmark/如何进行HPL测试.md': 'hpl-benchmark',
  'Benchmark/如何进行NPB测试.md': 'npb-benchmark',
  'Benchmark/如何进行mpiGraph测试.md': 'mpigraph-benchmark',
  'Benchmark/如何进行stream测试.md': 'stream-benchmark',
  'Tools/CMakeLists.txt编写指北.md': 'cmakelists-guide',
  'Tools/C与CPP混编.md': 'c-cpp-mixed-programming',
  'Tools/Doxygen入门指北.md': 'doxygen-guide',
  'Tools/git小技巧.md': 'git-tips',
  'Tools/vscode编辑Markdown配置方法.md': 'vscode-markdown-setup',
  'RoCE/Intel MPI使用RoCEv2协议的方法.md': 'intel-mpi-rocev2',
  'RoCE/Mellanox SN2410交换机RoCE协议配置.md': 'mellanox-sn2410-roce-config',
  'RoCE/Mvapich使用RoCEv2协议的方法.md': 'mvapich-rocev2',
  'RoCE/OpenMPI使用RoCEv2的方法.md': 'openmpi-rocev2',
  'Hardware/OCP_3.0_NIC.md': 'ocp3-nic',
  'MPI/MPI_Gather延迟测试中的断层问题现象研究.md': 'mpi-gather-latency-gap',
  'MPI/MPI的各种Send.md': 'mpi-send-variants',
  'MPI/Intel MPI/I_MPI_FABRICS.md': 'intel-mpi-fabrics-env',
  'MPI/Intel MPI/Intel MPI 常用技巧.md': 'intel-mpi-tips',
  'MPI/Intel MPI/Intel Parallel Studio只加载icc等非mpi编译指令.md': 'intel-parallel-studio-icc-only',
  'MPI/Intel MPI/使用APS快速获取程序性能瓶颈.md': 'intel-aps-profiling',
  'MPI/UCX/UCX测试方法.md': 'ucx-testing',
  'MPI/OpenMPI/OpenMPI1.10.7+Intel2018u4安装.md': 'install-openmpi-1-10-7',
  'MPI/OpenMPI/OpenMPI安装教程.md': 'install-openmpi',
  'MPI/OpenMPI/OpenMPI常用技巧.md': 'openmpi-tips',
  'MPI/OpenMPI/OpenMPI相关论文.md': 'openmpi-papers',
  'MPI/Mpich/Mpich常用技巧.md': 'mpich-tips',
  'MPI/Mvapich/Mvapich安装教程.md': 'install-mvapich',
  'MPI/Mvapich/Mvapich常用技巧.md': 'mvapich-tips',
  'WordPress/WordPress安装教程.md': 'install-wordpress',
  'WordPress/WordPress页无法显示的解决办法.md': 'fix-wordpress-blank-page',
  'WordPress/初写博客踩的一些坑.md': 'early-blogging-pitfalls',
  'WordPress/去除页脚“自豪地采用WordPress”.md': 'remove-wordpress-footer-credit',
  'Hexo/Hexo美化设置.md': 'hexo-theme-customization',
  'Hexo/使用DOCKER部署HEXO.md': 'deploy-hexo-with-docker',
  'Hexo/使用Docker部署Hexo5.2.md': 'deploy-hexo5-2-with-docker',
  '网络/Dragonfly拓扑相关研究工作.md': 'dragonfly-topology-research',
  '网络/Dragonfly拓扑简介.md': 'dragonfly-topology-intro',
  '网络/Slimfly拓扑学习指引.md': 'slimfly-topology-guide',
  '网络/Virtual Channel与Flow Control与Deadlock.md': 'virtual-channel-flow-control-deadlock',
  '网络/为Win10远程桌面添加SSL证书.md': 'rdp-ssl-certificate',
  '网络/使用acme.sh配置https加密.md': 'acme-sh-https',
  '网络/其他/使用Proxychains为命令行翻墙.md': 'proxychains-cli-proxy',
  '网络/路由器/OpenWrt/OpenWrt制作本地源.md': 'openwrt-local-repo',
  '网络/路由器/OpenWrt/解决Openwrt无法解析局域网内域名的问题.md': 'openwrt-lan-dns-issue',
  'Docker/Docker代理配置.md': 'docker-proxy-setup',
  'Docker/Docker基础命令.md': 'docker-basic-commands',
  'Docker/Docker网络配置.md': 'docker-network-config',
  'Docker/iptables-F引发的Docker联网问题.md': 'docker-iptables-f-issue',
  'Docker/使用Docker安装Transmission.md': 'docker-transmission',
  'Docker/使用Docker安装frp.md': 'docker-frp',
  'Docker/使用Docker安装openssh.md': 'docker-openssh',
  'Docker/使用Docker安装qBittorrent.md': 'docker-qbittorrent',
  'Docker/使用Docker搭建FTP.md': 'docker-ftp-server',
  'Docker/使用Docker搭建HFS.md': 'docker-hfs',
  'Docker/使用Docker搭建ShareLatex.md': 'docker-sharelatex',
  'Docker/使用Docker自建DNS服务器.md': 'docker-dns-server',
  'Docker/使用Docker部署Prometheus+Grafana监控.md': 'docker-prometheus-grafana',
  'Docker/使用Docker配置WOL(Wake On Lan)服务.md': 'docker-wol-service',
  'Docker/使用Docker配置反向代理.md': 'docker-reverse-proxy',
  'Docker/修改Docker镜像存放位置.md': 'change-docker-image-location',
  'Docker/如何使用Docker配置PXE网络启动.md': 'docker-pxe-boot',
  'Docker/如何用将Linux上的影视资源共享给小米电视.md': 'share-linux-media-to-mi-tv',
};

const errors = [];
const used = new Map();

// 校验字符集与唯一性
for (const [rel, slug] of Object.entries(SLUGS)) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) errors.push(`slug 含非法字符: ${rel} -> ${slug}`);
  if (used.has(slug)) errors.push(`slug 重复: ${slug}（${used.get(slug)} 与 ${rel}）`);
  used.set(slug, rel);
}

// 校验映射覆盖所有 md
const allFiles = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) walk(abs);
    else if (e.name.endsWith('.md')) allFiles.push(path.relative(POSTS, abs));
  }
})(POSTS);
const missing = allFiles.filter((f) => !(f in SLUGS));
const extra = Object.keys(SLUGS).filter((f) => !allFiles.includes(f));
if (missing.length) errors.push(`映射缺失: ${missing.join(', ')}`);
if (extra.length) errors.push(`映射多余: ${extra.join(', ')}`);

if (errors.length) {
  console.error('❌ 校验失败:');
  errors.forEach((e) => console.error('  -', e));
  process.exit(1);
}

// 注入 slug
for (const [rel, slug] of Object.entries(SLUGS)) {
  const file = path.join(POSTS, rel);
  const raw = fs.readFileSync(file, 'utf8');
  const parsed = matter(raw);
  if (parsed.data.slug && parsed.data.slug !== slug) {
    console.warn(`[warn] 覆盖已有 slug: ${rel}: ${parsed.data.slug} -> ${slug}`);
  }
  parsed.data.slug = slug;
  // 固定字段顺序：title, date, slug, categories, tags, 其余
  const fm = { title: parsed.data.title, date: parsed.data.date, slug, categories: parsed.data.categories, tags: parsed.data.tags };
  for (const [k, v] of Object.entries(parsed.data)) {
    if (!(k in fm)) fm[k] = v;
  }
  const out = matter.stringify(parsed.content, fm).trimEnd() + '\n';
  fs.writeFileSync(file, out);
}

console.log(`✔ 已为 ${Object.keys(SLUGS).length} 篇公开博文注入英文 slug`);
