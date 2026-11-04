/* ============================================
   关于页 · 左侧锚点导航高亮（scrollspy）
   ============================================ */
(function () {
  'use strict';

  var links = document.querySelectorAll('#about-nav a');
  var secs = [];
  links.forEach(function (a) {
    var el = document.querySelector(a.getAttribute('href'));
    if (el) secs.push({ id: a.getAttribute('href').slice(1), el: el, a: a });
  });

  function activate() {
    var scrollY = window.scrollY + 120;
    var current = secs[0];
    secs.forEach(function (s) {
      if (s.el.offsetTop <= scrollY) current = s;
    });
    links.forEach(function (a) { a.classList.remove('active'); });
    if (current) current.a.classList.add('active');
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        activate();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  /* 点击锚点立即高亮，不等滚动事件 */
  links.forEach(function (a) {
    a.addEventListener('click', function () {
      links.forEach(function (x) { x.classList.remove('active'); });
      a.classList.add('active');
    });
  });
  window.addEventListener('hashchange', activate);

  activate();
})();
