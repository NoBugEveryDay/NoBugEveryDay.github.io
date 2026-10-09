/*!
 * 鲸鱼娘看板娘（博客版）· Whale Girl mascot for the blog
 *
 * 改编自 Andersen216/dsh-whale-girl-live2d（代码 MIT），
 * 模型美术 © 上善无形 / ZipZipPipe / 氵六青（CC BY-NC-SA 4.0，署名-非商业-相同方式共享）。
 * 运行时自托管于 /live2d/vendor/：PIXI.js 6.5.10 (MIT) · Live2D Cubism Core (Live2D Inc.) ·
 * pixi-live2d-display (MIT)。许可详情见 /live2d/NOTICE.md 与 /live2d/AUTHORS.md。
 *
 * 配置来自 window.__MASCOT__（由站点 BaseLayout 注入），结构：
 * { enabled, height, lines: [气泡台词...] }
 */
(function () {
  'use strict';
  if (window.__MASCOT_LOADED__) return;
  window.__MASCOT_LOADED__ = true;

  var CFG = Object.assign(
    {
      enabled: true,
      height: 320, // 画布目标高度（CSS px，桌面）
      lines: [],
    },
    window.__MASCOT__ || {},
  );
  if (!CFG.enabled) return;
  // 尊重无障碍：用户要求减少动态效果时不渲染
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var BASE = '/live2d';
  var DEFAULT_LINES = [
    '欢迎来看博客~ 🐋',
    '有问题欢迎在评论区留言~',
    '新博客由鲸鱼娘维护，详情见公告：/blog-now-maintained-by-ai/',
    '生命不息，折腾不止！',
    '点击我可以换个动作哦~',
  ];
  var LINES = (CFG.lines && CFG.lines.length ? CFG.lines : DEFAULT_LINES).slice();
  var CLICK_MOTIONS = ['selfieQuick', 'openLid', 'splash', 'aidale'];
  var STORE_KEY = 'whalepet-state';
  var mobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 640;

  var app = null;
  var model = null;
  var wrap = null;
  var box = null;
  var bubble = null;
  var bubbleTimer = null;
  var dragging = false;
  var dragOff = null;
  var modelW = 0; // 实际画布宽（模型约 320×320 正方形，加载后确定）
  var modelH = 0;
  var state = { x: null, y: null, hidden: false, h: CFG.height };
  try {
    var saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (saved && typeof saved === 'object') {
      if (typeof saved.x === 'number') state.x = saved.x;
      if (typeof saved.y === 'number') state.y = saved.y;
      if (typeof saved.hidden === 'boolean') state.hidden = saved.hidden;
    }
  } catch (e) {}

  // ── DOM 骨架 ──
  function buildDom() {
    wrap = document.createElement('div');
    wrap.id = 'whalepet-wrap';
    wrap.style.cssText =
      'position:fixed;z-index:2147483000;bottom:0;right:0;line-height:0;user-select:none;-webkit-user-select:none;';

    box = document.createElement('div');
    box.id = 'whalepet-box';
    box.style.cssText = 'position:relative;cursor:grab;touch-action:none;';
    wrap.appendChild(box);

    bubble = document.createElement('div');
    bubble.id = 'whalepet-bubble';
    bubble.style.cssText =
      'display:none;position:absolute;left:50%;transform:translateX(-50%);bottom:calc(100% + 8px);' +
      'background:#ffffff;color:#24292f;border:1px solid #d8dee4;border-radius:10px;' +
      'padding:7px 13px;font-size:13px;line-height:1.55;max-width:230px;' +
      'box-shadow:0 4px 14px rgba(0,0,0,.14);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",' +
      '"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;white-space:normal;' +
      'text-align:left;pointer-events:none;';
    box.appendChild(bubble);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = '✕';
    btn.title = '隐藏鲸鱼娘';
    btn.setAttribute('aria-label', '隐藏鲸鱼娘');
    btn.style.cssText =
      'position:absolute;top:2px;right:2px;width:22px;height:22px;border:none;border-radius:50%;' +
      'background:rgba(0,0,0,.28);color:#fff;font-size:12px;line-height:1;cursor:pointer;' +
      'opacity:0;transition:opacity .15s;';
    box.appendChild(btn);
    box.addEventListener('mouseenter', function () {
      btn.style.opacity = '1';
    });
    box.addEventListener('mouseleave', function () {
      btn.style.opacity = '0';
    });
    // 触屏设备没有 hover，隐藏按钮常显
    if (window.matchMedia && window.matchMedia('(hover: none)').matches) {
      btn.style.opacity = '0.9';
    }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      hide(true);
    });

    // 隐藏后的恢复把手
    var handle = document.createElement('button');
    handle.type = 'button';
    handle.id = 'whalepet-handle';
    handle.textContent = '🐋';
    handle.title = '唤出鲸鱼娘';
    handle.setAttribute('aria-label', '唤出鲸鱼娘');
    handle.style.cssText =
      'display:none;position:fixed;bottom:10px;right:10px;z-index:2147483000;' +
      'width:40px;height:40px;border:none;border-radius:50%;background:#ffffffcc;' +
      'font-size:20px;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.18);';
    handle.addEventListener('click', function () {
      hide(false);
    });

    document.body.appendChild(wrap);
    document.body.appendChild(handle);
  }

  function hide(on) {
    state.hidden = on;
    wrap.style.display = on ? 'none' : 'block';
    var handle = document.getElementById('whalepet-handle');
    if (handle) handle.style.display = on ? 'block' : 'none';
    saveState();
  }

  function saveState() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function showBubble(text, ttl) {
    if (!bubble) return;
    bubble.textContent = text;
    bubble.style.display = 'block';
    if (bubbleTimer) clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(function () {
      bubble.style.display = 'none';
    }, ttl || 3200);
  }

  function sayRandom() {
    showBubble(LINES[Math.floor(Math.random() * LINES.length)]);
  }

  function playClickMotion() {
    if (!model) return;
    var group = CLICK_MOTIONS[Math.floor(Math.random() * CLICK_MOTIONS.length)];
    try {
      model.motion(group);
    } catch (e) {}
  }

  // ── 脚本按需加载 ──
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = function () {
        reject(new Error('加载失败: ' + src));
      };
      document.head.appendChild(s);
    });
  }

  // ── 布局与交互 ──
  function targetHeight() {
    return mobile ? Math.round(CFG.height * 0.55) : CFG.height;
  }

  function applyPosition() {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    // 画布宽：未加载前按高度估算，加载后用实际值（模型为 320×320 正方形）
    var cw = modelW || Math.round(targetHeight() * 1.6);
    var ch = modelH || targetHeight();
    if (state.x === null || state.y === null) {
      state.x = vw - cw - 4; // 默认右下角
      state.y = vh - ch - 4;
    }
    // 夹回视口：保留至少 60px 可见（避免完全拖出屏幕）
    state.x = Math.max(-cw + 60, Math.min(state.x, vw - 60));
    state.y = Math.max(0, Math.min(state.y, vh - 60));
    wrap.style.left = state.x + 'px';
    wrap.style.top = state.y + 'px';
    wrap.style.right = 'auto';
    wrap.style.bottom = 'auto';
    saveState();
  }

  function wireDrag() {
    box.addEventListener('pointerdown', function (e) {
      if (e.target && e.target.tagName === 'BUTTON') return;
      dragging = true;
      dragOff = { x: e.clientX - state.x, y: e.clientY - state.y };
      box.style.cursor = 'grabbing';
      box.setPointerCapture && box.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    box.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      state.x = e.clientX - dragOff.x;
      state.y = e.clientY - dragOff.y;
      wrap.style.left = state.x + 'px';
      wrap.style.top = state.y + 'px';
    });
    box.addEventListener('pointerup', function (e) {
      if (!dragging) return;
      dragging = false;
      box.style.cursor = 'grab';
      // 贴边吸附：靠左/右墙则吸过去，竖直保持
      if (state.x < window.innerWidth * 0.3) state.x = 0;
      else if (state.x > window.innerWidth * 0.7) state.x = window.innerWidth - (modelW || 320);
      applyPosition();
    });
    // 点击（非拖动）：气泡 + 随机动作
    box.addEventListener('click', function (e) {
      if (dragging || (e.target && e.target.tagName === 'BUTTON')) return;
      sayRandom();
      if (Math.random() < 0.5) playClickMotion();
    });
  }

  // ── 渲染 ──
  async function boot() {
    buildDom();
    if (!window.Live2DCubismCore) await loadScript(BASE + '/vendor/live2dcubismcore.min.js');
    if (!window.PIXI) await loadScript(BASE + '/vendor/pixi.min.js');
    if (!window.PIXI || !window.PIXI.live2d) await loadScript(BASE + '/vendor/cubism4.min.js');
    if (!window.PIXI || !window.PIXI.live2d) throw new Error('Live2D 运行时未就绪');

    app = new PIXI.Application({
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      powerPreference: 'low-power',
      resolution: Math.min(window.devicePixelRatio || 1, 1.5),
    });
    app.ticker.maxFPS = 30;
    box.appendChild(app.view);

    var Live2DModel = PIXI.live2d.Live2DModel;
    Live2DModel.registerTicker(PIXI.Ticker);
    model = await Live2DModel.from(BASE + '/model/c_0120.model3.json', {
      autoInteract: false,
      autoUpdate: true,
      idleMotionGroup: 'idle',
    });
    app.stage.addChild(model);

    // 缩放适配：目标高度 -> 画布尺寸
    var iw = model.internalModel.width;
    var ih = model.internalModel.height;
    var h = targetHeight();
    var scale = h / ih;
    var w = Math.round(iw * scale);
    app.renderer.resize(w, h);
    model.scale.set(scale);
    model.position.set(0, 0);
    modelW = w;
    modelH = h;

    applyPosition();
    wireDrag();
    if (!state.hidden) wrap.style.display = 'block';

    // 就绪标记：供无头环境/截图工具程序化核验（模型是否加载、画布尺寸）
    wrap.dataset.ready = '1';
    wrap.dataset.wh = w + 'x' + h;
    wrap.dataset.model = 'whale-girl';

    // 视线跟随
    window.addEventListener('pointermove', function (e) {
      if (!model || dragging) return;
      var rect = app.view.getBoundingClientRect();
      var lx = (e.clientX - rect.left) / rect.width;
      var ly = (e.clientY - rect.top) / rect.height;
      try {
        model.focus(lx * iw, ly * ih);
      } catch (err) {}
    });

    // 切后台暂停渲染
    document.addEventListener('visibilitychange', function () {
      if (!app) return;
      if (document.hidden) app.ticker.stop();
      else app.ticker.start();
    });

    // 窗口变化：夹回视口；跨移动端断点时重新适配画布
    window.addEventListener('resize', function () {
      var th = targetHeight();
      if (model && modelH && Math.abs(th - modelH) > 10) {
        var iw2 = model.internalModel.width;
        var ih2 = model.internalModel.height;
        var sc2 = th / ih2;
        var w2 = Math.round(iw2 * sc2);
        app.renderer.resize(w2, th);
        model.scale.set(sc2);
        modelW = w2;
        modelH = th;
      }
      applyPosition();
    });

    // 首次出现打个招呼（延迟，避免和页面加载抢）
    setTimeout(function () {
      showBubble('大家好，我是鲸鱼娘 🐳', 3600);
    }, 1600);
  }

  // 懒启动：空闲回调或 1.2s 后，绝不阻塞首屏
  function start() {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(function () {
        boot().catch(function (err) {
          console.warn('[whalepet] 初始化失败:', err);
          window.whalepetError = err;
          if (wrap) wrap.dataset.error = String(err.message || err);
        });
      }, { timeout: 2500 });
    } else {
      setTimeout(function () {
        boot().catch(function (err) {
          console.warn('[whalepet] 初始化失败:', err);
          window.whalepetError = err;
          if (wrap) wrap.dataset.error = String(err.message || err);
        });
      }, 1200);
    }
  }

  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start);
})();
