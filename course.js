/* ============================================
   科学课程页 · 占位框架
   8 个占位课程，后续替换真实课程内容与链接
   ============================================ */
(function () {
  'use strict';

  /* 学段元数据（标签色沿用全站强调色板） */
  var STAGES = {
    'primary-low': { label: '小学低年级', color: '#8fe0b4' },
    'primary-high': { label: '小学高年级', color: '#8fe0b4' },
    'junior': { label: '初中', color: '#7ab5b0' },
    'senior': { label: '高中', color: '#9b8ec4' }
  };

  /* 占位课程数据 */
  var COURSES = [
    {
      stage: 'primary-low',
      title: '第一课：什么是昆虫',
      duration: '40分钟',
      desc: '认识昆虫的三个基本特征：六条腿、身体分三节、有翅膀（多数）。占位简介，待替换。'
    },
    {
      stage: 'primary-low',
      title: '第二课：昆虫的伪装术',
      duration: '40分钟',
      desc: '从枯叶蛱蝶到竹节虫，看看昆虫怎么把自己藏起来。占位简介，待替换。'
    },
    {
      stage: 'primary-high',
      title: '第三课：蝴蝶的一生',
      duration: '45分钟',
      desc: '卵、幼虫、蛹、成虫——完全变态发育的四幕剧。占位简介，待替换。'
    },
    {
      stage: 'primary-high',
      title: '第四课：云南的五座虫境',
      duration: '45分钟',
      desc: '沿海拔梯度，从热带雨林到高山流石滩，认识云南的五种虫境。占位简介，待替换。'
    },
    {
      stage: 'junior',
      title: '第五课：昆虫分类入门',
      duration: '45分钟',
      desc: '学会用检索表的思路，把一只虫归到目。占位简介，待替换。'
    },
    {
      stage: 'junior',
      title: '第六课：拟态与警戒色',
      duration: '45分钟',
      desc: '贝氏拟态、缪勒拟态与警戒色——虫子们的生存策略。占位简介，待替换。'
    },
    {
      stage: 'senior',
      title: '第七课：生态梯度观察方法',
      duration: '50分钟',
      desc: '样线法与样方法入门，设计一次沿海拔梯度的昆虫观察。占位简介，待替换。'
    },
    {
      stage: 'senior',
      title: '第八课：昆虫与气候变化',
      duration: '50分钟',
      desc: '从物候数据看变暖：高山昆虫为什么最先响应。占位简介，待替换。'
    }
  ];

  var grid = document.getElementById('course-grid');
  var tabs = document.getElementById('course-tabs');
  var current = 'all';

  /* 完成记录（互动区「我的课程记录」读取同一键） */
  var DONE_KEY = 'yc-course-done';
  function doneList() {
    try { return JSON.parse(localStorage.getItem(DONE_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveDone(list) {
    localStorage.setItem(DONE_KEY, JSON.stringify(list));
  }

  function render() {
    var list = COURSES.filter(function (c) {
      return current === 'all' || c.stage === current;
    });
    var done = doneList();
    grid.innerHTML = list.map(function (c) {
      var st = STAGES[c.stage];
      var isDone = done.some(function (d) { return d.title === c.title; });
      return '<article class="course-card' + (isDone ? ' done' : '') + '" data-stage="' + c.stage + '">' +
        '<span class="stage-tag" style="color:' + st.color + ';border-color:' + st.color + '55">' +
          st.label + '</span>' +
        '<h2 class="course-title">' + c.title + '</h2>' +
        '<p class="course-meta"><span>' + c.duration + '</span><span>' + st.label + '</span></p>' +
        '<p class="course-desc">' + c.desc + '</p>' +
        '<div class="course-actions">' +
          '<a href="#" class="course-btn" onclick="return false">查看课程</a>' +
          '<button type="button" class="course-done-btn' + (isDone ? ' on' : '') +
            '" data-title="' + c.title + '">' + (isDone ? '已完成 ✓' : '标记完成') + '</button>' +
        '</div>' +
        '</article>';
    }).join('');
  }

  grid.addEventListener('click', function (e) {
    var btn = e.target.closest('.course-done-btn');
    if (!btn) return;
    var done = doneList();
    var title = btn.dataset.title;
    var i = done.findIndex(function (d) { return d.title === title; });
    if (i === -1) {
      done.push({ title: title, date: new Date().toISOString().slice(0, 10) });
    } else {
      done.splice(i, 1);
    }
    saveDone(done);
    render();
  });

  tabs.addEventListener('click', function (e) {
    var btn = e.target.closest('.course-tab');
    if (!btn) return;
    current = btn.dataset.stage;
    tabs.querySelectorAll('.course-tab').forEach(function (b) {
      b.classList.toggle('active', b === btn);
    });
    render();
  });

  render();
})();
