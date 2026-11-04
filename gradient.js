/* ============================================
   首页 · 生态梯度动线
   两层视差（translate3d） + 站点切换粒子
   ============================================ */
(function () {
  'use strict';

  var sections = Array.prototype.slice.call(document.querySelectorAll('.station'));
  if (!sections.length) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 两层视差 ---------- */
  var ticking = false;

  function applyParallax() {
    ticking = false;
    var vh = window.innerHeight;

    sections.forEach(function (sec) {
      var rect = sec.getBoundingClientRect();
      // 跳过视口外的站，节省性能
      if (rect.bottom < -80 || rect.top > vh + 80) return;

      // progress: 站在视口中滚过的进度 0→1
      var progress = (vh - rect.top) / (vh + rect.height);
      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;

      // 远景慢：偏移小；前景快：偏移大且反向
      var far = (0.5 - progress) * 90;
      var front = (0.5 - progress) * -320;

      var farEl = sec.querySelector('.layer-far');
      var frontEl = sec.querySelector('.layer-front');
      if (farEl) farEl.style.transform = 'translate3d(0, ' + far.toFixed(1) + 'px, 0)';
      if (frontEl) frontEl.style.transform = 'translate3d(0, ' + front.toFixed(1) + 'px, 0)';
    });

    detectStation(vh);
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(applyParallax);
    }
  }

  /* ---------- 粒子：站点切换瞬间的萤火 ---------- */
  var canvas = document.getElementById('gradient-fireflies');
  var ctx = canvas ? canvas.getContext('2d') : null;
  var particles = [];
  var particleRaf = null;
  var activeStation = -1;

  function sizeCanvas() {
    if (!canvas) return;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function burst(color) {
    if (!ctx) return;
    var w = window.innerWidth;
    var h = window.innerHeight;
    var count = 34 + Math.floor(Math.random() * 10);

    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5 - 0.15, // 微微上飘
        r: 0.8 + Math.random() * 2.2,
        life: 1,
        // 存活 1–2 秒
        decay: 1 / (60 * (1 + Math.random()))
      });
    }

    drawParticles(color);
  }

  function drawParticles(color) {
    if (particleRaf) return; // 已有循环在跑

    function frame() {
      var w = window.innerWidth;
      var h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      ctx.save();
      ctx.shadowBlur = 14;
      ctx.shadowColor = color;
      ctx.fillStyle = color;

      particles = particles.filter(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) return false;

        ctx.globalAlpha = Math.min(p.life, 1) * 0.9;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      ctx.restore();

      if (particles.length) {
        particleRaf = window.requestAnimationFrame(frame);
      } else {
        particleRaf = null;
        ctx.clearRect(0, 0, w, h);
      }
    }

    particleRaf = window.requestAnimationFrame(frame);
  }

  function detectStation(vh) {
    var current = -1;
    for (var i = 0; i < sections.length; i++) {
      var rect = sections[i].getBoundingClientRect();
      if (rect.top <= vh / 2 && rect.bottom > vh / 2) {
        current = i;
        break;
      }
    }
    if (current !== activeStation && current !== -1) {
      var isNew = activeStation !== -1;
      activeStation = current;
      // 首屏不触发粒子，仅切站时短暂出现 1–2 秒
      if (isNew && !reducedMotion) {
        burst(sections[current].getAttribute('data-accent') || '#8fe0b4');
      }
    }
    updateRail(current);
  }

  /* ---------- 海拔梯度指示线：当前站圆点提亮 ---------- */
  var rail = document.querySelector('.elevation-rail');
  var dotsByStation = [];
  if (rail) {
    for (var s = 1; s <= 5; s++) {
      dotsByStation.push(rail.querySelector('.dot-s' + s));
    }
  }

  function updateRail(current) {
    if (!rail) return;
    dotsByStation.forEach(function (dot, idx) {
      if (dot) dot.classList.toggle('active', idx === current);
    });
    // 进入底部收束区（无站）时淡出指示线
    rail.classList.toggle('rail-hidden', current === -1);
  }

  /* ---------- 初始化 ---------- */
  if (!reducedMotion) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () {
      sizeCanvas();
      onScroll();
    });
    sizeCanvas();
    applyParallax();
  } else if (rail) {
    // reduced-motion 下视差与粒子关闭，仅保留指示线的当前站提亮
    var railTick = false;
    window.addEventListener('scroll', function () {
      if (railTick) return;
      railTick = true;
      window.requestAnimationFrame(function () {
        railTick = false;
        detectStation(window.innerHeight);
      });
    }, { passive: true });
    detectStation(window.innerHeight);
  }
  // reduced-motion 下：视差与粒子全部关闭，静态呈现（CSS 已兜底）
})();
