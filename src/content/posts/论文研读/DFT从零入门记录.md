---
title: “从0开始的XLSDFT”
date: 2026-10-11
slug: dft-from-zero
categories: [论文研读]
tags: [DFT, 密度泛函理论, 学习记录]
description: “为什么传统 DFT 只能算几千原子，XLSDFT 却能算 1 亿？七课拆解：从波函数与 Kohn-Sham 方程，到 O(N³) 瓶颈，再到密度矩阵、分而治之与 CheFSI 三件套。”
---

为什么传统 DFT 只能算几千原子，XLSDFT 却能算 1 亿？七课拆解：从波函数与 Kohn-Sham 方程，到 O(N³) 瓶颈，再到密度矩阵、分而治之与 CheFSI 三件套。

<!-- more -->

<style>
  .post-body .dft-lesson table { display: table; width: 100%; max-width: 100%; border-collapse: collapse; }
  .dft-lesson { margin: 2.6rem 0 1rem; }
  .dft-lesson-h { display: flex; align-items: center; gap: 0.65rem; margin-bottom: 0.2rem; }
  .dft-lesson-n {
    background: var(--accent); color: var(--bg);
    border-radius: 50%; width: 2.1rem; height: 2.1rem; flex-shrink: 0;
    display: inline-flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 1.05rem;
  }
  .dft-lesson-h h2 { border-bottom: none; padding-bottom: 0; margin: 0; }
  .dft-lesson-goal { color: var(--muted); font-size: 0.92rem; margin: 0.3rem 0 1rem; }
  .dft-lesson h4 { margin: 1.3rem 0 0.45rem; font-size: 1.05rem; }
  .dft-key {
    border-left: 4px solid var(--accent);
    background: var(--code-bg);
    padding: 0.7rem 1rem;
    border-radius: 0 8px 8px 0;
    margin: 1rem 0;
  }
  .dft-key::before { content: "✦ 关键结论"; display: block; font-weight: 700; color: #1a5fd0; font-size: 0.88rem; margin-bottom: 0.25rem; }
  @media (prefers-color-scheme: dark) { .dft-key::before { color: var(--accent); } }
  .dft-analogy {
    border-left: 4px solid #2f7a3d;
    background: var(--code-bg);
    padding: 0.7rem 1rem;
    border-radius: 0 8px 8px 0;
    margin: 1rem 0;
  }
  .dft-analogy::before { content: "🍊 类比"; display: block; font-weight: 700; color: #2f7a3d; font-size: 0.88rem; margin-bottom: 0.25rem; }
  .dft-quiz {
    border: 1.5px dashed var(--accent);
    border-radius: 8px;
    padding: 0.7rem 1rem;
    margin: 1rem 0;
    background: transparent;
  }
  .dft-quiz::before { content: "✏️ 小测验"; display: block; font-weight: 700; color: var(--accent); font-size: 0.88rem; margin-bottom: 0.25rem; }
  .dft-qa::before { content: "❓ 你可能想问"; display: block; font-weight: 700; color: #b0522d; font-size: 0.88rem; margin-bottom: 0.25rem; }
  .dft-qa {
    border-left: 4px solid #b0522d;
    background: var(--code-bg);
    padding: 0.7rem 1rem;
    border-radius: 0 8px 8px 0;
    margin: 1rem 0;
  }
  .dft-formula {
    text-align: center;
    overflow-x: auto;
    padding: 0.8rem 0.5rem;
    margin: 0.8rem 0;
    font-family: 'Cambria Math', 'STIX Two Math', 'Latin Modern Math', 'Times New Roman', serif;
    font-size: 1.08rem;
  }
  .dft-formula sup { font-size: 0.75em; line-height: 1; }
  .dft-formula .frac { display: inline-block; vertical-align: -0.5em; text-align: center; margin: 0 0.12em; }
  .dft-formula .frac .fnum { display: block; padding: 0 0.3em 0.06em; border-bottom: 1px solid currentColor; }
  .dft-formula .frac .fden { display: block; padding: 0.06em 0.3em 0; }
  .dft-fig { margin: 1.4rem 0; text-align: center; }
  .dft-fig img { border: 1px solid var(--border); max-width: 100%; height: auto; }
  .dft-fig figcaption { color: var(--muted); font-size: 0.88rem; margin-top: 0.4rem; }
  .dft-fig-row { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; }
  .dft-fig-row .dft-fig { flex: 1 1 320px; max-width: 100%; }
  .dft-glossary { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.8rem; margin: 1rem 0; }
  .dft-def { border: 1px solid var(--border); border-radius: 8px; padding: 0.6rem 0.8rem; background: var(--card-bg); }
  .dft-def dt { font-weight: 700; color: var(--accent); }
  .dft-def dd { margin: 0.2rem 0 0; font-size: 0.92rem; color: var(--muted); }
  .dft-paper {
    border: 1px solid var(--border);
    background: var(--code-bg);
    border-radius: 8px;
    padding: 0.7rem 1rem;
    margin: 1rem 0;
  }
  .dft-paper::before { content: "📄 论文原文对应处"; display: block; font-weight: 700; font-size: 0.88rem; color: #57606a; margin-bottom: 0.25rem; }
  @media (prefers-color-scheme: dark) { .dft-paper::before { color: var(--muted); } }
  .dft-toc { border: 1px solid var(--border); border-radius: 8px; padding: 0.9rem 1.2rem; margin: 1.2rem 0; background: var(--card-bg); }
  .dft-toc ol { margin: 0.4rem 0 0 1.2rem; }
  .dft-toc li { margin: 0.2rem 0; }
  .dft-disclaimer {
    border: 1px solid var(--border);
    border-left: 4px solid #b08800;
    background: var(--code-bg);
    color: var(--muted);
    padding: 0.55rem 1rem;
    border-radius: 0 8px 8px 0;
    margin: 1rem 0 1.4rem;
    font-size: 0.92rem;
  }
  .dft-disclaimer strong { color: var(--fg); }
  @media (prefers-color-scheme: dark) {
    .dft-def { border-color: #3d444d; }
    .dft-fig img { border-radius: 8px; }
    .dft-qa::before { color: #d4764a; }
    .dft-analogy::before { color: #4ca85f; }
    .dft-analogy { border-left-color: #4ca85f; }
  }
  .dft-answers { margin: -0.4rem 0 1.2rem; }
  .dft-answers summary { cursor: pointer; color: var(--muted); font-size: 0.9rem; user-select: none; }
  .dft-answers summary:hover { color: var(--accent); }
  .dft-answers[open] summary { margin-bottom: 0.4rem; }
  .dft-answers ol { margin: 0.2rem 0 0 1.4rem; color: var(--muted); font-size: 0.94rem; }
  .dft-tip { position: relative; cursor: help; border-bottom: 1px dotted var(--muted); }
  .dft-tip::after {
    content: attr(data-tip);
    position: absolute; left: 50%; bottom: 135%;
    transform: translateX(-50%);
    background: var(--fg); color: var(--bg);
    padding: 0.35rem 0.6rem; border-radius: 6px;
    font-size: 0.82rem; font-weight: normal; line-height: 1.5;
    width: max-content; max-width: 300px; white-space: normal;
    opacity: 0; visibility: hidden; transition: opacity 0.15s;
    pointer-events: none; z-index: 30;
  }
  .dft-tip:hover::after, .dft-tip:focus::after { opacity: 1; visibility: visible; }
  .dft-formula .dft-tip::after { display: none; }
  sub { font-size: 0.72em; vertical-align: -0.25em; }
  .post-body .dft-lesson th { background: var(--code-bg); border-bottom: 2px solid var(--border); font-size: 1rem; }
  .dft-lesson td { line-height: 1.6; }
  .dft-lesson td code { background: transparent; border: none; padding: 0; font-size: 0.9em; }
  .dft-lesson tbody tr + tr td { border-top: 1px solid var(--border); }
</style>

<div class="dft-disclaimer">
  <strong>⚠️ 声明</strong>：本内容完全由 AI 全自动生成，不对任何正确性负责；文中观点与数据请读者自行判断、交叉验证。
</div>

<nav class="dft-toc" aria-label="课程目录">
  <strong>📚 课程目录</strong>
  <ol>
    <li><a href="#lesson-1">为什么需要量子力学</a></li>
    <li><a href="#lesson-2">从波函数到密度：DFT 的核心思想</a></li>
    <li><a href="#lesson-3">Kohn-Sham 方程：把不可能变成可能</a></li>
    <li><a href="#lesson-4">DFT 实际怎么算：离散化与输出量</a></li>
    <li><a href="#lesson-5">计算瓶颈：为什么只能算几百几千原子</a></li>
    <li><a href="#lesson-6">XLSDFT 方法：O(N³) 是怎么一步步变成 O(N) 的</a></li>
    <li><a href="#lesson-7">论文全貌串读：从问题到结果</a></li>
    <li><a href="#glossary">术语卡片</a></li>
  </ol>
</nav>

<section class="dft-lesson" id="lesson-1">
  <div class="dft-lesson-h"><span class="dft-lesson-n">1</span><h2>为什么需要量子力学</h2></div>
  <p class="dft-lesson-goal">目标：建立“DFT 要解决什么问题”的直觉。</p>

  <p>先回答一个根本问题：<strong>我们为什么要关心电子？</strong></p>
  <p>论文研究的对象——硅晶体、锂金属、LGPS 固态电解质——都由原子组成。每个原子 = 原子核 + 电子。
  原子核很重（质量是电子的 1800 倍以上）、移动慢，在“电子级”的讨论里基本是固定不动的背景；
  而决定材料导电性、化学反应、电池界面上锂和电解质会不会“打架”的，几乎全是<strong>电子在干什么</strong>。
  所以一切材料模拟的核心，都是“求解电子状态”。</p>

  <h3>电子不是小球</h3>
  <p>中学物理把电子画成绕核转的小球，但真实电子太小了（约 10⁻³¹ kg），必须用量子力学描述：</p>
  <ul>
    <li>无法同时精确知道电子的位置和速度（测不准原理），“轨道”在微观世界不成立；</li>
    <li>取而代之的是<strong>波函数 ψ(r)</strong>：电子被描述成一团弥散在空间中的概率云，
      |ψ(r)|² 表示“在位置 r 处找到这个电子的概率密度”。</li>
  </ul>

  <h3>单个电子怎么算：薛定谔方程</h3>
  <p>定态薛定谔方程（全文唯一真正重要的公式，后面所有东西都是它的变形）：</p>
  <div class="dft-formula"><strong>Ĥψ = Eψ</strong></div>
  <ul>
    <li>ψ：电子的波函数（我们要求的东西）；E：电子的能量</li>
    <li>Ĥ：哈密顿量（“总能量算符”）= 动能项 + 势能项：Ĥ = −(ħ²/2m)∇² + V(r)</li>
    <li>动能项里的 ∇² 是二阶导数：波函数<strong>弯得越厉害，动能越高</strong>（波函数的弯曲 = 电子的“抖动”）</li>
    <li>V(r)：电子感受到的外部势场，比如原子核对它的吸引</li>
  </ul>
  <p>单个电子在已知势场里，这个方程是能解的（氢原子甚至有精确解析解）。</p>

  <h3>多个电子呢？灾难来了</h3>
  <p>一块材料里有 N 个电子。N 个电子的波函数不是 N 个单电子波函数，而是<strong>一个</strong>活在 3N 维空间里的函数：</p>
  <div class="dft-formula">ψ(r₁, r₂, …, r<sub>N</sub>)　——　每个电子 3 个坐标，共 3N 维</div>
  <p>而且电子之间互相有库仑排斥，每个电子都跟其余所有电子耦合，没法拆成独立小问题——这就是著名的<strong>多体问题</strong>。</p>
  <p>更要命的是<strong>维度灾难</strong>：把 3N 维空间每维切 100 个格点来存这个波函数，需要 100^(3N) 个数字。
  N = 100 个电子时是 10⁶⁰⁰——可观测宇宙的原子总数“才”约 10⁸⁰。指数爆炸，任何超算都存不下。</p>
  <p>所以 1929 年狄拉克说：物理和化学所需的全部基本定律都已经知道了，
  <strong>难的不是定律，而是“定律精确应用得到的方程太复杂，解不出来”</strong>。</p>

  <div class="dft-key">
    <p>常规思路“把 N 个电子的波函数直接解出来”是一条死路：3N 维 + 电子间耦合 → 指数爆炸。
    DFT 要做的，就是绕开这条路（第 2 课）。</p>
  </div>

  <div class="dft-paper">
    <p>论文 III 节把 <span class="dft-tip" tabindex="0" data-tip="Kohn-Sham 密度泛函理论">KS-DFT</span> 称为 <em>ab initio</em>（第一性原理，即“只从量子力学出发、不靠经验参数”）材料模拟的主力；
    论文 Eq. (1)：Hψₙ = λₙψₙ 正是本课方程的本征问题形式（第 3 课展开）。</p>
  </div>

  <div class="dft-qa">
    <p><strong>Q：为什么 |ψ(r)|² 可以表示概率密度？</strong></p>
    <p>这是量子力学的一条公设（玻恩规则），不由更基本的东西推导——物理学只验证“照此计算是否永远与实验一致”，
    而它通过了一百年的检验。选“平方”有四层自洽：① ψ 是复数，|ψ|² = a²+b² 恒为非负实数，
    天然满足概率要求；② 薛定谔方程自带概率守恒，只有把 |ψ|² 当概率密度才成立；
    ③ 所有波的强度都与振幅平方成正比（光强 ∝ 电场²），电子波的“强度”就是 |ψ|²；
    ④ 双缝实验：电子一个一个发射，落点累积成干涉条纹，条纹明暗恰好等于 |ψ|² 的分布。</p>
  </div>
  <div class="dft-qa">
    <p><strong>Q：薛定谔方程如何简单而抽象地理解？</strong></p>
    <p>四个递进视角：① 它是一台“找特殊状态”的分类机（本征值方程）——对哪些状态 ψ，
    “测量总能量”的结果恰好是“原状态 × 一个数 E”；② 它是能量守恒的量子版——把“动能+势能”翻译成算符 Ĥ，
    说“Ĥ 作用在 ψ 上 = E × ψ”；③ 它是“波必须怎么弯”的规则——动能 ∝ ψ 的弯曲程度（∇² 是曲率），
    势阱深处允许剧烈弯曲、势平坦处必须平缓；④ 驻波类比——两端固定的吉他弦只能按特定形状振动，
    ψ 是形状、V(r) 是松紧、E 是音高。</p>
  </div>
  <div class="dft-qa">
    <p><strong>Q：为什么吉他弦只能按 1、2、3 个波节振动？</strong></p>
    <p>因为两端被“钉死”（边界条件）：端点位移必须为零 → 波长只能取 λ = 2L/n → 只有整数个半波长的形状合法。
    波节越多 = 弯曲越厉害 = 音越高。这个“边界条件筛选形状”的机制，正是量子能级离散化的直观本质——
    电子的能量 E₁ &lt; E₂ &lt; E₃… 与吉他弦的离散音高是同一个数学现象，基态就是“波节最少、最舒缓”的那个模式。</p>
  </div>
  <div class="dft-qa">
    <p><strong>Q：波函数 ψ(r) 的输入为什么是 N 个电子的三维坐标？</strong></p>
    <p>要分清两种情形：单电子波函数 ψ(r) 的输入只是 1 个空间点（3 个数）；
    N 电子波函数 ψ(r₁, …, r<sub>N</sub>) 的输入是 N 个位置 = 3N 个数。原因在于波函数必须
    <strong>同时描述“全部电子各自在哪里”这一整件事</strong>——它是“电子 1 在 r₁ 且电子 2 在 r₂ 且…”
    的联合概率幅，每多一个电子就追加它的 3 个坐标。类比：地图上 1 个点要 2 个坐标，
    同时描述 N 个点就要 2N 个。更深一层：电子彼此关联，一般<strong>不能</strong>拆成
    φ₁(r₁)φ₂(r₂)… 的乘积——而乘积形式恰好是第 3 课 KS 替身方案所做的近似。</p>
  </div>
  <div class="dft-qa">
    <p><strong>Q：波函数的输出代表什么意义？</strong></p>
    <p>ψ 本身是复数<strong>概率幅</strong>，没有直接物理意义；|ψ|² 才是概率密度（玻恩规则）。
    具体到多电子：|ψ(r₁,…,r<sub>N</sub>)|² dr₁…dr<sub>N</sub> = 同时找到“电子 1 在 r₁ 附近且 2 在 r₂ 附近且…”的概率。
    一切观测量都经由 ψ 计算（期望值 ⟨O⟩ = ∫ψ*Ôψ），ψ 的相位决定干涉条纹——
    “振幅可叠加相消”正是量子与经典的根本区别。而 DFT 全程不碰这个 3N 维的 ψ，
    只关心由它“压缩”出的密度 ρ（第 2 课）。</p>
  </div>

  <div class="dft-quiz">
    <ol>
      <li>为什么电子不能像行星绕太阳那样用“轨道”描述？</li>
      <li>一句话说清：N 个电子的体系为什么“定律已知却解不动”？</li>
      <li>3N 维是怎么来的？</li>
    </ol>
  </div>
  <details class="dft-answers"><summary>参考答案（点击展开）</summary>
    <ol>
      <li>电子是量子粒子：测不准原理使“位置+速度”的经典轨道失效；波函数及其 |ψ|²（概率密度）才是完备描述。</li>
      <li>N 电子波函数是 3N 维函数且电子间相互耦合，直接求解遭遇指数爆炸（维度灾难）——定律已知，方程解不动。</li>
      <li>每个电子 3 个空间坐标，N 个电子共 3N 维。</li>
    </ol>
  </details>
</section>

<section class="dft-lesson" id="lesson-2">
  <div class="dft-lesson-h"><span class="dft-lesson-n">2</span><h2>从波函数到密度：DFT 的核心思想</h2></div>
  <p class="dft-lesson-goal">目标：理解 DFT 的“降维魔法”：把 3N 维波函数问题换成 3 维密度问题。</p>

  <p>第 1 课的结论是：直接解 N 电子波函数 ψ(r₁, …, r<sub>N</sub>) 是死路（3N 维 + 指数爆炸）。
  1964 年，Hohenberg 和 Kohn 换了一个问题问：<strong>我们真的需要波函数的全部信息吗？</strong></p>

  <h3>Hohenberg-Kohn 定理：密度决定一切</h3>
  <ul>
    <li><strong>HK 定理一</strong>：基态电子密度 ρ(r) 唯一决定外势 V(r)，进而决定哈密顿量、波函数与
      <strong>一切</strong>基态性质。推论：所有性质都是密度的泛函，E = E[ρ]。</li>
    <li><strong>HK 定理二（变分原理）</strong>：能量泛函 E[ρ] 在真实基态密度处取最小值——
      猜一个 ρ 算出的能量永远 ≥ 真实值，调 ρ 让能量最低即可逼近真实。</li>
  </ul>
  <p>密度 ρ(r) 是从波函数“压缩”来的：把 N 电子波函数对其中 N−1 个电子的坐标积分，
  得到 3 维空间里的一个函数——<strong>不管 N 多大，ρ 永远活在普通 3 维空间里，维度灾难消失了</strong>。</p>

  <h3>密度的精确定义</h3>
  <div class="dft-formula"><i>ρ</i>(r) = <i>N</i> ∫ |ψ(r, r₂, …, r<sub>N</sub>)|² d<i>r</i>₂ d<i>r</i>₃ ⋯ d<i>r</i><sub>N</sub></div>
  <p>读法：先取“电子 1 在 r、电子 2 在 r₂、…、电子 N 在 r<sub>N</sub>”的联合概率密度 |ψ|²，
  把其余 N−1 个电子的坐标全部积分掉（不再关心它们在哪），再乘 N（任意一个电子都可能是“在 r 的那个”）。
  于是 ρ(r)dr = 在 r 附近小体积 dr 里找到<strong>任意一个</strong>电子的概率——这叫“边缘概率密度”。
  全空间积分 ∫ρ(r)dr = N（总电子数），单位是“个电子/体积”。</p>

  <div class="dft-qa">
    <p><strong>Q：密度 ρ(r) 是“三维空间某个位置出现 1 个电子的概率”吗？</strong></p>
    <p>几乎对，但有两个限定：① 是“<strong>任意一个</strong>电子”（不是指定哪一个）——所以有因子 N；
    ② 它不关心其他电子在哪（已被积分抹掉）。它是从 3N 维联合概率“边缘化”出来的 3 维密度。
    类比：给体系拍无数张快照，统计每个小格子平均出现几个电子——得到的就是 ρ。
    同一个 ρ 有三种等价写法：从波函数压缩（本课）、KS 轨道 2Σᵢ|φᵢ|²（第 3 课）、
    密度矩阵对角元 2D(x,x)（第 6 课）。</p>
  </div>

  <div class="dft-formula"><i>E</i> = <i>E</i>[<i>ρ</i>]　——能量是密度的泛函</div>

  <h3>顺便学一个词：泛函</h3>
  <p>函数 = 数字 → 数字（f(x) = x²）；<strong>泛函 = 函数 → 数字</strong>（E[ρ]：喂进去一个密度函数，
  吐出来一个能量数字）。类比：BMI 是“身高体重数字”的函数，“全班平均分”是“每个学生成绩”的泛函。</p>

  <div class="dft-analogy">
    <p>要评价一次考试，你不必知道每个学生每道题的答案（波函数），
    只需要一张“每个分数段有多少人”的统计表（密度）——HK 定理说的就是：
    这张统计表的信息量<strong>恰好足够</strong>决定你想知道的一切。</p>
  </div>

  <div class="dft-key">
    <p>DFT 的核心思想 = <strong>换基本变量</strong>：从 3N 维波函数 → 3 维密度。
    定理保证这个替换不损失信息，但留下两个坑：① E[ρ] 的精确形式不知道（尤其动能项）；
    ② 就算知道形式，怎么求最小值。这两个坑由 1965 年的 Kohn-Sham 方案填上（第 3 课）。</p>
  </div>

  <div class="dft-paper">
    <p>论文把 <span class="dft-tip" tabindex="0" data-tip="Kohn-Sham 密度泛函理论">KS-DFT</span> 称为 ab initio 材料模拟的 workhorse，并说它能给出
    “charge density, energy, density of states, and atomic forces”——全是 ρ 的衍生物；
    论文 Eq. (3) 的泊松方程 −(1/4π)∇²φ = ρ + b 更直接展示了“密度是核心变量”。</p>
  </div>

  <div class="dft-quiz">
    <ol>
      <li>HK 定理一的核心结论用一句话说？</li>
      <li>“函数”和“泛函”的区别？</li>
      <li>维度灾难是怎么被绕开的？（3N 维 → 3 维）</li>
    </ol>
  </div>
  <details class="dft-answers"><summary>参考答案（点击展开）</summary>
    <ol>
      <li>基态电子密度 ρ(r) 唯一决定外势，进而决定体系的一切基态性质。</li>
      <li>函数是“数字→数字”；泛函是“函数→数字”（E[ρ] 吃进密度函数、吐出能量数字）。</li>
      <li>无论 N 多大，密度永远是 3 维空间中的函数——维度灾难被“压缩”掉了。</li>
    </ol>
  </details>
</section>

<section class="dft-lesson" id="lesson-3">
  <div class="dft-lesson-h"><span class="dft-lesson-n">3</span><h2>Kohn-Sham 方程：把不可能变成可能</h2></div>
  <p class="dft-lesson-goal">目标：理解 KS 替身方案与自洽迭代（<span class="dft-tip" tabindex="0" data-tip="自洽场迭代：猜密度 → 建势 → 解方程 → 更新密度的循环">SCF</span>）流程。</p>

  <h3>HK 定理留下的坑</h3>
  <p>密度决定一切，但 E[ρ] 的精确形式未知，特别是<strong>动能泛函</strong> T[ρ]。
  历史上 Thomas-Fermi 直接猜 T[ρ] 的形式，精度差到没法做化学——看来动能不能靠“猜密度”。</p>

  <h3>Kohn-Sham 的替身方案（1965）：四步拆解总能</h3>
  <p>真实体系的总能有三项：<strong>E = T + <span class="dft-tip" tabindex="0" data-tip="电子-电子相互作用能">E<sub>ee</sub></span> + <span class="dft-tip" tabindex="0" data-tip="外势能：电子与原子核（外势）的相互作用">E<sub>ext</sub></span></strong>（电子动能 + 电子间相互作用 +
  电子与外势的相互作用）。其中 <span class="dft-tip" tabindex="0" data-tip="外势能：电子与原子核（外势）的相互作用">E<sub>ext</sub></span> = ∫<span class="dft-tip" tabindex="0" data-tip="外势：原子核与赝势产生的势场">V<sub>ext</sub></span>(r)ρ(r)dr 只依赖密度、可直接精确算——先放着不动。
  然后构造一个<strong>假想的无相互作用电子体系</strong>，让它的密度与真实体系完全相同：
  <span class="dft-tip" tabindex="0" data-tip="假想体系的密度（与真实体系相同）">ρ<sub>s</sub></span>(r) = ρ(r)。它的波函数是单电子轨道 φᵢ 的乘积（每个轨道放 2 个电子），动能可以精确算。</p>
  <ol>
    <li><strong>动能拆解</strong>：T = <span class="dft-tip" tabindex="0" data-tip="假想无相互作用体系的精确动能">T<sub>s</sub></span> + (T − <span class="dft-tip" tabindex="0" data-tip="假想无相互作用体系的精确动能">T<sub>s</sub></span>)——<span class="dft-tip" tabindex="0" data-tip="假想无相互作用体系的精确动能">T<sub>s</sub></span> 精确可算（大头），
      (T − <span class="dft-tip" tabindex="0" data-tip="假想无相互作用体系的精确动能">T<sub>s</sub></span>) 是真实动能与它的偏差（不知道）</li>
    <li><strong>电子间相互作用拆解</strong>：<span class="dft-tip" tabindex="0" data-tip="电子-电子相互作用能">E<sub>ee</sub></span> = <span class="dft-tip" tabindex="0" data-tip="哈特里能：电子间经典库仑排斥">E<sub>H</sub></span> + (<span class="dft-tip" tabindex="0" data-tip="电子-电子相互作用能">E<sub>ee</sub></span> − <span class="dft-tip" tabindex="0" data-tip="哈特里能：电子间经典库仑排斥">E<sub>H</sub></span>)——
      <span class="dft-tip" tabindex="0" data-tip="哈特里能：电子间经典库仑排斥">E<sub>H</sub></span> = ½∬ρ(r)ρ(r′)/|r−r′| dr dr′ 是“把电子云当连续电荷”的<strong>经典库仑排斥</strong>，由密度精确算出；
      (<span class="dft-tip" tabindex="0" data-tip="电子-电子相互作用能">E<sub>ee</sub></span> − <span class="dft-tip" tabindex="0" data-tip="哈特里能：电子间经典库仑排斥">E<sub>H</sub></span>) 是量子效应（交换 + 关联），不知道</li>
    <li><strong>两坨“不知道的差”装进同一个垃圾桶</strong>：<span class="dft-tip" tabindex="0" data-tip="交换关联能：DFT 的唯一近似项">E<sub>xc</sub></span> ≡ (T − <span class="dft-tip" tabindex="0" data-tip="假想无相互作用体系的精确动能">T<sub>s</sub></span>) + (<span class="dft-tip" tabindex="0" data-tip="电子-电子相互作用能">E<sub>ee</sub></span> − <span class="dft-tip" tabindex="0" data-tip="哈特里能：电子间经典库仑排斥">E<sub>H</sub></span>)</li>
  </ol>
  <div class="dft-formula">E[ρ] = <span class="dft-tip" tabindex="0" data-tip="假想无相互作用体系的精确动能">T<sub>s</sub></span> + <span class="dft-tip" tabindex="0" data-tip="哈特里能：电子间经典库仑排斥">E<sub>H</sub></span> + <span class="dft-tip" tabindex="0" data-tip="交换关联能：DFT 的唯一近似项">E<sub>xc</sub></span> + <span class="dft-tip" tabindex="0" data-tip="外势能：电子与原子核（外势）的相互作用">E<sub>ext</sub></span></div>
  <div class="dft-key">
    <p>注意：<span class="dft-tip" tabindex="0" data-tip="交换关联能：DFT 的唯一近似项">E<sub>xc</sub></span> 垃圾桶里装的是<strong>两样</strong>东西——①动能的误差，②电子相互作用的非经典部分。
    <span class="dft-tip" tabindex="0" data-tip="外势能：电子与原子核（外势）的相互作用">E<sub>ext</sub></span> 与 <span class="dft-tip" tabindex="0" data-tip="哈特里能：电子间经典库仑排斥">E<sub>H</sub></span> 都是能由密度精确算出的<strong>独立项</strong>，不在“差”里。</p>
  </div>

<h3>从能量到方程：变分法把两者连起来</h3>
  <p>四步拆解给出了“能量账本”，但账本里有一项没法直接算：T<sub>s</sub>[ρ] 只是被<strong>隐含定义</strong>了
  （“同密度无相互作用体系的动能”），并没有一个由 ρ 直接写出的公式（这正是第 2 课说的“动能泛函形式未知”）。
  要算 T<sub>s</sub>，必须把假想体系的单电子轨道 φᵢ 请出来：</p>
  <div class="dft-formula">T<sub>s</sub> = Σᵢ 2∫φᵢ*(−½∇²)φᵢ，　ρ(r) = 2Σᵢ|φᵢ(r)|²</div>
  <p>于是能量从“密度的泛函”变成“轨道的泛函” E[φ₁, φ₂, …]。对它做最小化（第 2 课的变分原理：
  真实基态密度使 E 取最小），在“轨道归一化”的约束下求极值，极值条件整理出来就是一组单电子方程——
  <strong>KS 方程</strong>。有效势的三块分别来自能量账本中三项的变分：E<sub>ext</sub> → V<sub>ext</sub>、
  E<sub>H</sub> → V<sub>H</sub>、E<sub>xc</sub> → V<sub>xc</sub>；T<sub>s</sub> 的变分给出方程里的 −½∇² 项。</p>

  <div class="dft-qa">
    <p><strong>Q：KS 方程像是“突然冒出来”的，它和“四步拆解总能”什么关系？</strong></p>
    <p>四步拆解给出的是<strong>能量账本</strong> E[ρ]；KS 方程是把账本<strong>最小化</strong>时得到的极值条件
    （第 2 课变分原理的落地）。桥梁是<strong>轨道</strong>：T<sub>s</sub> 与 ρ 都必须通过轨道 φᵢ 才能具体写出来，
    能量写成轨道泛函后求极值，极值条件就是 KS 方程；有效势三块对应账本三项的“导数”（变分）。</p>
  </div>

<h3>KS 方程：长得像单电子薛定谔方程</h3>
  <div class="dft-formula">[−½∇² + <i>V</i><sub>eff</sub>(r)] <i>φᵢ</i>(r) = <i>εᵢ</i> <i>φᵢ</i>(r)，　<i>V</i><sub>eff</sub> = <i>V</i><sub>ext</sub> + <i>V</i><sub>H</sub> + <i>V</i><sub>xc</sub></div>
  <p>方程形式可解，但势场依赖解本身（<span class="dft-tip" tabindex="0" data-tip="哈特里势：电子间经典库仑排斥">V<sub>H</sub></span>、<span class="dft-tip" tabindex="0" data-tip="交换关联势：量子多体效应的近似">V<sub>xc</sub></span> 都由 ρ = 2Σᵢ|φᵢ|² 算出）→ 必须<strong>自洽迭代</strong>。</p>

  <h3><span class="dft-tip" tabindex="0" data-tip="自洽场迭代：猜密度 → 建势 → 解方程 → 更新密度的循环">SCF</span>：DFT 计算的骨架</h3>
  <ol>
    <li>猜初始密度 ρ⁰（通常用各原子密度的简单叠加）</li>
    <li>由 ρ 构造有效势 <span class="dft-tip" tabindex="0" data-tip="有效势 = 外势 + 哈特里势 + 交换关联势">V<sub>eff</sub></span>（解泊松方程得 <span class="dft-tip" tabindex="0" data-tip="哈特里势：电子间经典库仑排斥">V<sub>H</sub></span>、算 <span class="dft-tip" tabindex="0" data-tip="交换关联势：量子多体效应的近似">V<sub>xc</sub></span>）</li>
    <li>解 KS 方程 → 轨道 {φᵢ}、能量 {εᵢ}</li>
    <li>由轨道重建新密度 ρ′ = 2Σᵢ|φᵢ|²</li>
    <li>比较新旧密度：收敛就停；不收敛就混合（ρ ← αρ′ + (1−α)ρ）回到第 2 步</li>
  </ol>
  <p>每轮循环叫一次 <strong><span class="dft-tip" tabindex="0" data-tip="自洽场迭代：猜密度 → 建势 → 解方程 → 更新密度的循环">SCF</span> 迭代</strong>——论文所有性能数据都以“秒/<span class="dft-tip" tabindex="0" data-tip="自洽场迭代：猜密度 → 建势 → 解方程 → 更新密度的循环">SCF</span> 迭代”计时，
  收敛判据是相对密度残差小于 5×10⁻⁴。</p>

  <figure class="dft-fig">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="/assets/dft/scf-cycle-dark.png">
      <img src="/assets/dft/scf-cycle.png" alt="SCF 自洽循环流程示意图" loading="lazy">
    </picture>
    <figcaption>图 1：自洽迭代（<span class="dft-tip" tabindex="0" data-tip="自洽场迭代：猜密度 → 建势 → 解方程 → 更新密度的循环">SCF</span>）循环——DFT 计算的骨架</figcaption>
  </figure>

  <h3>唯一的近似：<span class="dft-tip" tabindex="0" data-tip="交换关联能：DFT 的唯一近似项">E<sub>xc</sub></span></h3>
  <ul>
    <li><strong><span class="dft-tip" tabindex="0" data-tip="局部密度近似：把每个点按同密度的均匀电子气处理">LDA</span></strong>：假设每个点 r 的 <span class="dft-tip" tabindex="0" data-tip="交换关联能：DFT 的唯一近似项">E<sub>xc</sub></span> 等于“同密度的均匀电子气”——只依赖局部密度</li>
    <li><strong><span class="dft-tip" tabindex="0" data-tip="广义梯度近似：在 LDA 基础上再加密度梯度">GGA</span></strong>：再加密度梯度 ∇ρ（论文用的就是 <span class="dft-tip" tabindex="0" data-tip="广义梯度近似：在 LDA 基础上再加密度梯度">GGA</span>）——更好，但仍是近似</li>
  </ul>
  <div class="dft-key">
    <p>记住：DFT 的“不精确”几乎全部集中在 <span class="dft-tip" tabindex="0" data-tip="交换关联能：DFT 的唯一近似项">E<sub>xc</sub></span> 这一个泛函上——KS 方案把“不可能精确的多体问题”
    变成了“可解的替身问题 + 一个可以不断改进的近似小项”。</p>
  </div>

  <div class="dft-paper">
    <p>论文 Eq. (1)：H ≡ (−½∇² + <span class="dft-tip" tabindex="0" data-tip="交换关联势：量子多体效应的近似">V<sub>xc</sub></span> + φ + <span class="dft-tip" tabindex="0" data-tip="非局域赝势算符：芯电子+核的等效势">V<sub>nl</sub></span>)ψₙ = λₙψₙ，逐项就是本课的
    动能 + 交换关联势 + 静电势（论文用 φ）+ 非局域<span class="dft-tip" tabindex="0" data-tip="把原子核+惰性芯电子打包成对价电子的平滑等效势">赝势</span>（第 4 课）；ψₙ = KS 轨道、λₙ = 轨道能量，
    N<sub>s</sub> ≈ N<sub>e</sub>/2（自旋简并、Γ 点）。论文 Fig. 2 的流程图就是本课 <span class="dft-tip" tabindex="0" data-tip="自洽场迭代：猜密度 → 建势 → 解方程 → 更新密度的循环">SCF</span> 的超算版。</p>
  </div>

  <div class="dft-quiz">
    <ol>
      <li>KS 体系是“假想的”，凭什么能替代真实体系？（密度相同 → HK 定理保证性质相同）</li>
      <li><span class="dft-tip" tabindex="0" data-tip="交换关联能：DFT 的唯一近似项">E<sub>xc</sub></span> 里装了什么？为什么说 DFT 的误差基本都在它？</li>
      <li><span class="dft-tip" tabindex="0" data-tip="自洽场迭代：猜密度 → 建势 → 解方程 → 更新密度的循环">SCF</span> 为什么要“混合”新旧密度而不是直接全替换？（收敛稳定性）</li>
    </ol>
  </div>
  <details class="dft-answers"><summary>参考答案（点击展开）</summary>
    <ol>
      <li>密度相同 → 由 HK 定理一切基态性质相同 → 替身体系可完全代表真实体系。</li>
      <li><span class="dft-tip" tabindex="0" data-tip="交换关联能：DFT 的唯一近似项">E<sub>xc</sub></span> 打包了真实动能与 <span class="dft-tip" tabindex="0" data-tip="假想无相互作用体系的精确动能">T<sub>s</sub></span> 之差 + 全部非经典电子间相互作用；DFT 的唯一近似就集中在这里（<span class="dft-tip" tabindex="0" data-tip="局部密度近似：把每个点按同密度的均匀电子气处理">LDA</span>/<span class="dft-tip" tabindex="0" data-tip="广义梯度近似：在 LDA 基础上再加密度梯度">GGA</span>）。</li>
      <li>直接全替换会让密度大幅振荡、无法收敛；混合（阻尼）让迭代平稳走向自洽解。</li>
    </ol>
  </details>
</section>

<section class="dft-lesson" id="lesson-4">
  <div class="dft-lesson-h"><span class="dft-lesson-n">4</span><h2>DFT 实际怎么算：离散化与输出量</h2></div>
  <p class="dft-lesson-goal">目标：把 KS 方程落到“计算机怎么算”，认识论文涉及的全部技术名词。</p>

  <h3>连续方程 → 离散方程</h3>
  <p>计算机只能存有限个数，必须把连续空间离散化，两大流派：</p>
  <ul>
    <li><strong>基组</strong>：用有限个基函数展开轨道 φ = Σⱼcⱼχⱼ。
      平面波 PW（VASP/Quantum ESPRESSO/QBox）：谱精度、系统性收敛，但全域离域、并行扩展难；
      局域基组（CP2K 高斯 / SIESTA 数值原子轨道）：省通信，但基组误差难系统控制</li>
    <li><strong>实空间离散</strong>：把空间切网格，用有限差分（FD）/有限元（FE）近似导数。
      FD：RSDFT、PARSEC、SPARC；FE：DFT-FE。<strong>论文走这条路</strong>：
      12 阶有限差分（每方向 12 个邻点）、网格间距 h ≈ 0.4–0.5 <span class="dft-tip" tabindex="0" data-tip="玻尔半径：原子单位制长度单位，1 Bohr ≈ 0.529 Å（氢原子基态轨道半径）">Bohr</span></li>
  </ul>
  <p>论文选实空间 FD 的理由（IV 节）：系统可改进性 + 大规模并行扩展性。</p>

  <h3><span class="dft-tip" tabindex="0" data-tip="把原子核+惰性芯电子打包成对价电子的平滑等效势">赝势</span>：把芯电子打包</h3>
  <p>芯电子（如 Si 的 1s²2s²2p⁶）化学惰性，但波函数剧烈振荡 → 网格必须极密、代价爆炸。
  <strong><span class="dft-tip" tabindex="0" data-tip="把原子核+惰性芯电子打包成对价电子的平滑等效势">赝势</span></strong>把“原子核 + 芯电子”打包成对外层价电子的等效势，波函数变得平滑。
  论文用 <span class="dft-tip" tabindex="0" data-tip="广义梯度近似：在 LDA 基础上再加密度梯度">GGA</span> 模守恒<span class="dft-tip" tabindex="0" data-tip="把原子核+惰性芯电子打包成对价电子的平滑等效势">赝势</span>（ONCV），Eq. (1) 里的 <span class="dft-tip" tabindex="0" data-tip="非局域赝势算符：芯电子+核的等效势">V<sub>nl</sub></span> 就是它的非局域部分。</p>

  <h3>边界条件与采样</h3>
  <p>晶体 = 周期性重复 → 周期边界条件；k 点采样（论文只取 Γ 点，大超胞近似）。
  每轮 <span class="dft-tip" tabindex="0" data-tip="自洽场迭代：猜密度 → 建势 → 解方程 → 更新密度的循环">SCF</span> 还要解泊松方程 −(1/4π)∇²φ = ρ + b（Eq. 3）来得到静电势 φ。</p>

  <h3>DFT 能输出什么（论文全用到了）</h3>
  <table>
    <colgroup>
      <col style="width: 24%">
      <col style="width: 30%">
      <col style="width: 46%">
    </colgroup>
    <thead><tr><th>输出量</th><th>定义 / 公式</th><th>论文里用来做什么</th></tr></thead>
    <tbody>
      <tr><td>电荷密度 ρ</td><td><code>ρ(x) = 2D(x,x)</code></td><td>一切后续量的输入</td></tr>
      <tr><td>带能 E<sub>band</sub></td><td><code>Eq. (11)</code></td><td>体系总能与稳定性</td></tr>
      <tr><td>态密度 <span class="dft-tip" tabindex="0" data-tip="态密度：能量 E 处每单位能量的状态数">DOS</span></td><td><code>Eq. (13)</code></td><td>看能级分布与带隙</td></tr>
      <tr><td>投影态密度 <span class="dft-tip" tabindex="0" data-tip="投影态密度：态密度按原子/轨道分解">PDOS</span></td><td><code>Eq. (14–16)</code></td><td>哪个原子/轨道在贡献</td></tr>
      <tr><td>Bader 电荷</td><td><code>Bader 划分</code></td><td>判断成键与氧化态</td></tr>
      <tr><td>原子力</td><td><code>Hellmann-Feynman</code></td><td>结构优化与分子动力学</td></tr>
    </tbody>
  </table>

  <div class="dft-key">
    <p>精度 ↔ 代价：网格越密（h 越小）越精确，但网格点数 N<sub>d</sub> 越大、越贵。
    论文 h ≈ 0.5 <span class="dft-tip" tabindex="0" data-tip="玻尔半径：原子单位制长度单位，1 Bohr ≈ 0.529 Å（氢原子基态轨道半径）">Bohr</span>（硅）/ 0.4 <span class="dft-tip" tabindex="0" data-tip="玻尔半径：原子单位制长度单位，1 Bohr ≈ 0.529 Å（氢原子基态轨道半径）">Bohr</span>（Li/LGPS）就是精度-代价的折中点。</p>
  </div>

  <div class="dft-paper">
    <p>论文 VI 节的“Applications”全参数清单：12 阶 FD、h、Chebyshev 滤波次数 m = 24、
    缓冲半径 R<sub>buffer</sub> ≈ 8–9.2 <span class="dft-tip" tabindex="0" data-tip="玻尔半径：原子单位制长度单位，1 Bohr ≈ 0.529 Å（氢原子基态轨道半径）">Bohr</span>——学完第 6 课回头看，每个数字都能对上号。</p>
  </div>

  <div class="dft-quiz">
    <ol>
      <li>平面波基组和实空间有限差分各有什么优缺点？论文怎么选？</li>
      <li><span class="dft-tip" tabindex="0" data-tip="把原子核+惰性芯电子打包成对价电子的平滑等效势">赝势</span>的作用一句话？</li>
      <li><span class="dft-tip" tabindex="0" data-tip="态密度：能量 E 处每单位能量的状态数">DOS</span> 和 <span class="dft-tip" tabindex="0" data-tip="投影态密度：态密度按原子/轨道分解">PDOS</span> 的区别？</li>
    </ol>
  </div>
  <details class="dft-answers"><summary>参考答案（点击展开）</summary>
    <ol>
      <li>PW 谱精度、系统性收敛，但全域离域、并行扩展难；局域基组省通信但基组误差难系统控制；实空间 FD 可系统收敛且好扩展——论文选 FD。</li>
      <li>把原子核+惰性芯电子打包成对价电子的平滑等效势，避免用极密网格刻画芯区振荡。</li>
      <li><span class="dft-tip" tabindex="0" data-tip="态密度：能量 E 处每单位能量的状态数">DOS</span> 回答“能量 E 处有多少状态”；<span class="dft-tip" tabindex="0" data-tip="投影态密度：态密度按原子/轨道分解">PDOS</span> 进一步分解到“哪个原子、哪个轨道”。</li>
    </ol>
  </details>
</section>

<section class="dft-lesson" id="lesson-5">
  <div class="dft-lesson-h"><span class="dft-lesson-n">5</span><h2>计算瓶颈：为什么只能算几百几千原子</h2></div>
  <p class="dft-lesson-goal">目标：搞懂 O(N³)/O(N²) 从哪来，建立“长度尺度鸿沟”的直观。</p>

  <h3>大 O 记号速成</h3>
  <p>O(f(N)) = 工作量随 N 的增长率 ≈ f(N)（差常数倍）。<strong>O(N³)：原子数翻倍 → 计算量 ×8</strong>；
  O(N)：翻倍 → ×2。论文语境：N = 原子数，N<sub>d</sub> = 自由度（网格点数，∝N），N<sub>s</sub> = 占据轨道数（∝N）。</p>

  <h3>瓶颈：把 SCF 五步逐个过一遍账单</h3>
  <p>回到第 3 课的 SCF 循环——复杂度分析就按那五步逐条算。先剧透结论：
  <strong>全部 O(N³) 都集中在第 ③ 步</strong>，其余步骤最多 O(N²)。</p>

  <figure class="dft-fig">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="/assets/dft/scf-cycle-dark.png">
      <img src="/assets/dft/scf-cycle.png" alt="SCF 自洽循环流程示意图" loading="lazy">
    </picture>
    <figcaption>图 1（回顾）：SCF 五步循环——O(N³) 瓶颈全部集中在第 ③ 步</figcaption>
  </figure>

  <table>
    <colgroup>
      <col style="width: 30%">
      <col style="width: 42%">
      <col style="width: 28%">
    </colgroup>
    <thead><tr><th>SCF 步骤（第 3 课）</th><th>做什么</th><th>成本</th></tr></thead>
    <tbody>
      <tr><td>① 猜初始密度</td><td>原子密度简单叠加</td><td>O(N<sub>d</sub>)</td></tr>
      <tr><td>② 构造有效势</td><td>泊松求解 + 交换关联势逐点计算</td><td>O(N<sub>d</sub>)–O(N<sub>d</sub>²)</td></tr>
      <tr><td><strong>③ 解 KS 方程</strong></td><td>求 H 的 N<sub>s</sub> 个最低本征对（细节见下）</td><td><strong>O(N<sub>d</sub>·N<sub>s</sub>²) ← 瓶颈</strong></td></tr>
      <tr><td>④ 重建密度</td><td>ρ = 2Σᵢ|φᵢ|²（N<sub>s</sub> 个轨道逐点求和）</td><td>O(N<sub>d</sub>·N<sub>s</sub>)</td></tr>
      <tr><td>⑤ 混合 / 判收敛</td><td>新旧密度混合</td><td>O(N<sub>d</sub>)</td></tr>
    </tbody>
  </table>

  <h3>第 ③ 步的细节：迭代法只做两种操作</h3>
  <p>第 ③ 步的任务是求 H 的 N<sub>s</sub> 个最低本征对。先问能不能直接算：H 是
  N<sub>d</sub>×N<sub>d</sub> 的矩阵（N<sub>d</sub> 百万级），完全对角化要 O(N<sub>d</sub>³)，
  想都别想。剩下的路只有一条：<strong>迭代法</strong>——从不构造、从不求逆 H，
  从头到尾只做两种便宜操作：<strong>把 H 乘到向量上（H×vector）</strong>、
  <strong>向量两两做内积</strong>。H 稀疏（12 阶差分，每格点只连 36 个邻点），
  乘一次 H 是 O(N<sub>d</sub>)，而不是稠密矩阵乘法的 O(N<sub>d</sub>²)。</p>
  <p>问题来了：光靠这两种操作，怎么凑出一个能求 N<sub>s</sub> 个最低本征对的算法？
  答案是四道工序，每一道都在回答一个绕不开的问题；<strong>每答完一个问题，
  它那笔成本也就水落石出</strong>：</p>
  <ol>
    <li><strong>怎么让“乘 H”自己收敛到本征矢？——反复乘（幂迭代）</strong>。把初始向量按本征矢展开
    v₀ = Σₙcₙψₙ：乘一次 H，每个分量被自己的本征值加权一次；乘 k 次，被 λₙᵏ 加权——
    <strong>大本征值的分量指数级胜出</strong>，向量自动“拧”向那个本征矢。</li>
    <li><strong>幂迭代抓到的是“最大”，可占据态是“最低”的那批怎么办？——滤波</strong>。
    把“反复乘 H”换成“反复乘 p(H)”：用多项式 p 在低能区放大、在高能区压制
    （切比雪夫多项式在区间外指数暴涨——第 6 课的伏笔）。作用一次 p<sub>m</sub>(H) =
    <strong>m 次 H×vector</strong>，成本明码标价。</li>
    <li><strong>N<sub>s</sub> 个向量一起迭代会塌缩到同一个态怎么办？——正交化</strong>。
    单向量迭代只收敛到<em>一个</em>本征矢；N<sub>s</sub> 个一起跑，必然全部塌向同一个主导态。
    所以每轮乘完都要把向量块“掰开”、两两正交，让每个向量去追不同的本征态
    （顺带保证数值稳定）——“掰开”就是两两做内积，<strong>N<sub>s</sub>² 次</strong>。</li>
    <li><strong>迭代出来的只是“近似子空间”，怎么取出最好的本征对？——Rayleigh-Ritz 投影</strong>。
    把 H 投影进 N<sub>s</sub> 个向量张成的子空间（ΨᵀHΨ 与 ΨᵀΨ），解这个
    N<sub>s</sub>×N<sub>s</sub> 的小本征问题（便宜，O(N<sub>s</sub>³)），再旋转回原空间——
    用“小对角化”替代 N<sub>d</sub> 维完全对角化，得到“子空间内最优”的本征对近似；
    投影同样是 <strong>N<sub>s</sub>² 个内积</strong>。</li>
  </ol>
  <p>四道工序循环直到收敛。把它们的成本归拢起来，就是第 ③ 步的内部账单——
  果然从头到尾只有两种基本操作：</p>
  <ul>
    <li><strong>H×vector（矩阵乘向量）</strong>：迭代法的唯一原料——方向搜索、残差、滤波全靠 H·v 驱动
    （共轭梯度、Lanczos、切比雪夫滤波都是它的变体）。一次 H·v = O(N<sub>d</sub>)；
    N<sub>s</sub> 个轨道各做一次 = O(N<sub>d</sub>·N<sub>s</sub>)。</li>
    <li><strong>正交化</strong>：N<sub>s</sub> 个轨道必须两两正交。让第 k 个新轨道与前面 k−1 个旧轨道都正交，
    要算 k−1 次内积（每次 O(N<sub>d</sub>)）再修正；全部做完共 1+2+…+(N<sub>s</sub>−1) ≈ N<sub>s</sub>²/2 次内积
    → <strong>O(N<sub>d</sub>·N<sub>s</sub>²)</strong> ← 平方项在这里。</li>
    <li><strong>Rayleigh-Ritz 投影</strong>：每轮迭代末尾把 H 投影到轨道张成的子空间（ΨᵀHΨ），
    同样是 N<sub>s</sub>² 个长度 N<sub>d</sub> 的内积 → O(N<sub>d</sub>·N<sub>s</sub>²)，与正交化同阶。</li>
  </ul>

  <p>于是：一轮 SCF = O(N<sub>d</sub>·N<sub>s</sub>²)，而每轮 SCF 都要做一次第 ③ 步 →
  <strong>总成本 O(N³)</strong>（N<sub>d</sub>、N<sub>s</sub> 都 ∝ N，翻倍 = ×8）。
  内存要存 N<sub>s</sub> 个轨道、每个 N<sub>d</sub> 长 → <strong>O(N²)</strong> 内存墙。</p>

  <div class="dft-analogy">
    <p>H×vector 像“给每个轨道拍一张 H 滤镜照”：一张 O(N<sub>d</sub>) 像素，N<sub>s</sub> 张 = O(N<sub>d</sub>·N<sub>s</sub>)。
    正交化像“新生报到”：第 k 个新生要和前面 k−1 个同学逐一握手（内积）——
    全体握手次数 ≈ N<sub>s</sub>²/2，<strong>平方项就从这里来</strong>。</p>
  </div>

  <div class="dft-paper">
    <p>论文 CheFSI 的四步（滤波 → 投影 → 小本征问题 → 旋转）正是上面这套工序的工程化版本：
    滤波步 = 工序 ①② 合体（反复乘 p<sub>m</sub>(H)），投影 / 求解 / 旋转三步合起来完成正交化 +
    Rayleigh-Ritz（解小本征问题自动给出两两正交的新轨道）。论文 Fig. 2 给 XLSDFT 的每一步
    都列了成本（Chebyshev 滤波 54.5%、投影 17.2%……）——第 6 课看它如何把第 ③ 步这一项
    从 O(N³) 打到 O(N)。</p>
  </div>

<h3>现状（论文 Table II 里程碑）</h3>
  <table>
    <thead><tr><th>代码</th><th>年份</th><th>体系/原子数</th><th>机器</th></tr></thead>
    <tbody>
      <tr><td>QBox</td><td>2006</td><td>Mo / 1k</td><td>BlueGene/L</td></tr>
      <tr><td>RSDFT</td><td>2011</td><td>Si 纳米线 / 107k</td><td>K</td></tr>
      <tr><td>DFT-FE</td><td>2019/2023</td><td>Mg 位错 11k / Mg-Y 74k</td><td>Summit / Frontier</td></tr>
      <tr><td>PARSEC</td><td>2023</td><td>Si/H 团簇 117k–216k</td><td>Frontera / Frontier</td></tr>
      <tr><td>LS3DF</td><td>2024</td><td>块体 Si / 10M（前世界纪录）</td><td>曙光（Sugon）</td></tr>
      <tr><td><strong>XLSDFT</strong></td><td><strong>2026</strong></td><td><strong>Si 100M/200M、Li/LGPS 11M</strong></td><td><strong>LineShine</strong></td></tr>
    </tbody>
  </table>
  <p>常规 O(N³) 代码的“日常”≈ 1000 原子；最大立方标度计算（74k/216k 原子）需要顶级超算——
  结论：常规 DFT 只能覆盖“几纳米”。</p>

  <h3>长度尺度鸿沟（论文 Fig. 1）</h3>
  <p>实验能测的电池界面/相间层：几十纳米 ~ 数微米（<span class="dft-tip" tabindex="0" data-tip="X 射线光电子能谱：测元素化合价与结合能">XPS</span>、ToF-SIMS）；计算能算的：几纳米 →
  <strong>差 2–3 个数量级</strong>，无法把“DFT 算的电子结构观测量”与“实验测的”直接定量对比。</p>
  <p>ML 力场（DeePMD 等）能到百万原子，但<strong>给不出电子结构观测量</strong>
  （能带对齐、电荷转移、<span class="dft-tip" tabindex="0" data-tip="投影态密度：态密度按原子/轨道分解">PDOS</span> 全都没有）——这正是论文 IV-B 论证的缺口。</p>

  <figure class="dft-fig">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="/assets/dft/length-barrier-dark.png">
      <img src="/assets/dft/length-barrier.png" alt="计算与实验的长度尺度对比" loading="lazy">
    </picture>
    <figcaption>图 2：长度尺度鸿沟——旧计算极限 vs 实验相关尺度 vs 本文的首次重合</figcaption>
  </figure>

  <div class="dft-key">
    <p>数学事实：求 N<sub>s</sub> 个“全域离域”的轨道 → 必然 O(N³)。但换个问题：如果只问密度 ρ（局部量），
    是否必须知道每个轨道全域的形状？论文的答案是<strong>不需要</strong>——第 6 课的近视性 + 密度矩阵 + 分而治之。</p>
  </div>

  <div class="dft-quiz">
    <ol>
      <li>用大 O 语言说：为什么原子数翻倍，传统 DFT 计算量要 ×8？</li>
      <li>常规 DFT 的“日常上限”和“超算极限”大约各是多少原子？（约 1k / 约 200k）</li>
      <li>论文说的 length-scale barrier 具体指什么？</li>
    </ol>
  </div>
  <details class="dft-answers"><summary>参考答案（点击展开）</summary>
    <ol>
      <li>O(N³)：N 翻倍 → 2³ = 8 倍。对角化成本 O(N<sub>d</sub>·N<sub>s</sub>²)，而 N<sub>d</sub>、N<sub>s</sub> 都 ∝ N。</li>
      <li>日常 ≈ 1000 原子；立方标度超算极限 ≈ 20 万原子（PARSEC 216k）。</li>
      <li>计算只覆盖几纳米，实验相关界面尺度是几十纳米~微米——差 2–3 个数量级，计算与实验无法直接定量对比。</li>
    </ol>
  </details>
</section>

<section class="dft-lesson" id="lesson-6">
  <div class="dft-lesson-h"><span class="dft-lesson-n">6</span><h2>XLSDFT 方法：O(N³) 是怎么一步步变成 O(N) 的</h2></div>
  <p class="dft-lesson-goal">目标：把第 5 课账单里的每一项，对应到新方法的每一次“换法”，看清成本怎么掉下来。</p>

  <h3>先剧透：三件套各堵一个洞</h3>
  <p>第 5 课的结论是：SCF 五步里<strong>只有第 ③ 步是 O(N³)</strong>，另外还有 O(N²) 的内存墙。
  这一课的三件套全部围着“怎么绕开第 ③ 步的原算法”转，分工如下：</p>
  <ol>
    <li><strong>密度矩阵 D（换变量）</strong>：第 ③ 步贵，是因为它逼着我们求 N<sub>s</sub> 个
    <strong>全域弥散</strong>的轨道；换一个局域的变量，就不用再“伺候”这些轨道。</li>
    <li><strong>近视性 + 分而治之（切空间）</strong>：近视性证明“局域”在物理上成立——发许可证；
    分而治之动手，把“一个规模 N 的大问题”换成“K 个规模固定的小问题”。
    <strong>O(N³) → O(N) 就发生在这里。</strong></li>
    <li><strong>CheFSI（换求解器）</strong>：小问题内部不做完全对角化，改用第 5 课的迭代法
    只求占据子空间，把常数再压小。</li>
  </ol>
  <p>读完全课再回来对照这个分工表，就不会迷路。</p>

  <h3>第一件：换基本变量——密度矩阵 D</h3>
  <p>先想清楚第 ③ 步为什么“切不动”：它要输出 N<sub>s</sub> 个轨道 φ<sub>i</sub>(x)，
  每个都是定义在全空间、长度 N<sub>d</sub> 的向量。轨道是<strong>全域弥散</strong>的
  （第 4 课讲基组时见过：平面波全域弥散，电子可以在整个晶体里跑），求一个轨道就要动员
  整个体系的网格。空间切分对轨道无效——任何子域都“装不下”一个横跨全体系的轨道，
  也就没法“分而治之”。</p>
  <p><strong>那就换一个“装得下”的容器——但先回答“为什么可以换”。两步论证：</strong></p>
  <ol>
    <li><strong>信息不丢</strong>：回到第 3 课，第 ③ 步算出来的轨道，真正被用到的只有一样——
    电荷密度 ρ(x) = 2Σₙ g(λₙ)|ψₙ(x)|²（占据轨道按占据数加权求和）。
    把“占据数”和“轨道”打包成一个矩阵：D(x,x′) = Σₙ g(λₙ) ψₙ(x)ψₙ(x′)，
    它的对角线正好就是 ρ(x) = 2D(x,x)。也就是说，<strong>D 完整携带了“占据子空间 +
    各态占据数”的全部信息</strong>；而第 2 课的 HK 定理说 ρ 决定一切。
    所以从“轨道清单”换成“D”，物理上一分都没丢。</li>
    <li><strong>写法合法</strong>：第 1 条里的打包式不是随手凑的——把 D 放进 H 的本征基里看，
    它就是对角元为 g(λ₁), g(λ₂), … 的对角矩阵；而“函数 g 作用在 H 上”得到的 g(H)，
    在同一个本征基里恰好也是这个对角矩阵。所以 D 可以整体写成算子的函数：</li>
  </ol>
  <div class="dft-formula"><i>D</i> = <i>g</i>(<i>H</i>; <i>μ</i>, <i>σ</i>) = (1 + <i>e</i><sup><span class="frac"><span class="fnum"><i>H</i> − <i>μ</i><i>I</i></span><span class="fden"><i>σ</i></span></span></sup>)⁻¹　（论文 Eq. 2）</div>
  <p>g 是费米-狄拉克占据函数：μ = 化学势（费米能级）、σ = k<sub>B</sub>T 展宽。
  零温时 g(λₙ) 只取 1 或 0——它就是一个“是否占据”的指示器，所以上面的
  ρ(x) = 2Σₙ g(λₙ)|ψₙ(x)|² 和第 3 课的 ρ = 2Σᵢ|φᵢ|² 是<strong>同一个公式</strong>
  （第 3 课把“只对占据态求和”当作默认条件，这里把条件显式写进式子）。加 g 的意义在
  有限温度：金属在零温下的占据数是费米面处的一个硬台阶（不光滑、没法当函数处理），
  用 σ 展宽把它抹成宽度约 σ 的平滑过渡——占据数变成 0 到 1 之间的分数，
  g(H) 才是光滑可算的函数。</p>
  <p>上面的打包式就是论文 Eq. 4 的谱表示。物理图景：把 D 看成一张“两点之间的事务账”——
  <strong>对角元 D(x,x) 是每个点自己的余额（密度的一半，ρ(x) = 2D(x,x)）；
  非对角元 D(x,x′) 是两点之间的往来账，衡量 x 与 x′ 两处电子态的相干/关联</strong>
  （化学上它相当于键级：成键的两原子之间这项大，互不相关的远处这项几乎为零）。</p>
  <p>小结：这一步什么都没丢，只是把“N<sub>s</sub> 个全域轨道”这个装不进任何子域的容器，
  换成了“D”这个新容器。新容器能不能切，看下一件。</p>

  <h3>第二件：切空间——近视性 + 分而治之</h3>
  <h4>近视性：切空间的许可证（Kohn 1996 提出，论文 Ref [20]）</h4>
  <p>但换了变量还不够：D 是 N<sub>d</sub>×N<sub>d</sub> 的大矩阵，看着比轨道还“大”。
  真正让切分合法的是下面这条物理事实：<strong>绝缘体乃至有限温度金属，D 在实空间指数衰减</strong>：</p>
  <div class="dft-formula">|<i>D</i>(x, x′)| ≲ <i>e</i><sup><span class="frac"><span class="fnum">−|x − x′|</span><span class="fden">ξ</span></span></sup></div>
  <p>含义：点 x 处的密度 ρ(x) = 2D(x,x)，只由 x 周围半径约 ξ 范围内的哈密顿量决定；
  <strong>远处的原子动一动，x 处几乎无感</strong>。对比一下：单个轨道 ψₙ 可以全域弥散，
  ψₙ(x)ψₙ(x′) 对远处的两点也可以不小；但把占据态全加起来，各轨道的相位相干相消，
  拼出的 D 却局域——远处那笔“往来账”整体抵消掉了。这正是第 2 课 HK 定理的同一路数——
  我们需要的量（密度）比背后的对象（波函数）简单得多、局域得多。</p>
  <div class="dft-analogy">
    <p>每个学生（轨道）可能满校园跑，但“A 楼与远处 B 楼之间的事务账本”（密度矩阵元）
    随距离指数变薄——只记账本，就不必跟踪每个学生的全程轨迹。
    <strong>“账本越远越薄”这个事实，就是允许我们分楼办公的许可证。</strong></p>
  </div>

  <h4>分而治之：动手——把一个大问题换成 K 个小问题</h4>
  <p>拿到许可证就动手切（论文 Eq. 5-7），四步：</p>
  <ol>
    <li><strong>切</strong>：全域 Ω 切成互不重叠的核心区 {Ω<sub>C</sub><sup>α</sup>}，
    拼起来正好覆盖全域、不重不漏。</li>
    <li><strong>加保温层</strong>：每个核心区外扩一圈厚度 R<sub>buffer</sub> 的缓冲层，
    核心区 + 缓冲层 = 子域 Ω<sup>α</sup>。相邻子域的缓冲层彼此重叠；重叠部分不算数，
    只起“把外界扰动挡在外面”的作用。</li>
    <li><strong>独立求解</strong>：每个子域解自己的小 KS 问题——求局部哈密顿 H<sup>α</sup> 的
    N<sub>s</sub><sup>α</sup> 个最低本征对 {λ<sub>n</sub><sup>α</sup>, ψ<sub>n</sub><sup>α</sup>}。
    子域之间<strong>不通信、完全并行</strong>。</li>
    <li><strong>拼装</strong>：全局 D ≈ Σ<sub>α</sub> p<sup>α</sup> D<sup>α</sup>——
    p<sup>α</sup> 是单位分解：每个点只认领自己所在核心区的那份 D<sup>α</sup>，缓冲层里的贡献丢弃。</li>
  </ol>
  <figure class="dft-fig">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="/assets/dft/dc-partition-dark.png">
      <img src="/assets/dft/dc-partition.png" alt="分而治之子域切分示意图" loading="lazy">
    </picture>
    <figcaption>图 3：分而治之（D&amp;C）——全域切成“核心区+缓冲层”的子域</figcaption>
  </figure>
  <p><strong>为什么可以独立求解而不出错？</strong>靠的正是近视性：核心区内的解只被核心区周围 ξ
  范围内的势影响；只要缓冲层够厚（R<sub>buffer</sub> ≫ ξ，论文取 8–9.2
  <span class="dft-tip" tabindex="0" data-tip="玻尔半径：原子单位制长度单位，1 Bohr ≈ 0.529 Å（氢原子基态轨道半径）">Bohr</span>），
  外界的一切影响都在缓冲层里被“吸收”，进不了核心区 → <strong>核心区内的局部解 ≈ 全域解，
  误差随 R<sub>buffer</sub> 指数收敛</strong>。缓冲层的代价是每个子域算一点重复功，
  换来子域之间零耦合。</p>
  <p><strong>成本为什么从 O(N³) 掉到 O(N)？就一步代数：</strong></p>
  <div class="dft-formula">旧：N<sub>d</sub> × N<sub>s</sub>² = (c₁N) × (c₂N)² = cN³　——　一个规模 N 的问题</div>
  <div class="dft-formula">新：K × [N<sub>d</sub><sup>α</sup> × (N<sub>s</sub><sup>α</sup>)²] = (c₃N) × 常数 = O(N)　——　K 个规模固定的子问题</div>
  <p>关键纪律：<strong>子域大小固定，体系变大只是子域个数 K 变多（K ∝ N）</strong>。
  每个子域的活一样重，活的份数随 N 线性增加——这就是线性标度的全部秘密。
  要是子域大小跟着 N 一起涨，就白切了。</p>

  <h3>第三件：换求解器——CheFSI（小问题内部也别对角化）</h3>
  <p>子域里当然可以老老实实做完全对角化，成本 O((N<sub>d</sub><sup>α</sup>)³)——它是常数，
  不破坏线性标度。但这个常数太大（一个子域也有几万网格点），而且对角化会把
  <strong>所有</strong>本征对都算出来，其中绝大多数是高能空态，我们根本用不上。
  CheFSI（Eq. 8-9）把第 5 课的迭代法直接搬进每个子域，只求“张成占据子空间”的那组基，
  不白算空态。四步：</p>
  <ul>
    <li>① Chebyshev 滤波 Ψ<sub>f</sub> = p<sub>m</sub>(H)Ψ：放大低能占据分量、压制高能分量
    （第 5 课的“滤波”工序），只需 m = 24 次稀疏 H×vector，避免对角化；</li>
    <li>② 投影成小矩阵（ΨᵀHΨ、ΨᵀΨ）；</li>
    <li>③ 解 N<sub>s</sub><sup>α</sup> 维的小广义本征问题；</li>
    <li>④ 子空间旋转，得到新的轨道基。</li>
  </ul>
  <p>子域内每轮迭代 = 滤波 O(m·N<sub>d</sub><sup>α</sup>·N<sub>s</sub><sup>α</sup>) + 投影
  O(N<sub>d</sub><sup>α</sup>·(N<sub>s</sub><sup>α</sup>)²) + 小本征问题 O((N<sub>s</sub><sup>α</sup>)³)——
  还是常数，但比完全对角化小得多；内存也从 O((N<sub>d</sub><sup>α</sup>)²) 降到
  O(N<sub>d</sub><sup>α</sup>·N<sub>s</sub><sup>α</sup>)。</p>

  <h3>核心对照：旧流程的每一步，现在怎么算</h3>
  <p>把第 5 课的 SCF 五步账单和新流程并排放，变化只发生在三处：</p>
  <table>
    <colgroup>
      <col style="width: 19%">
      <col style="width: 29%">
      <col style="width: 33%">
      <col style="width: 19%">
    </colgroup>
    <thead><tr><th>SCF 步骤</th><th>旧流程（第 5 课）</th><th>XLSDFT 新流程</th><th>成本变化</th></tr></thead>
    <tbody>
      <tr><td>① 猜密度</td><td>原子密度简单叠加</td><td>不变</td><td>O(N) → O(N)</td></tr>
      <tr><td>② 构造有效势</td><td>全域静电求和 + 逐点交换关联</td><td>不变，泊松求解改用 AMG 预条件 CG</td><td>O(N)–O(N²) → O(N)</td></tr>
      <tr><td><strong>③ 解 KS 方程</strong></td><td>全域求 N<sub>s</sub> 个最低本征对</td><td>K 个子域独立 CheFSI（近视性保证子域解 ≈ 全域解）</td><td><strong>O(N³) → O(N)</strong></td></tr>
      <tr><td>④ 重建密度</td><td>全域 ρ = 2Σᵢ|φᵢ|²（每个点都遍历全部 N<sub>s</sub> 个轨道）</td><td>每个点只用所在核心区的局部轨道组装</td><td>O(N²) → O(N)</td></tr>
      <tr><td>⑤ 混合/收敛</td><td>新旧密度混合</td><td>不变</td><td>O(N) → O(N)</td></tr>
      <tr><td>内存</td><td>存 N<sub>s</sub> 个 N<sub>d</sub> 长的全域轨道</td><td>各子域只存自己的局部轨道（且不存空态）</td><td>O(N²) → O(N)</td></tr>
    </tbody>
  </table>
  <p>三处变化的理由各不相同：<strong>③</strong> 靠“切”（一个大问题 → K 个小问题）；
  <strong>④</strong> 靠“本地组装”（近视性保证远处的轨道对本地密度贡献为零，不必遍历）；
  <strong>②</strong> 靠求解器换代（AMG 把泊松方程的 O(N²) 静电求和换成 O(N) 迭代）。
  其余步骤本来就不贵，原样保留——这就是“原来的计算流程应用了新方法”的全貌。</p>

  <h3>感受一下差距：从“约 20 亿年”到“18 分钟”</h3>
  <p>假设 1000 原子的常规 DFT（第 5 课的“日常”规模）跑一次要 1 分钟（量级上成立）。
  从 1000 原子到 1 亿原子，N 放大 10⁵ 倍：</p>
  <table>
    <thead><tr><th>方法</th><th>随 N 的放大倍数</th><th>1 亿原子要跑</th></tr></thead>
    <tbody>
      <tr><td>旧流程 O(N³)</td><td>(10⁵)³ = 10¹⁵ 倍</td><td>10¹⁵ 分钟 ≈ 20 亿年</td></tr>
      <tr><td>新流程 O(N)（单机）</td><td>10⁵ 倍</td><td>10⁵ 分钟 ≈ 70 天</td></tr>
      <tr><td><strong>新流程 + 2 万节点并行（论文实测）</strong></td><td>—</td><td><strong>1082 秒 ≈ 18 分钟（Si 100M）</strong></td></tr>
    </tbody>
  </table>
  <p>O(N³) 和 O(N) 的差距不是“快一点”，而是“永远等不到”和“喝杯茶”的差距——
  这就是论文敢说 extreme-scale 的底气。</p>

  <h3>论文的实际账单（Fig. 2）</h3>
  <table>
    <thead><tr><th>SCF 步骤</th><th>成本（论文 Fig. 2）</th></tr></thead>
    <tbody>
      <tr><td>构造 V<sub>eff</sub>[ρ]</td><td>O(N)</td></tr>
      <tr><td>限制 V<sub>eff</sub> 到各子域</td><td>O(N)</td></tr>
      <tr><td>Chebyshev 滤波（×K 子域）</td><td>O(N)（占 54.5% 耗时）</td></tr>
      <tr><td>投影 / 子空间旋转</td><td>O(N)</td></tr>
      <tr><td>化学势 μ</td><td>O(N)</td></tr>
      <tr><td>更新 ρ、混合与预条件</td><td>O(N)</td></tr>
      <tr><td>输出能量/DOS/力</td><td>O(N)</td></tr>
    </tbody>
  </table>
  <p>上表每一行都能对上上一节的对照表：<strong>子域个数 ∝ N，每个子域成本固定
  （子域大小不随 N 增大）→ 总 O(N)、内存 O(N)</strong>。
  观测量组装（Eq. 10-16：ρ、E<sub>band</sub>、<span class="dft-tip" tabindex="0" data-tip="态密度：能量 E 处每单位能量的状态数">DOS</span>、<span class="dft-tip" tabindex="0" data-tip="投影态密度：态密度按原子/轨道分解">PDOS</span>）全部用局部本征对 + 内部权重 c<sub>n</sub><sup>α</sup>，同样 O(N)。
  泊松方程用 AMG 预条件 CG 求解，O(N) 替代传统 O(N²) 静电求和。</p>

  <div class="dft-paper">
    <p>诚实说明：密度矩阵、D&amp;C、CheFSI 都不是本论文的新发明（文献里各自都有）。论文的贡献是
    把三者组装成一套能在 20,480 节点上弱扩展、并首次覆盖金属-绝缘多元素界面的完整流程
    （IV-B / IV-C 论证的缺口，第 7 课展开）。</p>
  </div>

  <div class="dft-key">
    <p>O(N³) → O(N) 的三个关键换法（正好对应上面第一、二、三件）：① 变量：轨道 → 密度矩阵（局域）；
    ② 切分：全域对角化 → 子域独立求解（缓冲层保精度）；
    ③ 求解器：完全对角化 → CheFSI（只求占据子空间）。
    <strong>三者缺一不可</strong>：不换变量，轨道全域弥散、子域装不下；不切分，问题规模还是 N；
    子域内仍做完全对角化，常数爆炸、内存回不来。</p>
  </div>

  <div class="dft-quiz">
    <ol>
      <li>近视性说的是“谁”随距离指数衰减——轨道还是密度矩阵？</li>
      <li>缓冲层 R<sub>buffer</sub> 起什么作用？</li>
      <li>旧流程第 ③ 步的 O(N³)，是经过哪两次“换法”变成 O(N) 的？</li>
      <li>子域大小必须守什么纪律，线性标度才不会破功？</li>
      <li>一句话总结 O(N³) → O(N) 的三个换法。</li>
    </ol>
  </div>
  <details class="dft-answers"><summary>参考答案（点击展开）</summary>
    <ol>
      <li>密度矩阵：D(x,x′) 随 |x−x′| 指数衰减；单个轨道 ψₙ 可以全域弥散。</li>
      <li>把外界影响挡在核心区之外，让子域在核心区内的局部解逼近全局解（误差随 R<sub>buffer</sub> 指数收敛）——代价是子域间少量重复计算。</li>
      <li>① 换变量：全域弥散的轨道 → 局域的密度矩阵（近视性发许可证）；② 切分：一个规模 N 的全域本征问题 → K 个规模固定的子域本征问题（子域内用 CheFSI 只求占据子空间）。总成本 = K × 常数 = O(N)。</li>
      <li>子域大小固定、不随体系增大；体系变大只能增加子域个数 K。</li>
      <li>变量（轨道→密度矩阵）、切分（全局→D&amp;C 子域）、求解器（对角化→CheFSI）。</li>
    </ol>
  </details>
</section>

<section class="dft-lesson" id="lesson-7">
  <div class="dft-lesson-h"><span class="dft-lesson-n">7</span><h2>论文全貌串读：从问题到结果</h2></div>
  <p class="dft-lesson-goal">目标：把 1–6 课串起来，能独立复述论文主线（教学验收）。</p>

  <h3>科学问题：全固态电池的界面之痛</h3>
  <p>LGPS（Li₁₀GeP₂S₁₂）是室温离子电导率纪录级的固态电解质，但<strong>与锂金属接触即发生还原分解</strong>，
  界面长出电阻层并随循环增厚 → 商业化被卡。<span class="dft-tip" tabindex="0" data-tip="X 射线光电子能谱：测元素化合价与结合能">XPS</span> 实验看到“界面有低化合价 Ge、P”，但原子级机理与
  产物空间分布看不清；而界面相间层厚几十纳米（论文模型 57×44×90 nm），常规 DFT 只能算几纳米。
  缺口（IV-C）：O(N³) 墙 + 现有 O(N) 方法不支持金属-绝缘多元素界面 + ML 力场给不出电子结构观测量。</p>

  <h3>方法链：三阶段工作流 + 三件套 + 硬件</h3>
  <ul>
    <li><strong>三阶段工作流</strong>：① MLFF-MD（DeePMD）生成 1100 万原子平衡结构（300 K）→
      ② XLSDFT 算电子结构 → ③ <span class="dft-tip" tabindex="0" data-tip="X 射线光电子能谱：测元素化合价与结合能">XPS</span> 交叉验证</li>
    <li><strong>算法三件套</strong>（第 6 课）：密度矩阵 + 近视性/D&amp;C（R<sub>buffer</sub> ≈ 8–9.2 <span class="dft-tip" tabindex="0" data-tip="玻尔半径：原子单位制长度单位，1 Bohr ≈ 0.529 Å（氢原子基态轨道半径）">Bohr</span>）+ CheFSI（m = 24）</li>
    <li><strong>实现</strong>：LineShine 超算（ARM LX2：304 核/节点 + 8 堆 HBM + SVE/SME）；
      自研 BLAS/LAPACK 省 ~1 GB HBM/NUMA；SVE 优化 stencil 提速 3.2×；AMG 预条件泊松求解
      （FP32 预条件 + FP64 外层）；全 FP64 主导，FP32/FP16 仅限辅助</li>
  </ul>

  <figure class="dft-fig">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="/assets/dft/workflow-dark.png">
      <img src="/assets/dft/workflow.png" alt="三阶段多尺度工作流示意图" loading="lazy">
    </picture>
    <figcaption>图 4：三阶段多尺度工作流——从结构生成到实验互证</figcaption>
  </figure>

  <h3>性能结果（论文 Table III）</h3>
  <table>
    <thead><tr><th>指标</th><th>Si 100M</th><th>Si 200M</th><th>Li/LGPS 11M</th></tr></thead>
    <tbody>
      <tr><td>SCF 迭代次数</td><td>7</td><td>7</td><td>167</td></tr>
      <tr><td>总耗时（秒）</td><td>1082.7</td><td>2280.4</td><td>6936.2</td></tr>
      <tr><td>秒/SCF 迭代</td><td>71.2</td><td>143.7</td><td>36.4</td></tr>
      <tr><td>持续 CheFSI（Pflop/s）</td><td><strong>157.9</strong></td><td>157.6</td><td>96.8</td></tr>
      <tr><td>投影 / 旋转（Eflop/s）</td><td>1.20 / 1.31</td><td>1.20 / 1.28</td><td>0.10 / 0.57</td></tr>
    </tbody>
  </table>
  <ul>
    <li>弱扩展：5.24M@1024 节点 → 104.86M@20480 节点，<strong>96.6% 效率</strong>，71.2 s/<span class="dft-tip" tabindex="0" data-tip="自洽场迭代：猜密度 → 建势 → 解方程 → 更新密度的循环">SCF</span></li>
    <li>强扩展：固定 5.24M 原子，81.3% 效率（68.8 → 4.2 s/<span class="dft-tip" tabindex="0" data-tip="自洽场迭代：猜密度 → 建势 → 解方程 → 更新密度的循环">SCF</span>）</li>
    <li>内存 O(N)：200M 原子跑在同样 20480 节点（省出的 HBM 是关键）</li>
    <li>前世界纪录：LS3DF 10M 原子（2024）→ 本工作 100M/200M，<strong>超一个量级</strong></li>
  </ul>

  <h3>科学结果：计算与实验的首次定量互证</h3>
  <p>11,325,600 原子 Li/LGPS/Li 界面（90×44×57 nm），<span class="dft-tip" tabindex="0" data-tip="自洽场迭代：猜密度 → 建势 → 解方程 → 更新密度的循环">SCF</span> 收敛（167 次迭代）。<span class="dft-tip" tabindex="0" data-tip="投影态密度：态密度按原子/轨道分解">PDOS</span> 分析显示：
  <strong>低化合价 Ge、P 富集于界面</strong>，向体相衰减（类体相恢复 Ge⁴⁺/PS₄³⁻），且面内不均匀。
  <span class="dft-tip" tabindex="0" data-tip="X 射线光电子能谱：测元素化合价与结合能">XPS</span> 深度剖析（0/20/50 min Ar⁺ 溅射 = 界面/亚界面/类体相）独立验证同样的界面→体相趋势 ✅。
  计算还额外解析了实验难测的面内异质性。结论给电池设计指明目标：
  <strong>抑制界面还原 + 阻断电子泄漏</strong>。</p>

  <div class="dft-key">
    <p>论文的意义（VIII 节）：移除了几十年的“长度尺度障碍”——DFT 可算尺度（几十纳米）首次与
    实验可测尺度重合，“物理上相关”与“计算上可达”第一次同时满足；O(N) <span class="dft-tip" tabindex="0" data-tip="Kohn-Sham 密度泛函理论">KS-DFT</span> 是可部署工具
    而非一次性演示，为数字-物理闭环材料发现铺路。</p>
  </div>

  <div class="dft-quiz">
    <ol>
      <li>论文要解决的科学问题是什么？</li>
      <li>方法上三个核心创新各解决什么问题？</li>
      <li>两个世界纪录是什么？</li>
      <li>为什么 <span class="dft-tip" tabindex="0" data-tip="X 射线光电子能谱：测元素化合价与结合能">XPS</span> 对比如此关键？</li>
    </ol>
  </div>
  <details class="dft-answers"><summary>参考答案（点击展开）</summary>
    <ol>
      <li>全固态电池 Li/LGPS 界面还原分解的机理与产物分布：实验（<span class="dft-tip" tabindex="0" data-tip="X 射线光电子能谱：测元素化合价与结合能">XPS</span>）看不清原子级细节，常规 DFT 算不到几十纳米的界面。</li>
      <li>密度矩阵+近视性 → 允许局部化；D&C → 把问题切成独立子域；CheFSI → 每子域 O(1) 求解 → 总 O(N)。</li>
      <li>① 100M/200M 原子硅（超 LS3DF 10M 前纪录一个量级，157.9 Pflop/s）；② 11M 原子电池界面（超越复杂界面 DFT 现状 1000×）。</li>
      <li>首次在实验相关尺度上实现 DFT 计算与实验的定量交叉验证（计算 <span class="dft-tip" tabindex="0" data-tip="投影态密度：态密度按原子/轨道分解">PDOS</span> 趋势与 <span class="dft-tip" tabindex="0" data-tip="X 射线光电子能谱：测元素化合价与结合能">XPS</span> 深度剖析一致）。</li>
    </ol>
  </details>
</section>

<section class="dft-lesson" id="glossary">
  <div class="dft-lesson-h"><span class="dft-lesson-n">§</span><h2>术语卡片</h2></div>
  <dl class="dft-glossary">
    <div class="dft-def"><dt>波函数 ψ</dt><dd>描述量子粒子状态的函数；|ψ|² = 概率密度</dd></div>
    <div class="dft-def"><dt>薛定谔方程</dt><dd>Ĥψ = Eψ：找“能量确定的特殊状态”的方程</dd></div>
    <div class="dft-def"><dt>维度灾难</dt><dd>N 电子波函数是 3N 维函数，直接求解指数爆炸</dd></div>
    <div class="dft-def"><dt>电子密度 ρ(r)</dt><dd>3 维函数；HK 定理证明它决定一切</dd></div>
    <div class="dft-def"><dt>Kohn-Sham 方程</dt><dd>同密度无相互作用体系的单电子方程</dd></div>
    <div class="dft-def"><dt>交换关联 <span class="dft-tip" tabindex="0" data-tip="交换关联能：DFT 的唯一近似项">E<sub>xc</sub></span></dt><dd>DFT 唯一近似；<span class="dft-tip" tabindex="0" data-tip="局部密度近似：把每个点按同密度的均匀电子气处理">LDA</span>/<span class="dft-tip" tabindex="0" data-tip="广义梯度近似：在 LDA 基础上再加密度梯度">GGA</span></dd></div>
    <div class="dft-def"><dt><span class="dft-tip" tabindex="0" data-tip="自洽场迭代：猜密度 → 建势 → 解方程 → 更新密度的循环">SCF</span> 自洽迭代</dt><dd>猜密度→建势→解方程→更新密度的循环</dd></div>
    <div class="dft-def"><dt>O(N³)</dt><dd>对角化成本：原子翻倍，计算量 ×8</dd></div>
    <div class="dft-def"><dt>密度矩阵 D</dt><dd>基本变量；对角元 = 密度</dd></div>
    <div class="dft-def"><dt>近视性</dt><dd>D(x,x′) 随距离指数衰减 → 可局部化</dd></div>
    <div class="dft-def"><dt>D&amp;C 分而治之</dt><dd>核心区+缓冲层子域独立求解</dd></div>
    <div class="dft-def"><dt>CheFSI</dt><dd>切比雪夫滤波：不求对角化，只求占据子空间</dd></div>
    <div class="dft-def"><dt><span class="dft-tip" tabindex="0" data-tip="态密度：能量 E 处每单位能量的状态数">DOS</span> / <span class="dft-tip" tabindex="0" data-tip="投影态密度：态密度按原子/轨道分解">PDOS</span></dt><dd>（投影）态密度：能级分布 / 按原子分解</dd></div>
    <div class="dft-def"><dt><span class="dft-tip" tabindex="0" data-tip="X 射线光电子能谱：测元素化合价与结合能">XPS</span></dt><dd>X 射线光电子能谱：测化合价与结合能</dd></div>
  </dl>
</section>
