/* ============================================
   我的 · 个人中心
   访客模式：收藏/打卡/徽章/导出导入
   学生模式：+课程记录/作品上传/课程反馈/课程徽章
   键：yc-favs / yc-checkins / yc-night（通用，沿用）
       yc-course-done / yc-works / yc-feedback / yc-mode
   ============================================ */
(function () {
  'use strict';

  var FAV_KEY = 'yc-favs';
  var CHECK_KEY = 'yc-checkins';
  var NIGHT_KEY = 'yc-night';
  var MODE_KEY = 'yc-mode';
  var DONE_KEY = 'yc-course-done';
  var WORK_KEY = 'yc-works';
  var FB_KEY = 'yc-feedback';

  /* 与 course.js 的 8 门占位课程同名（课程定稿后改为共享数据） */
  var COURSE_TITLES = [
    '第一课：什么是昆虫',
    '第二课：昆虫的伪装术',
    '第三课：蝴蝶的一生',
    '第四课：云南的五座虫境',
    '第五课：昆虫分类入门',
    '第六课：拟态与警戒色',
    '第七课：生态梯度观察方法',
    '第八课：昆虫与气候变化'
  ];

  function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch (e) { return fallback; }
  }
  function save(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ============ 模式切换 ============ */
  var MODE_LABELS = { visitor: '普通访客模式', student: '课程学生模式' };
  var toggle = document.getElementById('mode-toggle');
  var studentZone = document.getElementById('student-zone');

  function applyMode(mode) {
    document.body.dataset.mode = mode;
    studentZone.hidden = mode !== 'student';
    toggle.querySelectorAll('.mode-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.mode === mode);
    });
    localStorage.setItem(MODE_KEY, mode);
    if (mode === 'student') {
      renderRecords();
      renderCourseBadges();
    }
  }

  toggle.addEventListener('click', function (e) {
    var btn = e.target.closest('.mode-btn');
    if (btn) applyMode(btn.dataset.mode);
  });

  /* ============ 通用档案（访客功能） ============ */
  var STATION_NAMES = ['滇南热带雨林', '哀牢云雾林', '红河蝴蝶谷', '高黎贡山', '滇西北高山'];
  var BADGES = [
    { key: 'first', name: '初来乍到', desc: '收藏第 1 种虫' },
    { key: 'allfive', name: '五站走遍', desc: '打卡全部 5 站' },
    { key: 'hundred', name: '百虫图鉴', desc: '收藏 10 种以上' },
    { key: 'night', name: '夜行观测者', desc: '夜间灯诱打卡' }
  ];
  var COURSE_BADGES = [
    { key: 'course1', name: '完成第 1 课', desc: '完成任意 1 门课程' },
    { key: 'course8', name: '学完 8 课', desc: '完成全部 8 门课程' },
    { key: 'work1', name: '手工作业提交', desc: '上传第 1 份手工作品' }
  ];

  var statsEl = document.getElementById('archive-stats');
  var favList = document.getElementById('fav-list');
  var checkinList = document.getElementById('checkin-list');
  var badgeGrid = document.getElementById('badge-grid');
  var nightFlag = document.getElementById('night-flag');

  nightFlag.checked = load(NIGHT_KEY, false);
  nightFlag.addEventListener('change', function () {
    save(NIGHT_KEY, nightFlag.checked);
    renderArchive();
  });

  function earnedBadges() {
    var favs = load(FAV_KEY, []);
    var checks = load(CHECK_KEY, []);
    var has = {};
    has.first = favs.length >= 1;
    has.allfive = checks.length >= 5;
    has.hundred = favs.length >= 10;
    has.night = load(NIGHT_KEY, false);
    return has;
  }

  function renderArchive() {
    var favs = load(FAV_KEY, []);
    var checks = load(CHECK_KEY, []);
    var has = earnedBadges();
    var badgeCount = BADGES.filter(function (b) { return has[b.key]; }).length;

    statsEl.innerHTML =
      '<div class="stat"><b>' + favs.length + '</b><span>已收藏虫种</span></div>' +
      '<div class="stat"><b>' + checks.length + '</b><span>已打卡站点</span></div>' +
      '<div class="stat"><b>' + badgeCount + '</b><span>获得徽章</span></div>';

    favList.innerHTML = favs.length
      ? favs.map(function (id) {
          var sp = YC.byId[id];
          return sp
            ? '<li><a href="species-detail.html?id=' + sp.id + '">' + esc(sp.zh) +
              ' <i>' + esc(sp.latin) + '</i></a></li>'
            : '';
        }).join('')
      : '<li class="empty">去物种详情页点「收藏加入个人档案」，虫会出现在这里。</li>';

    checkinList.innerHTML = STATION_NAMES.map(function (name, i) {
      var on = checks.indexOf(i) !== -1;
      return '<li><button type="button" class="checkin-btn' + (on ? ' on' : '') +
        '" data-i="' + i + '">' + (on ? '已去 ✓ ' : '未去 · ') + name + '</button></li>';
    }).join('');

    badgeGrid.innerHTML = BADGES.map(function (b) {
      return '<div class="badge' + (has[b.key] ? ' earned' : '') + '">' +
        '<span class="badge-icon">' + (has[b.key] ? '🏅' : '🔒') + '</span>' +
        '<b>' + b.name + '</b><span class="badge-desc">' + b.desc + '</span></div>';
    }).join('');
  }

  checkinList.addEventListener('click', function (e) {
    var btn = e.target.closest('.checkin-btn');
    if (!btn) return;
    var checks = load(CHECK_KEY, []);
    var i = Number(btn.dataset.i);
    var idx = checks.indexOf(i);
    if (idx === -1) checks.push(i); else checks.splice(idx, 1);
    save(CHECK_KEY, checks);
    renderArchive();
  });

  /* ---------- 导出 / 导入 ---------- */
  var ioMsg = document.getElementById('io-msg');
  function flashIo(text) {
    ioMsg.textContent = text;
    setTimeout(function () { ioMsg.textContent = ''; }, 2500);
  }

  document.getElementById('export-btn').addEventListener('click', function () {
    var data = {
      app: '云虫秘境个人档案',
      mode: load(MODE_KEY, 'visitor'),
      exportedAt: new Date().toISOString(),
      favs: load(FAV_KEY, []),
      checkins: load(CHECK_KEY, []),
      night: load(NIGHT_KEY, false),
      coursesDone: load(DONE_KEY, []),
      works: load(WORK_KEY, []),
      feedback: load(FB_KEY, [])
    };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'yunchong-archive.json';
    a.click();
    URL.revokeObjectURL(a.href);
    flashIo('已导出 ✓');
  });

  document.getElementById('import-btn').addEventListener('click', function () {
    document.getElementById('import-file').click();
  });
  document.getElementById('import-file').addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        if (Array.isArray(data.favs)) save(FAV_KEY, data.favs);
        if (Array.isArray(data.checkins)) save(CHECK_KEY, data.checkins);
        if (typeof data.night === 'boolean') save(NIGHT_KEY, data.night);
        if (Array.isArray(data.coursesDone)) save(DONE_KEY, data.coursesDone);
        if (Array.isArray(data.works)) save(WORK_KEY, data.works);
        if (Array.isArray(data.feedback)) save(FB_KEY, data.feedback);
        nightFlag.checked = load(NIGHT_KEY, false);
        renderArchive();
        if (document.body.dataset.mode === 'student') {
          renderRecords();
          renderCourseBadges();
          renderWorks();
        }
        flashIo('导入成功 ✓');
      } catch (err) {
        flashIo('导入失败：文件不是有效的档案 JSON');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  /* ============ 学生模式：课程记录 ============ */
  var recordList = document.getElementById('record-list');

  function renderRecords() {
    var done = load(DONE_KEY, []);
    if (!done.length) {
      recordList.innerHTML =
        '<li class="empty">还没有开始课程，<a href="course.html">去课程页看看 →</a></li>';
      return;
    }
    recordList.innerHTML = done.map(function (d) {
      return '<li class="record-item">' +
        '<div class="record-info"><b>' + esc(d.title) + '</b>' +
        '<span>完成于 ' + esc(d.date || '—') + '</span></div>' +
        '<div class="record-bar"><span style="width:100%"></span></div>' +
        '</li>';
    }).join('');
  }

  /* ============ 学生模式：课程徽章 ============ */
  function renderCourseBadges() {
    var done = load(DONE_KEY, []);
    var works = load(WORK_KEY, []);
    var has = {};
    has.course1 = done.length >= 1;
    has.course8 = done.length >= 8;
    has.work1 = works.length >= 1;
    document.getElementById('course-badge-grid').innerHTML = COURSE_BADGES.map(function (b) {
      return '<div class="badge' + (has[b.key] ? ' earned' : '') + '">' +
        '<span class="badge-icon">' + (has[b.key] ? '🏅' : '🔒') + '</span>' +
        '<b>' + b.name + '</b><span class="badge-desc">' + b.desc + '</span></div>';
    }).join('');
  }

  /* ============ 学生模式：手工作品上传 ============ */
  var workForm = document.getElementById('work-form');
  var workGallery = document.getElementById('work-gallery');
  var workFileInput = document.getElementById('work-photo');
  var workFileNameEl = document.getElementById('work-file-name');
  var workFileBtn = document.getElementById('work-file-btn');
  var workCourseSelect = document.getElementById('work-course');

  workCourseSelect.innerHTML += COURSE_TITLES.map(function (t) {
    return '<option value="' + esc(t) + '">' + esc(t) + '</option>';
  }).join('');

  workFileBtn.addEventListener('click', function () { workFileInput.click(); });
  workFileBtn.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') workFileInput.click();
  });
  workFileInput.addEventListener('change', function () {
    workFileNameEl.textContent = workFileInput.files.length
      ? workFileInput.files[0].name + '（已选择，仅记录文件名）'
      : '未选择照片（仅记录文件名）';
  });

  function renderWorks() {
    var works = load(WORK_KEY, []);
    if (!works.length) {
      workGallery.innerHTML = '<p class="gallery-empty">还没有作品。课堂上的标本、手绘、笔记都可以传上来。</p>';
      return;
    }
    workGallery.innerHTML = works.slice().reverse().map(function (w, ri) {
      var i = works.length - 1 - ri;
      return '<article class="note-card">' +
        '<div class="note-photo">🎨 ' + (w.photo ? esc(w.photo) : '照片待补充') + '</div>' +
        '<h3>' + esc(w.name) + '</h3>' +
        '<p class="note-meta">' + (w.course ? esc(w.course) : '自由创作') + '</p>' +
        (w.text ? '<p class="note-text">' + esc(w.text) + '</p>' : '') +
        '<button type="button" class="note-del" data-i="' + i + '" aria-label="删除这份作品">×</button>' +
        '</article>';
    }).join('');
  }

  workGallery.addEventListener('click', function (e) {
    var btn = e.target.closest('.note-del');
    if (!btn) return;
    var works = load(WORK_KEY, []);
    works.splice(Number(btn.dataset.i), 1);
    save(WORK_KEY, works);
    renderWorks();
    renderCourseBadges();
  });

  workForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var works = load(WORK_KEY, []);
    works.push({
      name: document.getElementById('work-name').value.trim(),
      course: workCourseSelect.value,
      photo: workFileInput.files.length ? workFileInput.files[0].name : '',
      text: document.getElementById('work-text').value.trim(),
      time: Date.now()
    });
    save(WORK_KEY, works);
    workForm.reset();
    workFileNameEl.textContent = '未选择照片（仅记录文件名）';
    renderWorks();
    renderCourseBadges();
  });

  /* ============ 学生模式：课程反馈 ============ */
  var fbCourse = document.getElementById('fb-course');
  var fbForm = document.getElementById('feedback-form');
  var fbMsg = document.getElementById('fb-msg');

  fbCourse.innerHTML += COURSE_TITLES.map(function (t) {
    return '<option value="' + esc(t) + '">' + esc(t) + '</option>';
  }).join('');

  fbForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var star = fbForm.querySelector('input[name="fb-star"]:checked');
    fbMsg.hidden = false;
    fbMsg.classList.remove('ok');
    if (!fbCourse.value) { fbMsg.textContent = '请先选择课程'; return; }
    if (!star) { fbMsg.textContent = '请给出评分'; return; }
    var list = load(FB_KEY, []);
    list.push({
      course: fbCourse.value,
      star: Number(star.value),
      text: document.getElementById('fb-text').value.trim(),
      name: document.getElementById('fb-name').value.trim() || '匿名',
      time: Date.now()
    });
    save(FB_KEY, list);
    fbForm.reset();
    fbMsg.textContent = '感谢反馈！你的建议会帮我们改进课程。';
    fbMsg.classList.add('ok');
    setTimeout(function () { fbMsg.hidden = true; }, 3000);
  });

  /* ============ 初始化 ============ */
  renderArchive();
  var savedMode = null;
  try { savedMode = localStorage.getItem(MODE_KEY); } catch (e) { /* 隐私模式 */ }
  applyMode(savedMode === 'student' ? 'student' : 'visitor');
})();
