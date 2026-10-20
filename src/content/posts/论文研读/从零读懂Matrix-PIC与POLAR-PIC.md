---
title: "Matrix-PIC 与 POLAR-PIC：把 PIC 仿真搬到 SME 上"
date: 2026-10-19
slug: pic-matrix-outer-product
categories: [论文研读]
tags: [PIC, 粒子模拟, 高性能计算, 矩阵计算, 论文笔记, MPU]
description: "为什么传统向量化 PIC 卡在沉积的原子冲突上，而新一代带矩阵单元（MPU）的 CPU 能把外积当原生指令？六章拆解两篇论文如何一步步把粒子-网格互动改写成外积，榨出 MPU 的算力。"
---

粒子-网格法（PIC）模拟等离子体时，80% 以上的时间耗在「粒子↔网格」的搬运上；而新一代 CPU 悄悄内置了一颗只擅长一种运算的「矩阵单元」——外积。两篇论文干的事，就是把这门老算法一步步改写到这颗新硬件的母语上。

<!-- more -->

<style>
  .post-body .pic-lesson table { display: table; width: 100%; max-width: 100%; border-collapse: collapse; }
  .pic-lesson { margin: 2.6rem 0 1rem; }
  .pic-lesson-h { display: flex; align-items: center; gap: 0.65rem; margin-bottom: 0.2rem; }
  .pic-lesson-n {
    background: var(--accent); color: var(--bg);
    border-radius: 50%; width: 2.1rem; height: 2.1rem; flex-shrink: 0;
    display: inline-flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 1.05rem;
  }
  .pic-lesson-h h2 { border-bottom: none; padding-bottom: 0; margin: 0; }
  .pic-lesson-goal { color: var(--muted); font-size: 0.92rem; margin: 0.3rem 0 1rem; }
  .pic-lesson h4 { margin: 1.3rem 0 0.45rem; font-size: 1.05rem; }
  .pic-key {
    border-left: 4px solid var(--accent);
    background: var(--code-bg);
    padding: 0.7rem 1rem;
    border-radius: 0 8px 8px 0;
    margin: 1rem 0;
  }
  .pic-key::before { content: "✦ 关键结论"; display: block; font-weight: 700; color: #1a5fd0; font-size: 0.88rem; margin-bottom: 0.25rem; }
  @media (prefers-color-scheme: dark) { .pic-key::before { color: var(--accent); } }
  .pic-analogy {
    border-left: 4px solid #2f7a3d;
    background: var(--code-bg);
    padding: 0.7rem 1rem;
    border-radius: 0 8px 8px 0;
    margin: 1rem 0;
  }
  .pic-analogy::before { content: "🍊 类比"; display: block; font-weight: 700; color: #2f7a3d; font-size: 0.88rem; margin-bottom: 0.25rem; }
  .pic-quiz {
    border: 1.5px dashed var(--accent);
    border-radius: 8px;
    padding: 0.7rem 1rem;
    margin: 1rem 0;
    background: transparent;
  }
  .pic-quiz::before { content: "✏️ 小测验"; display: block; font-weight: 700; color: var(--accent); font-size: 0.88rem; margin-bottom: 0.25rem; }
  .pic-qa::before { content: "❓ 你可能想问"; display: block; font-weight: 700; color: #b0522d; font-size: 0.88rem; margin-bottom: 0.25rem; }
  .pic-qa {
    border-left: 4px solid #b0522d;
    background: var(--code-bg);
    padding: 0.7rem 1rem;
    border-radius: 0 8px 8px 0;
    margin: 1rem 0;
  }
  .pic-formula {
    text-align: center;
    overflow-x: auto;
    padding: 0.8rem 0.5rem;
    margin: 0.8rem 0;
    font-family: 'Cambria Math', 'STIX Two Math', 'Latin Modern Math', 'Times New Roman', serif;
    font-size: 1.08rem;
  }
  .pic-formula sup { font-size: 0.75em; line-height: 1; }
  .pic-formula sub { font-size: 0.72em; vertical-align: -0.2em; }
  .pic-fig { margin: 1.4rem 0; text-align: center; }
  .pic-fig img { border: 1px solid var(--border); max-width: 100%; height: auto; background: #fbfbf9; }
  .pic-fig figcaption { color: var(--muted); font-size: 0.88rem; margin-top: 0.4rem; }
  .pic-paper {
    border: 1px solid var(--border);
    background: var(--code-bg);
    border-radius: 8px;
    padding: 0.7rem 1rem;
    margin: 1rem 0;
  }
  .pic-paper::before { content: "📄 论文原文对应处"; display: block; font-weight: 700; font-size: 0.88rem; color: #57606a; margin-bottom: 0.25rem; }
  @media (prefers-color-scheme: dark) { .pic-paper::before { color: var(--muted); } }
  .pic-papers {
    border: 1px solid var(--border);
    border-left: 4px solid var(--accent);
    background: var(--code-bg);
    border-radius: 0 8px 8px 0;
    padding: 0.8rem 1rem;
    margin: 1rem 0 1.4rem;
  }
  .pic-papers::before { content: "📄 本文解读的两篇论文"; display: block; font-weight: 700; font-size: 0.9rem; color: var(--accent); margin-bottom: 0.3rem; }
  .pic-papers ul { margin: 0.3rem 0 0 1.3rem; }
  .pic-papers li { margin: 0.35rem 0; }
  .pic-papers a { color: var(--accent); }
  .pic-toc { border: 1px solid var(--border); border-radius: 8px; padding: 0.9rem 1.2rem; margin: 1.2rem 0; background: var(--card-bg); }
  .pic-toc ol { margin: 0.4rem 0 0 1.2rem; }
  .pic-toc li { margin: 0.2rem 0; }
  .pic-disclaimer {
    border: 1px solid var(--border);
    border-left: 4px solid #b08800;
    background: var(--code-bg);
    color: var(--muted);
    padding: 0.55rem 1rem;
    border-radius: 0 8px 8px 0;
    margin: 1rem 0 1.4rem;
    font-size: 0.92rem;
  }
  .pic-disclaimer strong { color: var(--fg); }
  @media (prefers-color-scheme: dark) {
    .pic-fig img { border-color: #3d444d; border-radius: 8px; }
    .pic-qa::before { color: #d4764a; }
    .pic-analogy::before { color: #4ca85f; }
    .pic-analogy { border-left-color: #4ca85f; }
  }
  .pic-answers { margin: -0.4rem 0 1.2rem; }
  .pic-answers summary { cursor: pointer; color: var(--muted); font-size: 0.9rem; user-select: none; }
  .pic-answers summary:hover { color: var(--accent); }
  .pic-answers[open] summary { margin-bottom: 0.4rem; }
  .pic-answers ol { margin: 0.2rem 0 0 1.4rem; color: var(--muted); font-size: 0.94rem; }
  sub { font-size: 0.72em; vertical-align: -0.25em; }
  .post-body .pic-lesson th { background: var(--code-bg); border-bottom: 2px solid var(--border); font-size: 1rem; }
  .pic-lesson td { line-height: 1.6; }
  .pic-lesson td code { background: transparent; border: none; padding: 0; font-size: 0.9em; }
  .pic-lesson tbody tr + tr td { border-top: 1px solid var(--border); }
</style>

<div class="pic-papers">
  <ul>
    <li><a href="https://dl.acm.org/doi/abs/10.1145/3767295.3769378" target="_blank" rel="noopener">Matrix-PIC: Harnessing Matrix Outer-product for High-Performance Particle-in-Cell Simulations</a>（EUROSYS '26 · DOI 10.1145/3767295.3769378）</li>
    <li><a href="https://dl.acm.org/doi/full/10.1145/3806645.3807574" target="_blank" rel="noopener">POLAR-PIC: A Holistic Framework for Matrixized PIC with Co-Designed Compute, Layout, and Communication</a>（HPDC '26 · DOI 10.1145/3806645.3807574）</li>
  </ul>
</div>

<div class="pic-disclaimer">
  <strong>⚠️ 声明</strong>：本内容完全由 AI 全自动生成，不对任何正确性负责；文中观点与数据请读者自行判断、交叉验证。
</div>

<nav class="pic-toc" aria-label="章节目录">
  <strong>📚 章节目录</strong>
  <ol>
    <li><a href="#lesson-1">PIC 是什么，为什么「沉积」是瓶颈</a></li>
    <li><a href="#lesson-2">VPU vs MPU，外积与内积</a></li>
    <li><a href="#lesson-3">Matrix-PIC：把沉积改写成外积</a></li>
    <li><a href="#lesson-4">GPMA 增量排序：让粒子排好队</a></li>
    <li><a href="#lesson-5">POLAR-PIC：Amdahl 定律与张量堆叠</a></li>
    <li><a href="#lesson-6">SoW、通信重叠与结果解读</a></li>
  </ol>
</nav>

<section class="pic-lesson" id="lesson-1">
  <div class="pic-lesson-h"><span class="pic-lesson-n">1</span><h2>PIC 是什么，为什么「沉积」是瓶颈</h2></div>
  <p class="pic-lesson-goal">目标：建立「PIC 的瓶颈不是算，而是搬和抢」的直觉。</p>

  <p><strong>PIC = Particle-in-Cell（粒子-网格法）</strong>，是模拟<b>等离子体</b>的标准算法。等离子体就是「带电的稀薄气体」——激光打靶、太阳风、聚变装置里的那团东西。</p>
  <p>难点在于：等离子体里有海量带电粒子（动辄几十亿、上万亿个「宏粒子」），每个粒子既受电磁场作用、又反过来产生电磁场。两两算粒子间作用力？算不完。PIC 的折中是：</p>
  <ul>
    <li>粒子在<b>连续空间</b>自由移动（<b>拉格朗日</b>视角——跟着物体走）；</li>
    <li>电磁场定义在<b>离散网格</b>上（<b>欧拉</b>视角——站在固定点看）；</li>
    <li>两者靠「插值 / 沉积」来回搬运信息。</li>
  </ul>

  <div class="pic-analogy">
    <p>拉格朗日 = 给一个人装 GPS 跟踪器跟着他走，关心「这个人在哪」；欧拉 = 在十字路口装固定摄像头数人流，关心「这个路口此刻有多少人」。</p>
  </div>

  <h4>四步循环（务必记牢）</h4>
  <div class="pic-fig">
    <img src="/assets/pic/fig-pic-loop.svg" alt="PIC 四步循环">
    <figcaption>PIC 标准时间步的四步循环：① 场插值 ② 粒子推进 ③ 电流沉积 ④ 场求解。</figcaption>
  </div>
  <table>
    <tr><th>步骤</th><th>名字</th><th>方向</th><th>干什么</th></tr>
    <tr><td>①</td><td>场插值 Interpolation</td><td>网格 → 粒子</td><td>把网格上的 E、B 插值到粒子位置（读 8 点，算 1 个粒子值）</td></tr>
    <tr><td>②</td><td>粒子推进 Push</td><td>纯粒子</td><td>受洛伦兹力，更新速度和新位置</td></tr>
    <tr><td>③</td><td>电流沉积 Deposition</td><td>粒子 → 网格</td><td>把粒子电荷/电流沉积回网格（1 粒子写 8 点）</td></tr>
    <tr><td>④</td><td>场求解 Field Solve</td><td>纯网格</td><td>在网格上解麦克斯韦方程，更新 E、B</td></tr>
  </table>

  <h4>哪一步最慢？</h4>
  <p>论文 1 的 Figure 1（天河星逸平台，WarpX，3000 万网格 / 43 亿粒子）显示：<b>沉积 + 插值两步合计占运行时间 80% 以上，沉积单独占 40% 以上</b>。</p>
  <p>为什么这两步慢？因为它们是「粒子↔网格」互动，而非「粒子自己」或「网格自己」的干净计算。三大病根：</p>
  <ol>
    <li><b>内存访问无规律（局部性差）</b>：粒子乱序乱跑，读哪个粒子、写哪 8 个网格点事先不知道，缓存常扑空。</li>
    <li><b>写冲突</b>：多个粒子可能同时写<b>同一个网格点</b>，并行时靠原子操作（atomicAdd）排队，性能垮掉。</li>
    <li><b>算术强度低（memory-bound）</b>：主要是「读一个、写八个」的搬运活，瓶颈在内存带宽，不在算力。</li>
  </ol>

  <div class="pic-key">
    <p>PIC 的瓶颈不是「算」，而是「搬」和「抢」——乱序搬数据 + 抢着写同一个点。</p>
  </div>

  <div class="pic-qa">
    <p><strong>Q：为什么「粒子在连续空间自由移动」是拉格朗日视角，而「场定义在离散网格」是欧拉视角？</strong></p>
    <p>这对术语来自流体力学，讲的是「你站在哪里描述世界」。拉格朗日 = 跟着物体走（位置写成轨迹 x(t)，关心「这个粒子在哪」）；欧拉 = 站在固定点看（场写成 f(x,t)，关心「这个点此刻的值」）。粒子是离散、有身份的个体 → 跟着走最自然；场是连续、充满空间、服从偏微分方程（麦克斯韦方程）的量 → 在固定网格点上求解最自然。所以 PIC 是「拉格朗日的粒子 + 欧拉的网格」的混合体。</p>
    <p>而这直接决定了后面的一切：插值 = 欧拉网格 → 拉格朗日粒子（读 8 点，多对一，内积）；沉积 = 拉格朗日粒子 → 欧拉网格（写 8 点，一对多，外积）。</p>
  </div>

  <div class="pic-paper">
    <p>论文 1 第 1 节指出沉积占多核 CPU 总时间 40–70%（引文 [5,34]）；Figure 1 给出天河星逸平台上的实测分解。论文 2 第 1 节把「插值 = 带宽受限的 Gather-Stencil、沉积 = 受写冲突和原子开销限制的 Scatter-Add」点明，并指出两者合计常超 80%。</p>
  </div>

  <div class="pic-quiz">
    <ol>
      <li>「粒子 → 网格」是哪一步？「网格 → 粒子」是哪一步？</li>
      <li>为什么沉积比粒子推进慢得多？本质原因是什么？</li>
      <li>用大白话解释：什么是「原子写冲突」？为什么并行时多个粒子会「打架」？</li>
    </ol>
  </div>
  <details class="pic-answers"><summary>参考答案（点击展开）</summary>
    <ol>
      <li>粒子 → 网格是③电流沉积；网格 → 粒子是①场插值。</li>
      <li>沉积是「粒子↔网格」互动，乱序内存访问 + 写冲突 + 低算术强度（memory-bound）；粒子推进是纯粒子计算，数据规整。</li>
      <li>多个粒子同时写同一个网格点，硬件只能让它们排队（原子操作串行化），并行被「抢同一位置」卡住。</li>
    </ol>
  </details>
</section>

<section class="pic-lesson" id="lesson-2">
  <div class="pic-lesson-h"><span class="pic-lesson-n">2</span><h2>VPU vs MPU，外积与内积</h2></div>
  <p class="pic-lesson-goal">目标：搞懂「外积 vs 内积」这对贯穿全文的概念——它是两篇论文的魂。</p>

  <h4>两种处理单元</h4>
  <table>
    <tr><th></th><th>VPU（向量单元）</th><th>MPU（矩阵单元）</th></tr>
    <tr><td>一条指令算</td><td>一串数（向量）</td><td>一个矩阵块（tile）</td></tr>
    <tr><td>典型操作</td><td>逐元素乘加 SIMD（MLA）</td><td>外积累加（MOPA）</td></tr>
    <tr><td>实例</td><td>AVX-512、Arm SVE</td><td>Intel AMX、Arm SME、苹果 M4 矩阵单元、论文的 LX2</td></tr>
    <tr><td>峰值算力</td><td>基准</td><td>约 4× VPU（同频 FP64）</td></tr>
  </table>
  <p>两篇论文都强调的硬事实：<b>MPU 的 MOPA 指令 = 一条指令算一个 m×n 外积并累加进 tile</b>：</p>
  <div class="pic-formula">C ← C + a ⊗ b</div>
  <p>论文的 LX2 芯片里，MPU 是 8×8 双精度 tile，MOPA 理论峰值约为 VPU 的 MLA 的 4 倍。</p>

  <h4>外积 vs 内积</h4>
  <p>设 a ∈ R<sup>m</sup>、b ∈ R<sup>n</sup>。</p>
  <div class="pic-formula"><b>外积</b> a ⊗ b：结果是 m×n 矩阵，第 (i,j) 个元素 = a<sub>i</sub>·b<sub>j</sub>（一对多）</div>
  <div class="pic-formula"><b>内积</b> a·b：结果是 1 个数 = Σ a<sub>i</sub>·b<sub>i</sub>（多对一）</div>
  <p>用一个具体例子感受（第 3 章会原样用上）：</p>
  <div class="pic-formula">
    a = [s<sub>0</sub>, s<sub>1</sub>] = [0.7, 0.3]（2 个数）　　b = [t<sub>0</sub>, t<sub>1</sub>, t<sub>2</sub>, t<sub>3</sub>] = [0.1, 0.2, 0.3, 0.4]（4 个数）<br>
    a ⊗ b = 一张 2×4 的表（8 个数）：每个格子 = s 的某项 × t 的某项<br>
    内积 a·b（长度相同时）= 0.7×0.1 + 0.3×0.2 = 0.07 + 0.06 = 0.13（1 个数）
  </div>
  <div class="pic-fig">
    <img src="/assets/pic/fig-outer-inner.svg" alt="外积 vs 内积">
    <figcaption>沉积 = 一对多 = 外积（左）；插值 = 多对一 = 内积（右）。</figcaption>
  </div>

  <h4>为什么这决定了两篇论文的分工</h4>
  <p>回到 PIC 的两个「粒子↔网格」操作：</p>
  <ul>
    <li><b>沉积（一对多）</b>：一个粒子的电荷/电流「散」到 8 个网格点，这 8 个权重可分离成「x 的 2 项 × y·z 的 4 项」= 2×4 表，<b>天生是外积</b>。</li>
    <li><b>插值（多对一）</b>：8 个网格点的场值「加权求和」成 1 个值，<b>天生是内积</b>。</li>
  </ul>
  <p>于是：论文 1 捡了大便宜（沉积是外积，直接映射到 MPU）；论文 2 碰上硬骨头（插值是内积，得「张量堆叠」硬掰成外积，见第 5 章）。</p>

  <div class="pic-key">
    <p>记忆锚点：<b>沉积 = 散射 scatter = 一对多 = 外积</b>；<b>插值 = 收集 gather = 多对一 = 内积</b>。MPU 只会外积，不会内积。</p>
  </div>

  <div class="pic-qa">
    <p><strong>Q：为什么 MPU 的 MOPA 比 VPU 的 MLA 只高 4× 而不是 8×？</strong></p>
    <p>按「每条指令的乘加数」比，MOPA（8×8=64 个乘加）vs MLA（8 通道=8 个乘加）= <b>8×</b>。但论文的「4×」说的是<b>理论峰值 FLOP/s</b>，不是每指令的比：峰值 = 每指令 FLOP × 指令吞吐(issue rate) × 频率。频率两者相同（≥1.3 GHz），所以要凑出 4×，只能是 <b>8×（每指令）× 0.5（MOPA 吞吐只有 MLA 一半）= 4×</b>。矩阵指令的 issue 吞吐低于向量指令是通用现象（Arm SME 的外积要累加进专用 ZA tile，首代吞吐低于 SVE 的 FMLA）。论文把「≈4×」当硬件规格直接陈述，未展开微架构原因。</p>
  </div>

  <div class="pic-paper">
    <p>论文 1 §5.1 与论文 2 §5.1 同句：「the MPU’s MOPA instruction offers approximately 4× the theoretical FP64 performance of the VPU’s Multiply-Accumulate (MLA) instruction」。论文 2 §3.2 给 MOPA 定义 C ← C + a ⊗ b，并称 Arm SME 带来 near-quadratic 的算力密度提升。</p>
  </div>

  <div class="pic-quiz">
    <ol>
      <li>一句话说清外积和内积在「结果形状」上的区别。</li>
      <li>为什么 MPU 一条指令的算力密度能远超 VPU？</li>
      <li>把「沉积/插值」和「外积/内积」连起来：谁对应谁？</li>
    </ol>
  </div>
  <details class="pic-answers"><summary>参考答案（点击展开）</summary>
    <ol>
      <li>外积 m×n 个元素成一张矩阵（发散）；内积所有乘积求和成 1 个标量（收拢）。</li>
      <li>MPU 一条指令算 m×n 个乘加（如 8×8=64），是二维算力；VPU 一条指令只算向量长度个（如 8）。</li>
      <li>沉积=一对多=外积；插值=多对一=内积。</li>
    </ol>
  </details>
</section>

<section class="pic-lesson" id="lesson-3">
  <div class="pic-lesson-h"><span class="pic-lesson-n">3</span><h2>Matrix-PIC：把沉积改写成外积</h2></div>
  <p class="pic-lesson-goal">目标：看懂论文 1 如何把「沉积」这个散射操作原封不动翻译成 MPU 外积。</p>

  <h4>沉积的数学定义</h4>
  <p>每个粒子 p 带着<b>电荷 q<sub>p</sub></b> 和 <b>速度 v<sub>p</sub></b>，一动就形成<b>电流 q<sub>p</sub>·v<sub>p</sub></b>（电荷 × 速度）。这个电流要「按距离加权」分摊到粒子周围的网格点上，「摊多少」由<b>形状函数 S</b> 决定：</p>
  <div class="pic-formula">J(x<sub>i</sub>) = Σ<sub>p</sub> q<sub>p</sub> · v<sub>p</sub> · S(x<sub>i</sub> − x<sub>p</sub>)</div>
  <p>读作：网格节点 x<sub>i</sub> 上的电流 J = 所有粒子贡献加总；每个粒子贡献 = 它的电流 q<sub>p</sub>v<sub>p</sub> × 它对节点 x<sub>i</sub> 的权重 S(x<sub>i</sub>−x<sub>p</sub>)（粒子离节点越近，S 越大）。</p>
  <p>形状函数 S 的巧妙之处是它<b>可分离</b>：3D 权重 = 三个一维权重的乘积：</p>
  <div class="pic-formula">S<sub>ijk</sub>(x<sub>p</sub>) = s<sub>x,i</sub>(dx<sub>p</sub>) · s<sub>y,j</sub>(dy<sub>p</sub>) · s<sub>z,k</sub>(dz<sub>p</sub>)</div>
  <p><b>一维 CIC 具体例子</b>：先只看 x 方向。节点 0 在位置 0、节点 1 在位置 1，粒子在中间、离节点 0 的距离是 d（0~1 的小数），则：</p>
  <div class="pic-formula">s<sub>0</sub> = 1 − d（近节点权重）　　 s<sub>1</sub> = d（远节点权重）　　 且 s<sub>0</sub> + s<sub>1</sub> = 1（电流守恒）</div>
  <p>若 d = 0.3，则节点 0 拿到 70%、节点 1 拿到 30%——粒子越靠近哪个节点，哪个节点分到的电流越多。</p>
  <ul>
    <li>一阶 CIC：每维 2 点 → 3D 共 2<sup>3</sup> = <b>8</b> 个邻居节点。</li>
    <li>三阶 QSP：每维 4 点 → 3D 共 4<sup>3</sup> = <b>64</b> 个邻居节点。</li>
  </ul>
  <p><b>术语提醒</b>：上面说的都是「网格节点（顶点）」的个数，不是 cell 的个数。一个粒子永远只落在 <b>1 个 cell</b> 里，但它把电流摊到这个 cell 的 8 个顶点（CIC）或更大范围的 64 个节点（QSP）上。</p>
  <p><b>跨 cell 的影响是怎么处理的？</b>答案是「无需特殊处理」——网格顶点被相邻 cell <b>共享</b>（一个 3D 内部顶点同时是 2<sup>3</sup>=8 个 cell 的公共角）。粒子靠近某条边时，权重 s₀=1−d / s₁=d 自动偏向共享顶点，影响就「流」进了邻居 cell。所以粒子的「归属」是 1 个 cell，但「作用」天然跨 cell。</p>

  <h4>为什么传统 SIMD 会「打架」</h4>
  <p>多个粒子可能同时写<b>同一个网格点</b>，只能靠原子操作：</p>
  <div class="pic-formula">GridNode[i] ← atomicAdd(J<sub>i</sub>, ΔJ<sub>p,i</sub>)</div>
  <p>原子操作让并行管线串行化、停顿，高密度区尤其严重——这是 VPU 路线的天花板。</p>

  <h4>第一招：rhocell——先局部归约，再一次性写回</h4>
  <p>别让粒子直接抢着写全局网格。每个粒子的 8 个贡献先累加进一个以它为中心的小数组（rhocell），所有粒子沉积完再做一次 O(N<sub>cells</sub>) 归约写回全局网格：</p>
  <div class="pic-formula">rhocells(1:8, i<sub>cell</sub>) ∈ R<sup>8×Ncells</sup>　　（每个 cell 一列，8 个顶点连续排）</div>
  <p>论文把 rhocell 类比为 Cilk 的 reducer/hyperobject：<b>私有暂存 → 最后无冲突归约</b>。原子冲突就此消失。</p>

  <h4>第二招（核心）：沉积天生就是外积</h4>
  <p>注意上一招的 8 个贡献不是随便 8 个数，而是<b>可分离</b>的——这正是第 2 章那个 2×4 例子！一个粒子（CIC）的 8 个贡献 = 一个 2×4 外积：</p>
  <div class="pic-formula">
    a = [s<sub>x,0</sub>, s<sub>x,1</sub>]<sup>T</sup> ∈ R<sup>2</sup>　　（x 方向 2 个形状因子）<br>
    b = [s<sub>y,0</sub>·s<sub>z,0</sub>, s<sub>y,1</sub>·s<sub>z,0</sub>, s<sub>y,0</sub>·s<sub>z,1</sub>, s<sub>y,1</sub>·s<sub>z,1</sub>]<sup>T</sup> ∈ R<sup>4</sup>　　（y·z 的 4 个组合）<br>
    C = a ⊗ b　（2×4 矩阵 = 8 个形状函数乘积 S<sub>k</sub>(x<sub>p</sub>)）
  </div>
  <div class="pic-fig">
    <img src="/assets/pic/fig-outer-product.svg" alt="外积映射 8 贡献">
    <figcaption>一个粒子 CIC 的 8 个贡献 = 2×4 外积；再乘有效电流 w<sub>p,x</sub> 展平写回 8 个 rhocell 条目。</figcaption>
  </div>
  <p>但 2×4 太小、填不满 8×8 tile（利用率仅 25%）。于是把<b>两个粒子打包</b>：</p>
  <div class="pic-formula">
    A = concat(a1, a2) ∈ R<sup>4</sup>　　B = concat(b1, b2) ∈ R<sup>8</sup><br>
    C<sub>MPU</sub> = A ⊗ B ∈ R<sup>4×8</sup>　　（一条 MPU 指令）<br>
    左上 2×4 = p1 的 8 贡献，右下 2×4 = p2 的 8 贡献，交叉项置 0
  </div>
  <p><b>一条 4×8 外积指令，同时算出 8+8=16 个贡献</b>，计算密度翻倍。高阶 QSP：每维 4 项 → A∈R<sup>8</sup>、B∈R<sup>8</sup>，8×8 外积把 tile 塞满，利用率从 CIC 的 25% 提到 <b>50%</b>。</p>

  <h4>第三招：混合 VPU-MPU kernel（三段式）</h4>
  <table>
    <tr><th>阶段</th><th>谁干</th><th>干什么</th></tr>
    <tr><td>Stage 1</td><td>VPU</td><td>算网格下标、胞内坐标、形状因子、权重，处理边界等条件分支</td></tr>
    <tr><td>Stage 2</td><td>MPU</td><td>把结果组装成 A、B 向量喂 MPU 算外积；同 cell 连续 → tile 寄存器常驻</td></tr>
    <tr><td>Stage 3</td><td>VPU</td><td>从 tile 逐行读出 → 索引化 scatter 写回 J<sub>x</sub>/J<sub>y</sub>/J<sub>z</sub></td></tr>
  </table>

  <div class="pic-key">
    <p>分工哲学：VPU 管控制流 + 数据准备 + 收尾归约（脏活杂活）；MPU 只干高密度外积累加（它唯一擅长的事）。结果：CIC 沉积 kernel 2.98×，QSP 8.7×，峰值效率 83.08%。</p>
  </div>

  <div class="pic-paper">
    <p>论文 1 §4.2.1 给出 a、b 的构造与 C = a ⊗ b；§4.2.2 的 Algorithm 2 是三段式 hybrid kernel；§6.3 报告 CIC 2.98×、QSP 8.7×（对手写 VPU 2.0×），§6.4 报告 83.08% 峰值效率。</p>
  </div>

  <div class="pic-quiz">
    <ol>
      <li>rhocell 是怎么消灭原子冲突的？一句话。</li>
      <li>一个粒子 CIC 的 8 个贡献，为什么恰好能写成 2×4 外积？</li>
      <li>为什么「两粒子打包」能把计算密度翻倍？交叉块怎么处理？</li>
    </ol>
  </div>
  <details class="pic-answers"><summary>参考答案（点击展开）</summary>
    <ol>
      <li>先累加进粒子私有的小数组，最后无冲突归约写回全局（私有暂存 → 归约）。</li>
      <li>形状函数可分离 S = s<sub>x</sub>·s<sub>y</sub>·s<sub>z</sub>，8 个贡献 = x 的 2 项 × (y·z) 的 4 项 = 2×4 外积。</li>
      <li>一条 4×8 外积同时算两个粒子各自 8 个贡献（16 个），对比分开两次 2×4；交叉块 a1⊗b2、a2⊗b1 无效，构造时置 0。</li>
    </ol>
  </details>
</section>

<section class="pic-lesson" id="lesson-4">
  <div class="pic-lesson-h"><span class="pic-lesson-n">4</span><h2>GPMA 增量排序：让粒子排好队</h2></div>
  <p class="pic-lesson-goal">目标：回答第 3 章的伏笔——怎么用 O(1) 的代价维持「粒子按 cell 排好队」。</p>

  <h4>为什么排序这么重要</h4>
  <p>MPU 要高效，前提是<b>粒子按 cell 排好序</b>（同一 cell 的粒子内存连续），tile 寄存器才能复用、数据供给才规律。</p>
  <p><b>注意：这里「排序」的 key 是「网格单元编号 cell ID」，不是连续三维坐标。</b>三维网格单元 (i,j,k) 先被<b>线性化</b>成一个一维整数编号（论文 Algorithm 2 的 GetCellID(i,j,k)；常见做法是行主序或 Morton 序/Z 曲线），再按这个整数排序——所以排序本身是一维的，但这个编号已经编码了三维位置。Morton 序还有个好处：三维上相邻的 cell，编号也相邻，缓存局部性更好。</p>

  <h4>先看朴素方案，为什么都不行</h4>
  <table>
    <tr><th>方案</th><th>插入/删除</th><th>连续性</th><th>死穴</th></tr>
    <tr><td>A 每步全量排序</td><td>O(N) 每步</td><td>好</td><td>即使 99% 粒子没动也全排，浪费</td></tr>
    <tr><td>B 紧凑数组 + 挪动</td><td>O(N) 每次</td><td>好</td><td>插删一个要搬动整段，M 个移动 = O(M·N)</td></tr>
    <tr><td>C 每 cell 链表</td><td>O(1)</td><td>差</td><td>内存不连续、指针跳转，SIMD/MPU 读不动</td></tr>
    <tr><td><b>D GPMA</b></td><td><b>O(1)</b></td><td><b>好</b></td><td>✅ 两全</td></tr>
  </table>

  <div class="pic-analogy">
    <p>书架上书一本紧挨一本按作者排好，想往中间插一本新书，就得把后面<b>整排</b>书往后推一格（方案 B 的 O(N) 挪动）。GPMA 的做法是<b>每隔几本就留一个空位</b>：新书来了直接塞进附近空位，不用挪整排；删书就把空位腾出来记着，下本再用。</p>
  </div>

  <h4>GPMA（带空隙的紧凑内存数组）</h4>
  <p><b>CFL 条件救命</b>：绝大多数粒子一步内不会跨 cell，所以只需增量更新「移动了」的粒子。GPMA 在连续粒子索引数组里<b>留空隙（gap）</b>，用 INVALID_PARTICLE_ID 标记空槽，空槽栈记录可用位置：</p>
  <ul>
    <li><b>插入</b>：从空槽栈 pop 一个位置放入 → <b>O(1)</b>（栈非空时）。</li>
    <li><b>删除</b>：位置标空、槽号 push 回栈 → <b>O(1)</b>。</li>
    <li><b>本 cell 满</b>：向相邻 bin 借空槽，可能搬一小段（局部代价 O(块大小)）。</li>
    <li><b>借不到</b> → 触发整个 tile 的 GPMA 重建（O(N<sub>p,tile</sub>)）。</li>
  </ul>

  <div class="pic-analogy">
    <p>传统稠密数组插删要搬大量数据；链表遍历慢、不利 SIMD。GPMA 用「空隙」换 O(1)：像电影院留了几个空座，新来的直接坐空位，不用整排挪动。</p>
  </div>

  <h4>增量排序流程</h4>
  <ol>
    <li>VPU 遍历粒子算新 cell c<sub>new</sub>；若与旧 cell 不同则标 moved、进 pending_moves、原槽标空。</li>
    <li>ApplyPendingMoves：对 moved 粒子走 GPMA 删除+插入（O(1) 摊还）。</li>
    <li>全局重排策略：5 条优先级规则（最小间隔 / 固定间隔 / 重建次数 / 空槽比 / 性能退化），偶尔做一次全局 counting sort 救回长期漂移的局部性。</li>
  </ol>

  <div class="pic-key">
    <p>两段式——VPU 识别谁动了 → GPMA 高效改索引；不搬粒子本体（只动索引），配合周期性全局重排。增量排序单独贡献 1.62×。</p>
  </div>

  <div class="pic-paper">
    <p>论文 1 §4.3 定义 GPMA 及其 O(1) 摊还插入/删除；§4.4 给出 5 条全局重排策略；§6.2 报告增量排序单独带来 1.62× 内核加速。</p>
  </div>

  <div class="pic-quiz">
    <ol>
      <li>为什么 GPMA 的插入/删除能做到 O(1)？靠什么「换」来的？</li>
      <li>CFL 条件在这里起了什么作用？</li>
      <li>什么时候才需要触发整个 tile 的 GPMA 重建？</li>
    </ol>
  </div>
  <details class="pic-answers"><summary>参考答案（点击展开）</summary>
    <ol>
      <li>靠「空隙 + 空槽栈」换来的：插入直接坐空位、删除标记空位，O(1)；代价是内存里有空槽。</li>
      <li>CFL 保证绝大多数粒子一步内不跨 cell，所以只需增量更新少数「移动了」的粒子，无需每步全量排序。</li>
      <li>本 cell 满且相邻 bin 借不到空槽（或空槽比过低、溢出粒子过多）时。</li>
    </ol>
  </details>
</section>

<section class="pic-lesson" id="lesson-5">
  <div class="pic-lesson-h"><span class="pic-lesson-n">5</span><h2>POLAR-PIC：Amdahl 定律与张量堆叠</h2></div>
  <p class="pic-lesson-goal">目标：看懂论文 2 为什么必须登场，以及它怎么把「内积」的插值硬掰成「外积」。</p>

  <h4>Amdahl 定律：为什么「只加速沉积」不够</h4>
  <p>整体加速受「无法加速的部分」钳制。论文 1 只加速了沉积 → <b>插值成为新瓶颈</b>。论文 2 点破：插值在数学上是<b>内积归约（many-to-one）</b>，和 MPU 的<b>外积（one-to-many）</b>结构错配。</p>
  <p>另外两个问题：① 论文 1 只维护<b>逻辑顺序（索引）</b>，不保证<b>物理内存连续</b> → 碎片化饿死 MPU；② 主流框架的粒子重分布是 <b>BSP 全局同步点</b>，高动态下开销随并行度暴涨。</p>
  <p><b>POLAR-PIC = P</b>article <b>O</b>uter-product, <b>L</b>ocality-<b>A</b>ware, <b>R</b>MA-overlapped PIC。</p>

  <h4>插值的数学定义（内积）</h4>
  <p>粒子 p 的插值场 F<sub>p</sub>（如 E<sub>p</sub> 或 B<sub>p</sub>）是 K 个模板节点场值的加权和：</p>
  <div class="pic-formula">
    F(x<sub>p</sub>) = Σ<sub>k</sub> Σ<sub>j</sub> Σ<sub>i</sub> S<sub>x</sub>(i)·S<sub>y</sub>(j)·S<sub>z</sub>(k) · F<sub>grid</sub>(i<sub>0</sub>+i, j<sub>0</sub>+j, k<sub>0</sub>+k)
  </div>
  <p>单粒子紧凑形式：</p>
  <div class="pic-formula">f<sub>p</sub> = Σ<sub>q=1..K</sub> w<sub>p,q</sub> · g<sub>q</sub></div>
  <ul>
    <li>g<sub>q</sub> ∈ R<sup>D</sup>：第 q 个节点的场向量（D=6：E<sub>x</sub>,E<sub>y</sub>,E<sub>z</sub>,B<sub>x</sub>,B<sub>y</sub>,B<sub>z</sub>）。</li>
    <li>w<sub>p,q</sub>：粒子 p 在该节点的几何权重（形状函数乘积）。</li>
    <li>K：模板尺寸（三阶 B-spline 时 K = 4<sup>3</sup> = 64）。</li>
  </ul>
  <p>这就是一个<b>内积</b>：K 个节点 → 1 个粒子，加权求和坍缩成一个向量。</p>
  <p><b>插值是沉积的镜像</b>：沉积把粒子的电流按形状函数 S 加权「摊」到 8 个节点（一对多）；插值反过来，按<b>同一个 S</b> 从 8 个节点把场「取」回粒子（多对一）。沿用第 3 章的 1D 例子——粒子在 x=1.7（cell [1,2]），沉积时把 0.3 给节点 1、0.7 给节点 2；插值时就从节点 1 取 0.3、从节点 2 取 0.7，<b>权重完全一样</b>：</p>
  <div class="pic-formula">E(1.7) = 0.3 · E(1) + 0.7 · E(2)</div>
  <p>这个「沉积与插值共用同一套权重」的对称性，正是 PIC 里动量/能量守恒的基础。</p>

  <h4>朴素做法：让 VPU 做 gather</h4>
  <p>最直接的做法是让 VPU 逐个粒子做 gather——每个粒子读它的 K 个模板节点（三阶 B-spline 时 K=64），加权求和出 1 个场值。这就是原生 WarpX 的基线（论文里的 G0/G1）。</p>
  <p>但它的死穴是<b>内存受限（bandwidth-bound）</b>：读 64 个节点才算出 1 个值，算术强度极低；而且它是「内积」，<b>用不上 MPU 的外积</b>。所以沉积被论文 1 加速之后，插值就成了 Amdahl 定律里的新瓶颈——这正是张量堆叠要解决的问题。</p>

  <h4>张量堆叠：把内积硬掰成外积</h4>
  <p>把同一 cell 的 N 个粒子（FP64 取 N=8）<b>逻辑堆叠</b>成矩阵：</p>
  <ul>
    <li>权重矩阵 W ∈ R<sup>N×K</sup>（每行一个粒子的 K 个权重）</li>
    <li>场矩阵 G ∈ R<sup>K×D</sup>（每行一个节点的 D 维场向量）</li>
    <li>整批插值结果 F ∈ R<sup>N×D</sup> = W · G</li>
  </ul>
  <p>沿模板维度展开成<b>外积之和</b>：</p>
  <div class="pic-formula">F = Σ<sub>q=1..K</sub> w<sub>:,q</sub> ⊗ g<sub>q</sub>　→　F<sub>tile</sub> ← F<sub>tile</sub> + w<sub>:,q</sub> ⊗ g<sub>q</sub>（MOPA）</div>
  <div class="pic-fig">
    <img src="/assets/pic/fig-tensor-stacking.svg" alt="张量堆叠示意图">
    <figcaption>张量堆叠：把 N 个粒子的权重堆成 W、K 个节点的场堆成 G，整批插值 F = W·G 展开成外积之和 Σ w<sub>:,q</sub> ⊗ g<sub>q</sub>。</figcaption>
  </div>

  <div class="pic-key">
    <p>把「N 个粒子各自做 K 次内积」的 1-D 向量流水线，变成「每个节点做一次 N×D 外积」的 2-D 矩阵流水线——正好是 MPU 的原生形态。不足 N 个的残量用零填充（zero-padding）。</p>
  </div>
  <p><b>一个精炼的理解</b>：矩阵乘有两种等价写法——<b>内积形式</b> C[i,j] = A[i,:]·B[:,j]（行点乘列）和<b>外积形式</b> C = Σ<sub>l</sub> A[:,l] ⊗ B[l,:]（列外积行）。论文把插值从内积形式换成外积形式，因为 MPU 的 MOPA 只做外积 C←C+a⊗b。数学上算的是同一个 F = W·G，只是「怎么算」恰好匹配硬件。</p>

  <div class="pic-paper">
    <p>论文 2 §4.2 定义张量堆叠：W ∈ R<sup>N×K</sup>、G ∈ R<sup>K×D</sup>、F = W·G = Σ w<sub>:,q</sub> ⊗ g<sub>q</sub>（Eq.4–6）；§6.2 报告插值 G7 达 7.96×（约 8.0×）。</p>
  </div>

  <div class="pic-quiz">
    <ol>
      <li>Amdahl 定律在这里怎么解释「只加速沉积不够」？</li>
      <li>插值为什么是内积？（K 个节点 → 1 个粒子，多对一）</li>
      <li>张量堆叠的关键一步是什么？把什么变成了外积之和？</li>
    </ol>
  </div>
  <details class="pic-answers"><summary>参考答案（点击展开）</summary>
    <ol>
      <li>沉积加速后占比下降，插值占比上升成为新瓶颈；整体加速被「没加速的插值」钳制。</li>
      <li>因为 f<sub>p</sub> = Σ w<sub>p,q</sub>·g<sub>q</sub> 是加权求和，多对一坍缩。</li>
      <li>把 N 个粒子堆成权重矩阵 W，与场矩阵 G 相乘展开成 Σ w<sub>:,q</sub> ⊗ g<sub>q</sub>，每个节点一次外积。</li>
    </ol>
  </details>
</section>

<section class="pic-lesson" id="lesson-6">
  <div class="pic-lesson-h"><span class="pic-lesson-n">6</span><h2>SoW、通信重叠与结果解读</h2></div>
  <p class="pic-lesson-goal">目标：看懂论文 2 的布局与通信两招，并串起两篇论文的结果。</p>

  <h4>Sort-on-Write（SoW）：借「写回」顺手排好序</h4>
  <p>论文 1 的 GPMA 只保证<b>逻辑顺序</b>，物理内存可能碎。SoW 目标是<b>物理连续</b>。它把每个 tile 的内存分成两区：</p>
  <ul>
    <li><b>有序区 Ordered Region</b>：绝大多数粒子，物理连续 → 直接可被 MPU 向量加载。</li>
    <li><b>无序区 Disordered tail</b>：尾部一小撮，append-only，靠辅助索引 bin_to_ip 恢复逻辑顺序。</li>
  </ul>
  <p>在粒子 push 的<b>写回路径</b>上「流式分流」——SIMD 一次分类（c<sub>new</sub>==c 则驻留，否则迁移），双指针流式写回：驻留粒子紧凑写进下一帧有序区，迁移粒子 append 到无序尾；下一步开头对无序尾做一次 O(N<sub>tail</sub>) 轻量 binning。</p>
  <div class="pic-fig">
    <img src="/assets/pic/fig-sow.svg" alt="SoW 双区布局">
    <figcaption>SoW 双区布局：驻留粒子（m_stay）紧凑写进下一帧有序区，迁移粒子（m_move）进无序尾。</figcaption>
  </div>

  <div class="pic-key">
    <p>CFL 下多数粒子驻留，所以「排序」几乎没有额外代价——它是 push 写回时顺手做的。无序粒子逐步被吸回有序区，无需 stop-the-world 全局排序。</p>
  </div>

  <h4>通信重叠：把重分布藏进沉积</h4>
  <p>原生 WarpX 步尾做 BSP 重分布（扫描打包 → 阻塞通信 → 解包），高动态下是大头。POLAR-PIC 三招：</p>
  <ol>
    <li><b>打包融合进 kernel</b>：push 后位置 x<sup>n+1</sup> 已知（决定去向），写回路径顺手把迁移粒子分拣进本地/远端发送缓冲，省掉步尾独立的 scan-and-pack。</li>
    <li><b>UNR 单向 RMA</b>：主线程在 OpenMP 区外发一次 UNR batch_put，RDMA 写交给网卡（NIC），CPU 立刻转去沉积。</li>
    <li><b>收敛点后置</b>：沉积结束后才 UNR_Wait，把通信延迟藏进计算；避开延迟敏感的场求解，防 NIC 队列争抢。</li>
  </ol>
  <div class="pic-fig">
    <img src="/assets/pic/fig-overlap.svg" alt="BSP vs 通信重叠">
    <figcaption>原生 WarpX 的 BSP 把扫描打包、阻塞通信暴露在关键路径上；POLAR-PIC 把打包融入写回、RDMA 交给网卡，与沉积重叠。</figcaption>
  </div>
  <p>实测重叠率 <b>99.1%</b>，通信时间比 MPI 方案少 20×，最大 per-rank 等待降 58×。</p>

  <h4>结果速查</h4>
  <table>
    <tr><th></th><th>论文 1 Matrix-PIC</th><th>论文 2 POLAR-PIC</th></tr>
    <tr><td>CIC 总时间</td><td>1.19×（均匀）/ 2.63×（LWFA）</td><td>—</td></tr>
    <tr><td>粒子阶段</td><td>—</td><td>10.9×（均匀）/ 4.4×（LIA）</td></tr>
    <tr><td>对 Matrix-PIC</td><td>—</td><td>4.7× / 3.8×</td></tr>
    <tr><td>沉积 kernel</td><td>CIC 2.98×；QSP 8.7×（2.0× 对手写 VPU）</td><td>13.2×（D3）</td></tr>
    <tr><td>插值 kernel</td><td>未做</td><td>8.0×（G7）</td></tr>
    <tr><td>重叠率</td><td>—</td><td>99.1%</td></tr>
    <tr><td>峰值效率</td><td>83.08%（vs CUDA 29.76%）</td><td>13.2%（vs A800 WarpX 9.6%）</td></tr>
    <tr><td>弱扩展</td><td>单节点</td><td>67.5%（1→4096 节点；WarpX 掉到 42.5%）</td></tr>
  </table>
  <p><b>正确性</b>（论文 2）：LIA 相空间 MSE 3.198、MAE 0.8401（归一化 m<sub>e</sub>·c），相对误差 &lt;0.84%，守恒量稳定。</p>

  <div class="pic-key">
    <p>一句话总结全文：这两篇论文讲的是，如何把「粒子↔网格」这个散乱的、带宽受限的、抢着写的老算法，一步步改写到「矩阵化 CPU」的原生外积范式上——先搞定沉积（论文 1），再补上插值、物理排布和通信（论文 2）。读完留下新问题：粒子成本降下来后，<b>场求解器</b>成了下一个被 Amdahl 定律盯上的目标。</p>
  </div>

  <div class="pic-paper">
    <p>论文 2 §4.3 定义 SoW 与双区内存；§4.4 定义 UNR 重叠；§6.4 报告 99.1% 重叠率；§6.6 报告 67.5% 弱扩展效率（原生 WarpX 42.5%）。注意：两篇论文的「峰值效率」口径不同——论文 1 是单 kernel 的 83.08%，论文 2 是整条粒子处理链路的 13.2%，不可直接比较。</p>
  </div>

  <div class="pic-quiz">
    <ol>
      <li>SoW 和 GPMA 的关键区别是什么？（提示：逻辑顺序 vs 物理连续）</li>
      <li>为什么要把通信「藏进」沉积，而不是「藏进」场求解？</li>
      <li>读完两篇论文，下一步该优化什么？为什么？</li>
    </ol>
  </div>
  <details class="pic-answers"><summary>参考答案（点击展开）</summary>
    <ol>
      <li>GPMA 只维护逻辑索引顺序，物理内存可能碎；SoW 借写回路径维持物理连续。</li>
      <li>场求解是延迟敏感的通信，把粒子流量延伸到它会争抢 NIC 带宽、引入抖动；沉积窗口足够隐藏传输延迟且不干扰场求解。</li>
      <li>场求解器——粒子成本降下来后，按 Amdahl 定律它成为新的主导成本。</li>
    </ol>
  </details>
</section>
