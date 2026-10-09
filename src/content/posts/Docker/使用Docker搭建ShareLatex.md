---
title: 使用Docker搭建ShareLatex
date: 2021-04-12T00:00:00.000Z
slug: docker-sharelatex
categories:
  - Docker
tags:
  - Docker
  - ShareLatex
---
## 摘要

本文介绍如何使用Docker搭建自己的ShareLatex平台，以及Latex的基本语法。

<!-- more --> 

## 简介

有时候处于一定的保密目的，不希望把自己的论文放在公共平台上，所以有一个自己的类似overleaf的平台来进行latex写作并与他人协作，就很有必要了。

## 搭建ShareLatex

### 基础搭建

完全参照这个教程做即可https://github.com/overleaf/overleaf/wiki/Quick-Start-Guide

针对`docker exec sharelatex tlmgr install scheme-full`太慢的问题，可以更换镜像，更换清华源镜像使用如下命令

```bash
docker exec sharelatex tlmgr install scheme-full
```

### 设置SMTP自动发邮件

这里我是用QQ企业邮箱来发送邮件的（QQ邮箱同理）

修改`docker-compose.yml`中的如下环境变量

```
SHARELATEX_EMAIL_FROM_ADDRESS: "[要用来发送邮件的邮箱]"

SHARELATEX_EMAIL_SMTP_HOST: smtp.exmail.qq.com
SHARELATEX_EMAIL_SMTP_PORT: 465
SHARELATEX_EMAIL_SMTP_SECURE: 'true'
SHARELATEX_EMAIL_SMTP_USER: [要用来发送邮件的邮箱]
SHARELATEX_EMAIL_SMTP_PASS: [要用来发送邮件的邮箱的密码，注意是QQ邮箱帮你自动生成的那个]
SHARELATEX_EMAIL_SMTP_TLS_REJECT_UNAUTH: 'true'
SHARELATEX_EMAIL_SMTP_IGNORE_TLS: 'false'
```

设置好了必须把容器彻底删了再重启才能生效，可以在`http://ip:port/launchpad`中测试

### 设置反向代理

参考https://github.com/overleaf/overleaf/wiki/HTTPS-reverse-proxy-using-Nginx

如果反向代理没有设置好，会出现shatelatex中的项目打不开的问题。官方建议是用的是Nginx的反向代理

```
server {
    listen 443 ssl;
    server_name sharelatex.hpclab.tech;
    ssl_certificate /root/ssl/sharelatex.hpclab.tech/pem;
    ssl_certificate_key /root/ssl/sharelatex.hpclab.tech/key;

    ssl_protocols               TLSv1 TLSv1.1 TLSv1.2;
    ssl_prefer_server_ciphers   on;

    # used cloudflares ciphers https://github.com/cloudflare/sslconfig/blob/master/conf
    ssl_ciphers                 EECDH+CHACHA20:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5;

    # config to enable HSTS(HTTP Strict Transport Security) https://developer.mozilla.org/en-US/docs/Security/HTTP_Strict_Transport_Security
    # to avoid ssl stripping https://en.wikipedia.org/wiki/SSL_stripping#SSL_stripping	
    add_header Strict-Transport-Security "max-age=31536000; includeSubdomains;";

    server_tokens off;

    add_header X-Frame-Options SAMEORIGIN;

    add_header X-Content-Type-Options nosniff;

    client_max_body_size 50M;

    location / {
        proxy_pass http://192.168.1.2:8888; # change to whatever host/port the docker container is listening on.
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 3m;
        proxy_send_timeout 3m;
    }
}
```

### 增加字体

参考 https://www.ivdone.cn/article/296.html

新建一个文件夹把你需要的字体放进去，然后在`docker-compose.yml`中将这个文件夹挂载到`sharelatex`容器中对应地方

```
/ssd-raid/sharelatex/data/my_fonts:/usr/share/fonts/my_fonts
```

然后需要删除实例，重建实例

一个推荐的方法是使用`fontset=adobe`，然后下载如下字体

```
wget https://cs.fit.edu/code/projects/ndworld/repository/revisions/12/raw/Resources/Fonts/AdobeSongStd-Light.otf
wget https://cs.fit.edu/code/projects/ndworld/repository/revisions/12/raw/Resources/Fonts/AdobeHeitiStd-Regular.otf
wget https://cs.fit.edu/code/projects/ndworld/repository/revisions/12/raw/Resources/Fonts/AdobeKaitiStd-Regular.otf
wget https://cs.fit.edu/code/projects/ndworld/repository/revisions/11/raw/Resources/Fonts/AdobeFangsongStd-Regular.otf
# 更多字体可以访问https://cs.fit.edu/code/projects/ndworld/repository/revisions/12/raw/Resources/Fonts/
```

不然会出现`CJK`相关的warning，虽然据说不影响最终效果，但是让人不舒服

## Latex基础语法

把下面这堆东西丢进一个新项目里编译，然后对照着编译出来的和源码学习即可

```latex
% This latex file shows some basic grammar of latex.

% The area before "\begin{document}" is called the preamble. Some definition must be put at here. 

\documentclass{article}
% Define the type of this document, Other types of documents you may be working on may require different classes such as book or report.

\usepackage[utf8]{inputenc}
% This is the encoding for the document. It can be omitted or changed to another encoding but utf-8 is recommended. Unless you specifically need another encoding, or if you are unsure about it, add this line to the preamble.

\title{Basic Latex Grammar}
% The title of this document

\author{Orange666 \thanks{https://sharelatex.hpclab.tech}}
% The author of this document. The "\thanks" will add a superscript and a footnote.

\date{\today}
% You can enter the date manually or use the command \today so the date will be updated automatically at the time you compile your document

\usepackage[colorlinks=true, linkcolor=blue]{hyperref}
% To use href in the document

\usepackage{graphicx}
\graphicspath{ {images/} }
% To insert pictures in document

\begin{document}
% The begin of document.

\maketitle
% Show the title, author and date defined in preamble.

\tableofcontents
% Generate contents automatically

% Abstract
\begin{abstract}
    This document shows the basic use of latex.
\end{abstract}

\section{Paragraphs and newlines}

    When writing the contents of your document, if you need to start a new paragraph you must hit the "Enter" key twice (to insert a blank line between paragraphs). Notice that LATEX automatically indents paragraphs but the first paragraph.
    
    This is paragraphs 1. -------------------------------------------------------------------------------------------------------------------------------------------
    
    This is paragraphs 2. --------------------------------------------------------------------------------------------------------------------------------------------
    
    This is paragraphs 3. --------------------------------------------------------------------------------------------------------------------------------------------
    
    You can insert a \textbackslash newline or \textbackslash \textbackslash \space in one code line, \newline to get a new line \\ in the same paragraph.

\section{Chapters and Sections}

    The basic levels of depth are listed in table \ref{table:Section Levels}.
    
    \begin{table}[h]
        \centering
        % Let the table appear in the center of the page.
        \caption{Section Levels}
        \label{table:Section Levels}
        \begin{tabular}{|r|l|}
            \hline
            \textbf{Level} & \textbf{Grammar}                               \\ \hline
            -1             & \textbackslash{}part\{part\_name\}             \\ \hline
            0              & \textbackslash{}chapter\{chapter\_name\}       \\ \hline
            1              & \textbackslash{}section\{section\}             \\ \hline
            2              & \textbackslash{}subsection\{subsection\}       \\ \hline
            3              & \textbackslash{}subsubsection\{subsubsection\} \\ \hline
            4              & \textbackslash{}paragraph\{paragraph\}         \\ \hline
            5              & \textbackslash{}subparagraph\{subparagraph\}   \\ \hline
        \end{tabular}
    \end{table}
    
    Note that \textbackslash part and \textbackslash chapter are only available in report and book document classes.
    
    Section numbering is automatic and can be disabled by including a * in the section command as \textbackslash section*\{\}.
    

\section{List}

    \subsection{Unordered Lists}
    
        \begin{itemize}
            \item ----------------------------------------------------
            \item ----------------------------------------------------
            \item ----------------------------------------------------
        \end{itemize}
    
    \subsection{Ordered Lists}
    
    \begin{enumerate}
        \item This is the first entry in our list
        \item The list numbers increase with each entry we add
    \end{enumerate}
    
\section{Bold, italics and underlining}
    
    This section shows how to make letters Bold, italics and underlining.
    
    \textbf{Bold text in LaTeX is written with the $\backslash textbf\{...\}$ command.}
    
    \textit{Italics: Italicised text in LaTeX is written with the $\backslash textit\{...\}$ command.}
    
    \underline{Underline: Underlined text in LaTeX is written with the $\backslash underline\{...\}$ command.}

\section{Adding Images}
    On Overleaf, you will first have to upload the images. The below figure \ref{fig:xipian} at page \pageref{fig:xipian} is an example on how to include a picture.
    \begin{figure}[h]
        \centering
        \includegraphics[width=0.25\textwidth]{xipian.jpg}
        \caption{An figure example}
        \label{fig:xipian}
    \end{figure}
    There are three important commands in the example:
    \begin{itemize}
        \item \textbackslash caption\{...\}: Sets the caption for the figure. You can place it above or below the figure.
        \item \textbackslash label\{fig:...\}: If you need to refer the image within your document, set a label with this command. The label will number the image, and combined with the next command will allow you to reference it.
        \item \textbackslash ref\{fig:...\}: This code will be substituted by the number corresponding to the referenced figure.
    \end{itemize}

\section {Adding Table}
    This table \ref{table:Example of Table} shows how to make a table. Many attributes is similar to images.
    
    \begin{table}[h]
        \centering
        % Let the table appear in the center of the page.
        \begin{tabular}{ c c c }
        % Start of the table. Declare that there are three columns in this table
         cell 1,1 & cell 1,2 & cell 1,3 \\ 
         cell 2,1 & cell 2,2 & cell 2,3 \\  
         cell 3,1 & cell 3,2 & cell 3,3
        \end{tabular}
        \caption{Example of Table}
        \label{table:Example of Table}
    \end{table}
    For convenient, just use \href{https://www.tablesgenerator.com/}{tables generator} to generate tables automatically.
    
\section*{Reference}

\end{document}
```

## 一些debug记录

- `'h' float specifier changed to 'ht'`

一般出现在使用了`\begin{table}[h]`的地方，但是warning不会准确地定位其所在位置，需要自己找到，并修改为`\begin{table}[H]`
