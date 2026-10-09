---
title: CMakeLists.txt编写指北
date: 2021-08-18T00:00:00.000Z
slug: cmakelists-guide
categories:
  - Tools
tags:
  - Cmake
---
## 简介

CMake是一款在大型项目中常用的跨平台编译构建工具，如果只是使用别人项目中已经部署好的CMake，其实很容易。但是如果想要在自己的项目中使用CMake，说实话我并没有找到讲得非常贴合我的需求的教程，因为它们大多都讲得比较浅（因为我之所以想使用CMake就是因为我的项目有一点点复杂，简单的教程并不能覆盖我的需求）。本文假设你已经有非常扎实的编译链库基础，**并且了解CMake的简单使用**，主要讲解CMake中一些常用的函数及变量。

<!-- more --> 

个人觉得这个CMake它到底难在哪呢？在网上找到的教程大多都比较基础，想要实现比较复杂的功能的话就不知道从何下手了，其实大部分想要实现的功能都能通过调用CMake的函数，以及设置CMake中的变量，但是想要在找到这些函数和变量并且正确的使用其实并不容易，所以本文其实是记录我在编写`CMakeLists.txt`时使用到的函数以及变量。

## CMake的思想

相比起Makefile要为代码文件编写具体的编写指令，CMake更像是一个聪明的秘书，你需要告诉她：

- 你要编译得到哪些目标（可执行文件和库）？
- 每个目标是由哪些代码文件编译出来？
- 每个目标需要哪些头文件？这些头文件在哪些文件夹中？
- 每个目标需要链哪些库？这些库在哪里？

然后CMake会为你自动生成Makefile，这是最方便的一点；但这也是最不方便的一点，因为你当然要用CMake能看懂的方式去告诉她这些东西，所以你必须学习CMake的语法，这并不容易。

## 常用框架

一般在项目根目录的`CMakeLists.txt`中指定该项目要链接的外部库，在`src`目录及其子目录中的`CMakeLists.txt`指定项目中各个文件夹之间、各个代码文件之间的关系，但`include`目录下并不需要`CMakeLists.txt`。一个例子如下所示：

```
├── CMakeLists.txt
├── README.md
├── include
│   ├── helper.h
│   └── map.h
├── src
│   ├── CMakeLists.txt
│   ├── module
│   │   ├── CMakeLists.txt
│   │   ├── link
│   │   │   ├── CMakeLists.txt
│   │   │   └── link.c
│   │   └── useless
│   │       ├── CMakeLists.txt
│   │       └── useless.c
│   └── map.c
└── build
```

## 常用函数

*注意：下面的介绍中省略了一些我觉得一般不会用到的功能及参数，详情参考官方文档*

### 最小版本要求

```cmake
cmake_minimum_required(VERSION 3.14)
```

一般放在`CMakeLists.txt`的第一行。因为CMake在版本迭代的过程中逐渐添加了许多新功能，许多功能都是在新版本功能中才支持的，建议将你正在使用的CMake的版本放在这里。当然如果你需要使用别人项目的CMake提示你版本过低，你也可以改别人这一行代码，因为别人要求的CMake版本要求可能在虚张声势。

### 指定项目名称

```cmake
project(<PROJECT-NAME> [<language-name>...])
project(My_Project C)
```

- `<PROJECT-NAME>`：指定你这个项目的名字，并且会被存在变量`PROJECT_NAME`中，如果当前`CMakeLists.txt`是最顶层的，那么还会被存在变量`CMAKE_PROJECT_NAME`中

- `<language-name>`：指定你这个项目中使用的语言，目前支持 `C`, `CXX` , `CUDA`, `OBJC` (i.e. Objective-C), `OBJCXX`, `Fortran`, `HIP`, `ISPC`, and `ASM`. 默认 `C`, `CXX` 是enable的。

### 添加子文件夹

```cmake
add_subdirectory(source_dir [binary_dir] [EXCLUDE_FROM_ALL])
```

- `source_dir`：要添加的文件夹名，里面应该也有一个`CMakeLists.txt`
- `[binary_dir]`：指定这个文件夹中编译出来的二进制文件放在哪，是现在已经指定的输出位置的相对位置
- `[EXCLUDE_FROM_ALL]`：将这个文件夹视为一次独立的CMake调用，也就是说相当于手动进入这个文件夹调用了一次CMake

### 引入模块

```cmake
include(<module>)
include(CheckIncludeFile)
include(CheckLibraryExists)
```

在CMake中的include并不表示包含某个文件夹，而是引入某个模块，要引入了一些指定模块之后才能调用一些模块中的函数

### 设置变量

```cmake
set(<variable> <value>... [PARENT_SCOPE])
set(UTILS_SRC ${UTILS_SRC} ${LOCAL_SRC} PARENT_SCOPE)
```

将变量名为`<variable>`的变量的值设置为`<value>...`， `<value>...`表示可以有放入多个值，如果要引用其他变量，使用`${<variable>}`即可。

这里顺便就能讲一下CMake中变量的作用域：①在父`CMakeLists.txt`中设置的变量，能传递给子`CMakeLists.txt`使用；②在子`CMakeLists.txt`中设置的变量不能改变父`CMakeLists.txt`中的变量，除非在子`CMakeLists.txt`中使用`set`时加上了`PARENT_SCOPE`选项，但是注意此时并没有改变子`CMakeLists.txt`作用域中该变量的值。

一个常见的场景就是有一些嵌套文件夹，每个文件夹内都有一些待编译的文件，如下所示

```
a_dir
├── CMakeLists.txt
├── a.cpp
└── b_dir
    ├── CMakeLists.txt
    ├── b.cpp
    └── c_dir
        ├── CMakeLists.txt
        ├── c.cpp
        └── d_dir
            ├── CMakeLists.txt
            └── d.cpp
```

现在我们想要把这4个代码文件编译到一起，那么这四个`CMakeLists.txt`应该如下

```cmake
# a_dir CMakeLists.txt
cmake_minimum_required(VERSION 3.14)
project(My_Project CXX)
set(SRC_FILES a.cpp)
add_subdirectory(b_dir)
message(STATUS “SRC_FILES=${SRC_FILES}”)
add_executable(executable ${SRC_FILES})

# b_dir CMakeLists.txt
add_subdirectory(c_dir)
set(SRC_FILES ${SRC_FILES} ${CMAKE_CURRENT_SOURCE_DIR}/b.cpp PARENT_SCOPE)

# c_dir CMakeLists.txt
add_subdirectory(d_dir)
set(SRC_FILES ${SRC_FILES} ${CMAKE_CURRENT_SOURCE_DIR}/c.cpp PARENT_SCOPE)

# d_dir CMakeLists.txt
set(SRC_FILES ${SRC_FILES} ${CMAKE_CURRENT_SOURCE_DIR}/d.cpp PARENT_SCOPE)
```

要注意上面代码中的两个细节：

1. 在`a_dir`中，先创建了变量`SRC_FILES`，然后再`add_subdirectory(b_dir)`
2. 在`b_dir`和`c_dir`，都是先`add_subdirectory`，然后再改变变量`SRC_FILES`

### 输出调试

```cmake
message([<mode>] "message text" ...)
```

输出常常可以用来对`CMakeLists.txt`进行调试。其中`[<mode>]`是一个可选项，如果不填就是普通的输出，如果填入以下选项，将有特定功能

- `FATAL_ERROR`：会输出消息，然后停止处理`CMakeLists.txt`，当然也不会生成`Makefile`
- `SEND_ERROR`：会输出消息，但不会停止处理`CMakeLists.txt`，然而不会生成`Makefile`，也就是说如果后面还有其他的ERROR，也可以被输出
- `WARNING`：会输出一个警告消息，**推荐使用这个**
- `STATUS`：会输出一个状态消息

要注意的一点是：如果要输出的是一个有多个元素的数组`set(my_list a b c d)`，如果这样写`message(${my_list})`，会得到各个元素之间会没有间隔的输出`abcd`。如果写成`message("${my_list}")`，就会得到用`;`隔开的输出`a;b;c;d`。也有办法替换为其他分隔符，见https://stackoverflow.com/questions/17666003/cmake-output-a-list-with-delimiters

### 添加 可执行文件 编译目标

```cmake
add_executable(<name> [source...])
```

添加一个名称为`<name>`的 可执行文件 编译**目标**，并指定构成其的源码文件

这里的**目标**即为`<target>`，后文会多次用到

### 添加 库 编译目标

```cmake
add_library(<name> [STATIC | SHARED] [<source>...])
```

添加一个名称为`<name>`的 库 编译目标，并指定构成其的源码文件，以及指定这个库的类型：静态库或者动态库

这里的**目标**即为`<target>`，后文会多次用到

### 添加头文件

#### 为 目标 添加头文件所在文件夹

```cmake
target_include_directories(<target> [AFTER|BEFORE]
  <INTERFACE|PUBLIC|PRIVATE> [items1...]
  [<INTERFACE|PUBLIC|PRIVATE> [items2...] ...])
```

- `<target>`：前文提到的 可执行文件 编译目标，或者 库 编译目标
- `[AFTER|BEFORE]`：在前面添加还是后面，默认在后面加
- `<INTERFACE|PUBLIC|PRIVATE>`：没完全明白啥意思，用`PUBLIC`就对了
- `items`：头文件所在文件夹的路径

如果多次对同一目标调用，会追加而不会覆盖

#### 为 全局所有目标 添加头文件所在文件夹

```cmake
include_directories([AFTER|BEFORE] dir1 [dir2 ...])
```

参数同`target_include_directories`

如果多次对调用，会追加而不会覆盖

### 链库

#### 为 目标 添加 库 所在文件夹

```cmake
target_link_directories(<target> [BEFORE]
  <INTERFACE|PUBLIC|PRIVATE> [items1...]
  [<INTERFACE|PUBLIC|PRIVATE> [items2...] ...])
```

- `<target>`：前文提到的 可执行文件 编译目标，或者 库 编译目标
- `[BEFORE]`：强制在前面添加，默认会在后面添加
- `<INTERFACE|PUBLIC|PRIVATE>`：没完全明白啥意思，用`PUBLIC`就对了
- `items`：库所在文件夹的路径

如果多次对同一目标调用，会追加而不会覆盖

#### 为 全局所有目标 添加库所在文件夹

```cmake
link_directories([AFTER|BEFORE] directory1 [directory2 ...])
```

参数同`target_link_directories`

如果多次对调用，会追加而不会覆盖

#### 为 目标 链库

```cmake
target_link_libraries(<target> ... <item>... ...)
```

- `<target>`：前文提到的 可执行文件 编译目标，或者 库 编译目标
- `<item>`：并没有严格固定的形式，会自动识别，比如：`/usr/lib/libfoo.so`、`foo`、`-lfoo`都是可以的

还有一个类似的语句是↓

```cmake
target_link_options(<target> ... <item>... ...)
```

如果你的`<item>`是`-lfoo`这种，就要注意这个库应该在环境变量`LD_LIBRARY_PATH`中，而不是通过`target_include_directories`和`link_directories`添加的库，因为`-lfoo`会放在链接编译语句的最前面，而`target_include_directories`和`link_directories`添加的库会在链接编译语句的最后面，会找不到库。

#### 为 全局所有目标 链库

```cmake
link_libraries(<item>...)
```

参数同`target_link_libraries`

**注意：如果是链接多个有依赖关系的静态库，注意要前面的依赖后面的，但是link_libraries()不支持指定从前面添加还是后面，所以要小心使用！**

### 添加官方支持的库

在添加一些常用库的时候，例如`MPI`、`OpenMP`的时候，我们可以直接调用官方给的包来完成相应的设置

```cmake
find_package(<PackageName> [REQUIRED])
find_package(MPI REQUIRED)
```

- `<PackageName>`：包的名称，支持的包见官网：https://cmake.org/cmake/help/latest/manual/cmake-modules.7.html#find-modules
- `[REQUIRED]`：是否是必须的，如果是必须的但没有找到，就会报错；如果是可选的，可以通过变量`<PackageName>_FOUND`来查看是否找到了这个包

在找到了对应的包之后，就可以直接调用官方提供的一些变量来进行一些配置，例如在`find_package(MPI REQUIRED)`之后就可以直接使用变量`MPI_C_INCLUDE_PATH`和`MPI_C_LIBRARIES`。具体有什么变量可以用，到前面的官方文档里查一查就好。

### 使用pkg-config添加库

很多库是是支持用pkg-config加载环境和编译选项的，虽然这些库不在CMake的支持中，但是仍然可以利用pkg-config来链库，以fftw3为例

```cmake
find_package(PkgConfig REQUIRED)
pkg_check_modules(FFTW3 REQUIRED fftw3 IMPORTED_TARGET)
target_link_directories(PowerLLEL PRIVATE ${FFTW3_LIBRARY_DIRS})
target_link_libraries(PowerLLEL ${FFTW3_LIBRARIES})
```

在`pkg_check_modules`之后就可以使用如下一些变量来找头文件和链库

```
<XXX>_FOUND
set to 1 if module(s) exist

<XXX>_LIBRARIES
only the libraries (without the '-l')

<XXX>_LINK_LIBRARIES
the libraries and their absolute paths

<XXX>_LIBRARY_DIRS
the paths of the libraries (without the '-L')

<XXX>_LDFLAGS
all required linker flags

<XXX>_LDFLAGS_OTHER
all other linker flags

<XXX>_INCLUDE_DIRS
the '-I' preprocessor flags (without the '-I')

<XXX>_CFLAGS
all required cflags

<XXX>_CFLAGS_OTHER
the other compiler flags
```

### 纯手动添加库

这里以添加`graphviz`库为例

#### 让用户设置的变量

```cmake
set(GVC_INSTALL_PATH "/path/to/graphviz/install" CACHE STRING "Path to the install directory of graphviz")
set(GVC_INCLUDE_PATH ${GVC_INSTALL_PATH}/include/graphviz CACHE STRING "Path to the .h files of graphviz")
set(GVC_LIB_PATH "${GVC_INSTALL_PATH}/lib" CACHE STRING "Path to graphviz lib")
set(GVC_LIB "-lgvc -lcgraph -lcdt -lpathplan" CACHE STRING "Options to link graphviz")
```

通过以上设置可以上用户在执行CMake指令时配置对应的变量，来让CMake找到相应的路径

#### 检查能否找到头文件

```cmake
include(CheckIncludeFile)
list(APPEND CMAKE_REQUIRED_INCLUDES ${GVC_INCLUDE_PATH}) # For later cmake check_include_file
check_include_file(gvc.h GVC_H_EXIST)
if(NOT GVC_H_EXIST)
    message(FATAL_ERROR "gvc.h doesn't exist")
endif()
```

通过以上设置，可以在CMake中检查`gvc.h`头文件是否存在，不存在则报错退出。

注意：

- 这里要把找库的路径添加到`CMAKE_REQUIRED_INCLUDES`中才行
- `check_include_file`这个函数需要`include(CheckIncludeFile)`之后才能使用

#### 检查能否成功链库

```cmake
include(CheckLibraryExists)
list(APPEND CMAKE_REQUIRED_LINK_OPTIONS -L${GVC_LIB_PATH})
list(APPEND CMAKE_REQUIRED_LIBRARIES ${GVC_LIB}) # For later cmake check_library_exists
check_library_exists(gvc gvContext ${GVC_LIB_PATH} GVC_LIB_PATH_EXIST)
if(NOT GVC_LIB_PATH_EXIST)
    message(FATAL_ERROR "GVC lib doesn't exist")
endif()
```

通过以上设置，可以在CMake中检查在链库`-lgvc`之后函数`gvContext`是否存在。

注意：

- 这里必须要先找到一个被调的库中的函数，才能检查能否成功链库
- 如果链的这个库有其他的依赖库，需要使用`CMAKE_REQUIRED_LINK_OPTIONS`和`CMAKE_REQUIRED_LIBRARIES`来指定

### 安装

这里讲解如何设置当执行`make install`时会执行的指令

```cmake
install(TARGETS <target...>
        LIBRARY DESTINATION <path-to-dynamic-lib>
        ARCHIVE DESTINATION <path-to-static-lib>
        RUNTIME DESTINATION <path-to-bin>
        PUBLIC_HEADER DESTINATION <path-to-header>
        )
install(TARGETS MyLib
        EXPORT MyLibTargets 
        LIBRARY DESTINATION lib
        ARCHIVE DESTINATION lib
        RUNTIME DESTINATION bin
        PUBLIC_HEADER DESTINATION include
        )
```

注意这里都是相对路径，并且是`CMAKE_INSTALL_PREFIX`的相对路径，也就是用户指定的安装路径的安装路径。`RUNTIME DESTINATION`表示可执行文件的安装位置，`LIBRARY DESTINATION`表示动态库的安装位置，`ARCHIVE DESTINATION`表示静态库的安装位置

还有一点前面没讲的是：这里的`<target>`在前面讲可以是可执行文件，或者库文件，那么头文件要怎么弄？头文件可以通过如下命令添加到`<target>`中

```cmake
set_target_properties(<target> PROPERTIES PUBLIC_HEADER header)
```

这样在 install 时就会自动添加到 include 文件夹中。通过这种方式不但能解决头文件的安装问题，还能将许多其他想安装的东西复制到指定位置。CMake支持安装的东西包括`[ARCHIVE|LIBRARY|RUNTIME|OBJECTS|FRAMEWORK|BUNDLE|PRIVATE_HEADER|PUBLIC_HEADER|RESOURCE]`

### 同时编译动态库和静态库

```cmake
add_library(MyLib_dynamic SHARED ${srcs})
add_library(MyLib_static STATIC ${srcs})
set_target_properties(MyLib_dynamic PROPERTIES OUTPUT_NAME "MyLib")
set_target_properties(MyLib_static PROPERTIES OUTPUT_NAME "MyLib")
```

如上，在目标target命名时取为两个不一样的名字，然后通过设置属性的方式改名

## 常用变量

CMake中的变量分为**信息变量**和**操控变量**。

- **信息变量**可以用来获取一些信息，但不能写入
- **操控变量**可以通过改变它的值来改变一些编译过程中的设置，但如果在操控前读取，该变量是空的。

下面介绍一些常用的变量，需要时使用`set`设置这些变量即可。

### 信息变量

#### CMAKE_SOURCE_DIR

源码所在文件夹，即根`CMakeLists.txt`所在文件夹

#### PROJECT_BINARY_DIR

执行`CMake`命令的文件夹，一般来说就是build文件夹

#### CMAKE_CURRENT_SOURCE_DIR

当前`CMakeLists.txt`所在文件夹

### 操控变量

#### RUNTIME_OUTPUT_DIRECTORY

编译出来的可执行文件的存放文件夹

#### LIBRARY_OUTPUT_DIRECTORY

编译出来的库的存放文件夹

#### CMAKE_POSITION_INDEPENDENT_CODE

设置它的值为`YES`来生成位置无关的代码

```cmake
set(CMAKE_POSITION_INDEPENDENT_CODE YES)
```



## 参考

https://cmake.org/cmake/help/latest/manual/cmake-commands.7.html

https://cmake.org/cmake/help/latest/manual/cmake-variables.7.html
