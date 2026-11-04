/* ============================================
   物种库列表页 · 侧边分类导航 + 多维筛选 + 搜索
   + 排序 + 卡片/表格视图切换 + 分页（20/页）
   数据来自共享模块 js/species-data.js（window.YC）
   ============================================ */
(function () {
  'use strict';

  var ORDERS = YC.orders;
  var BANDS = YC.bands;
  var SPECIES = YC.species;
  var BAND_MAP = YC.bandMap;
  var DETAIL = YC.detail;
  var PAGE_SIZE = 20;

  var state = {
    order: 'all', band: 'all', protect: 'all',
    month: 0, diet: 'all', q: '',
    sort: 'code', view: 'cards', page: 1
  };

  var grid = document.getElementById('species-grid');
  var tbody = document.getElementById('species-tbody');
  var tableWrap = document.getElementById('species-table-wrap');
  var emptyTip = document.getElementById('species-empty');
  var countEl = document.getElementById('species-count');
  var pagerEl = document.getElementById('species-pager');
  var searchInput = document.getElementById('species-search');
  var sortSelect = document.getElementById('species-sort');

  /* ---------- 派生字段 ---------- */
  function dietOf(sp) {
    var d = (DETAIL[sp.num] && DETAIL[sp.num].diet) || '';
    if (d.indexOf('捕食') !== -1) return 'predator';
    if (d.indexOf('访花') !== -1 || d.indexOf('花蜜') !== -1) return 'flower';
    if (d.indexOf('腐') !== -1) return 'detritus';
    if (d.indexOf('植食') !== -1 || d.indexOf('蛀') !== -1 || d.indexOf('寄主') !== -1) return 'herbivore';
    return '';
  }
  function altOf(sp) {
    var a = (DETAIL[sp.num] && DETAIL[sp.num].altitude) || '';
    var m = a.match(/(\d{3,4})/);
    return m ? Number(m[1]) : -1;
  }
  function sizeOf(sp) {
    var s = (DETAIL[sp.num] && DETAIL[sp.num].size) || '';
    var nums = s.match(/\d{1,3}(?:\.\d)?/g);
    return nums ? Math.max.apply(null, nums.map(Number)) : -1;
  }
  function monthsOf(sp) {
    return (DETAIL[sp.num] && DETAIL[sp.num].months) || [];
  }
  function codeOf(sp) {
    return (DETAIL[sp.num] && DETAIL[sp.num].code) ||
      ('YN-' + (YC.orderCode[sp.order] || 'XXX') + '-' + String(sp.num).padStart(4, '0'));
  }
  function pctOf(sp) {
    return (window.YC_IMG ? YC_IMG.hasMain(sp.num) : !!sp.photo) ? 100 : 60;
  }
  function pctBar(pct) {
    return '<span class="pct-bar" title="档案完整度 ' + pct + '%">' +
      '<i style="width:' + pct + '%"></i></span>' +
      '<span class="pct-num">' + pct + '%</span>';
  }

  /* ---------- 左侧导航构建 ---------- */
  function countBy(fn) {
    var map = {};
    SPECIES.forEach(function (sp) {
      var k = fn(sp);
      if (k) map[k] = (map[k] || 0) + 1;
    });
    return map;
  }

  function buildSideList(ulId, items, stateKey) {
    var ul = document.getElementById(ulId);
    ul.innerHTML = items.map(function (it) {
      var on = state[stateKey] === it.key ? ' class="on"' : '';
      return '<li><a href="javascript:void(0)" data-value="' + it.key + '"' + on + '>' +
        (it.dot ? '<i class="band-dot" style="background:' + it.dot + '"></i>' : '') +
        '<span class="side-label">' + it.label + '</span>' +
        '<span class="side-count">' + it.count + '</span></a></li>';
    }).join('');
  }

  function sideData() {
    var oc = countBy(function (sp) { return sp.order; });
    var bc = countBy(function (sp) { return sp.band; });
    var orders = [{ key: 'all', label: '全部', count: SPECIES.length }].concat(
      ORDERS.map(function (o) { return { key: o.key, label: o.label, count: oc[o.key] || 0 }; }));
    var bands = [{ key: 'all', label: '全部', count: SPECIES.length }].concat(
      BANDS.map(function (b) { return { key: b.key, label: b.label, count: bc[b.key] || 0, dot: b.color }; }));
    var p1 = SPECIES.filter(function (s) { return s.protect === '国家一级'; }).length;
    var p2 = SPECIES.filter(function (s) { return s.protect === '国家二级'; }).length;
    var protect = [
      { key: 'all', label: '全部', count: SPECIES.length },
      { key: '国家一级', label: '国家一级', count: p1 },
      { key: '国家二级', label: '国家二级', count: p2 }
    ];
    var diets = ['herbivore', 'predator', 'flower', 'detritus'];
    var dcount = {};
    SPECIES.forEach(function (sp) {
      var d = dietOf(sp);
      if (d) dcount[d] = (dcount[d] || 0) + 1;
    });
    var dietLabels = { herbivore: '植食', predator: '捕食', flower: '访花', detritus: '腐食' };
    var diet = [{ key: 'all', label: '全部', count: SPECIES.length }].concat(
      diets.map(function (k) { return { key: k, label: dietLabels[k], count: dcount[k] || 0 }; }));
    return { orders: orders, bands: bands, protect: protect, diet: diet };
  }

  function refreshSide() {
    var d = sideData();
    buildSideList('side-orders', d.orders, 'order');
    buildSideList('side-bands', d.bands, 'band');
    buildSideList('side-protect', d.protect, 'protect');
    buildSideList('side-diet', d.diet, 'diet');
    var mb = document.getElementById('side-months');
    mb.innerHTML = Array.from({ length: 12 }, function (_, i) {
      var m = i + 1;
      return '<button type="button" class="m-btn' + (state.month === m ? ' on' : '') +
        '" data-m="' + m + '">' + m + '</button>';
    }).join('');
  }

  /* ---------- 侧边点击委托 ---------- */
  document.querySelector('.species-side').addEventListener('click', function (e) {
    var a = e.target.closest('.side-list a');
    if (a) {
      var keyMap = { 'side-orders': 'order', 'side-bands': 'band', 'side-protect': 'protect', 'side-diet': 'diet' };
      var ulId = a.closest('.side-list').id;
      state[keyMap[ulId]] = a.dataset.value;
      state.page = 1;
      refreshSide();
      render();
      return;
    }
    var mb = e.target.closest('.m-btn');
    if (mb) {
      var m = Number(mb.dataset.m);
      state.month = state.month === m ? 0 : m;
      state.page = 1;
      refreshSide();
      render();
    }
  });

  document.getElementById('side-reset').addEventListener('click', function () {
    state.order = 'all'; state.band = 'all'; state.protect = 'all';
    state.month = 0; state.diet = 'all'; state.q = ''; state.page = 1;
    searchInput.value = '';
    refreshSide();
    render();
  });

  /* ---------- 筛选 + 排序 + 分页 ---------- */
  function filtered() {
    var q = state.q.trim().toLowerCase();
    var list = SPECIES.filter(function (sp) {
      if (state.order !== 'all' && sp.order !== state.order) return false;
      if (state.band !== 'all' && sp.band !== state.band) return false;
      if (state.protect !== 'all' && sp.protect !== state.protect) return false;
      if (state.diet !== 'all' && dietOf(sp) !== state.diet) return false;
      if (state.month && monthsOf(sp).indexOf(state.month) === -1) return false;
      if (q && sp.zh.toLowerCase().indexOf(q) === -1 &&
          sp.latin.toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
    if (state.sort === 'alt') {
      list.sort(function (a, b) { return altOf(a) - altOf(b) || a.num - b.num; });
    } else if (state.sort === 'size') {
      list.sort(function (a, b) { return sizeOf(a) - sizeOf(b) || a.num - b.num; });
    } else {
      list.sort(function (a, b) { return codeOf(a) < codeOf(b) ? -1 : 1; });
    }
    return list;
  }

  /* ---------- 渲染 ---------- */
  function cardHTML(sp) {
    var band = BAND_MAP[sp.band];
    var protect = sp.protect ? '<span class="protect-badge ' + (sp.protect.indexOf('一级') !== -1 ? 'pb-lv1' : 'pb-lv2') + '">' + sp.protect + '</span>' : '';
    var pct = pctOf(sp);
    var hasImg = window.YC_IMG && YC_IMG.hasMain(sp.num);
    var photoHtml = hasImg
      ? '<div class="card-photo card-has-img">'
        + '<img class="card-thumb" loading="lazy" src="assets/images/species/species-' + sp.num + '.jpg" alt="' + sp.zh + '照片">'
        + '</div>'
      : '<div class="card-photo" role="img" aria-label="' + sp.zh + '微距照片占位">'
        + '<img class="ph-sil" src="assets/images/species/placeholder.svg" alt="">'
        + '<span>影像整理中</span>'
        + '</div>';
    return ''
      + '<a class="species-card" href="species-detail.html?id=' + sp.id + '">'
      +   photoHtml
      +   '<div class="card-body">'
      +     '<h3 class="card-name">' + sp.zh + '</h3>'
      +     '<p class="card-latin' + (sp.tbd ? ' tbd' : '') + '">' + sp.latin + '</p>'
      +     '<div class="card-meta">'
      +       '<span class="card-order">' + sp.orderLabel + '</span>'
      +       '<span class="band-dot" style="background:' + band.color + '" title="' + band.label + '"></span>'
      +       '<span class="band-label">' + band.label + '</span>'
      +       protect
      +     '</div>'
      +     '<div class="card-pct">' + pctBar(pct) + '</div>'
      +   '</div>'
      + '</a>';
  }

  function rowHTML(sp) {
    var band = BAND_MAP[sp.band];
    var pct = pctOf(sp);
    return '<tr>'
      + '<td class="mono">' + codeOf(sp) + '</td>'
      + '<td><a class="t-zh" href="species-detail.html?id=' + sp.id + '">' + sp.zh + '</a></td>'
      + '<td><i class="t-latin' + (sp.tbd ? ' tbd' : '') + '">' + sp.latin + '</i></td>'
      + '<td>' + sp.orderLabel + '</td>'
      + '<td><i class="band-dot" style="background:' + band.color + '"></i> ' + band.label + '</td>'
      + '<td>' + (sp.protect ? '<span class="protect-badge ' + (sp.protect.indexOf('一级') !== -1 ? 'pb-lv1' : 'pb-lv2') + '">' + sp.protect + '</span>' : '<span class="t-dim">—</span>') + '</td>'
      + '<td>' + pctBar(pct) + '</td>'
      + '</tr>';
  }

  function render() {
    var list = filtered();
    var pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (state.page > pages) state.page = pages;
    var slice = list.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);

    grid.innerHTML = state.view === 'cards' ? slice.map(cardHTML).join('') : '';
    tbody.innerHTML = state.view === 'table' ? slice.map(rowHTML).join('') : '';
    grid.hidden = state.view !== 'cards';
    tableWrap.hidden = state.view !== 'table';
    emptyTip.hidden = list.length > 0;
    countEl.textContent = '共 ' + list.length + ' 种 · 第 ' + state.page + ' / ' + pages + ' 页';

    pagerEl.innerHTML = pages > 1
      ? '<button type="button" class="pg-btn"' + (state.page === 1 ? ' disabled' : '') + ' data-p="prev">‹</button>'
        + Array.from({ length: pages }, function (_, i) {
            var p = i + 1;
            return '<button type="button" class="pg-btn' + (p === state.page ? ' on' : '') +
              '" data-p="' + p + '">' + p + '</button>';
          }).join('')
        + '<button type="button" class="pg-btn"' + (state.page === pages ? ' disabled' : '') + ' data-p="next">›</button>'
      : '';
  }

  pagerEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.pg-btn');
    if (!btn || btn.disabled) return;
    var p = btn.dataset.p;
    if (p === 'prev') state.page = Math.max(1, state.page - 1);
    else if (p === 'next') state.page = state.page + 1;
    else state.page = Number(p);
    render();
    document.querySelector('.species-main').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ---------- 视图切换 / 排序 / 搜索 ---------- */
  document.getElementById('view-toggle').addEventListener('click', function (e) {
    var btn = e.target.closest('.view-btn');
    if (!btn || btn.dataset.view === state.view) return;
    state.view = btn.dataset.view;
    this.querySelectorAll('.view-btn').forEach(function (b) {
      var on = b === btn;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on);
    });
    render();
  });

  sortSelect.addEventListener('change', function () {
    state.sort = this.value;
    render();
  });

  searchInput.addEventListener('input', function () {
    state.q = this.value;
    state.page = 1;
    render();
  });

  /* ---------- 初始化（支持 ?band= 跳转） ---------- */
  var params = new URLSearchParams(window.location.search);
  var bandParam = params.get('band');
  if (bandParam && BAND_MAP[bandParam]) state.band = bandParam;
  var orderParam = params.get('order');
  if (orderParam && ORDERS.some(function (o) { return o.key === orderParam; })) {
    state.order = orderParam;
  }

  refreshSide();
  render();
})();
