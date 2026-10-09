---
title: C与CPP混编
date: 2021-10-14T00:00:00.000Z
slug: c-cpp-mixed-programming
categories:
  - Tools
tags:
  - 混编
---
## 摘要

今天遇到了C与C++混编的问题，需要在C中调用C++的函数，研于是研究了一番，最后感谢hyh和lhh大佬的指点。

<!-- more --> 

简单来说就是在需要被C调用的CPP的函数的头文件**声明**`my_func.h`中添加编译成C的指令

```cpp
#ifdef __cplusplus
extern "C"{
#endif

int my_func(int a);

#ifdef __cplusplus
}
#endif
```

这样这个头文件在被`*.cpp`文件include的时候，就会自动将这个函数声明为C的函数，在被`*.c`文件include的时候则不会做别的特殊处理

在函数定义的时候也要`#include "my_func.h"`，而在定义的时候不用再添加`extern "C"`，因为已经声明过这个函数的入口要被编译成C的格式，并且在这个函数的内部还是可以使用C++的语法。
