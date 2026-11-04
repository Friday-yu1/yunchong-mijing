/* ============================================
   互动区 · 观察记录墙（feed 流）
   纯前端：localStorage 键 yc-feed
   首次访问自动迁移旧版 yc-notes，再预置示例
   ============================================ */
(function () {
  'use strict';

  var FEED_KEY = 'yc-feed';
  var LEGACY_KEY = 'yc-notes';

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

  /* ---------- 示例与迁移 ---------- */
  var SEED = [
    {
      id: 'seed-1', name: '山雀', place: '西双版纳勐仑', date: '2026-10-28', time: 1769900000000,
      bug: '枯叶蛱蝶', photo: '', liked: false, likes: 12,
      text: '沟谷雨林步道边合翅装枯叶，走近了才敢确认——翅正面的蓝紫色带一闪而过。它一直停在落果上吸汁，离我不到两米，拍了十分钟它都没挪窝。',
      comments: [
        { name: '苔藓', text: '这种合翅角度最经典，正面见过吗？', time: 1769950000000 },
        { name: '山雀', text: '回程时飞起来露了一次，来不及举相机。', time: 1769960000000 }
      ]
    },
    {
      id: 'seed-2', name: '蜉蝣', place: '红河金平 · 马鞍底', date: '2026-06-15', time: 1769800000000,
      bug: '箭环蝶', photo: '', liked: false, likes: 23,
      text: '蝴蝶谷爆发期第三天，滮水岩瀑布边的箭环蝶多到没法下脚——准确说是不忍心下脚。它们停在背包上、帽檐上吸汗，站在原地不动就是一场庆典。',
      comments: [
        { name: '夜行人', text: '羡慕！今年爆发量看着比去年大。', time: 1769820000000 }
      ]
    },
    {
      id: 'seed-3', name: '夜行人', place: '普洱景东 · 黄草岭', date: '2026-07-02', time: 1769700000000,
      bug: '巨叉锹甲', photo: '', liked: false, likes: 8,
      text: '观测站灯诱第一晚就来了位大家伙，大颚分叉比想象中更夸张。全程只在白布上趴了二十分钟，天没亮就走了。湿度大，头灯起雾，拍糊了一半。',
      comments: []
    },
    {
      id: 'seed-4', name: '溪客', place: '红河金平 · 马拐塘', date: '2026-05-19', time: 1769600000000,
      bug: '燕凤蝶', photo: '', liked: false, likes: 15,
      text: '溪边群吸的燕凤蝶，长尾突在水面上一点一点，远看像在弹水。飞起来几乎是悬停平移，和别的凤蝶完全两种飞法。',
      comments: [
        { name: '山雀', text: '「弹水」这个形容绝了。', time: 1769650000000 }
      ]
    }
  ];

  function initFeed() {
    var feed = load(FEED_KEY, null);
    if (feed) return feed;
    /* 迁移旧版笔记（如有） */
    var legacy = load(LEGACY_KEY, []);
    if (legacy.length) {
      feed = legacy.map(function (n, i) {
        return {
          id: 'm-' + n.time + '-' + i, name: n.name || '匿名', place: n.place,
          date: n.date, time: n.time || Date.now(), bug: n.bug || '', photo: n.photo || '',
          liked: false, likes: 0, text: n.text || '', comments: []
        };
      });
    } else {
      feed = SEED.slice();
    }
    save(FEED_KEY, feed);
    return feed;
  }

  var FEED = initFeed();

  /* ---------- DOM ---------- */
  var feedEl = document.getElementById('feed');
  var uploadSection = document.getElementById('upload-section');
  var uploadToggle = document.getElementById('upload-toggle');
  var form = document.getElementById('note-form');
  var fileInput = document.getElementById('note-photo');
  var fileNameEl = document.getElementById('file-name');
  var fileBtn = document.getElementById('file-btn');

  uploadToggle.addEventListener('click', function () {
    uploadSection.hidden = !uploadSection.hidden;
    if (!uploadSection.hidden) {
      document.getElementById('note-date').value = new Date().toISOString().slice(0, 10);
      uploadSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  fileBtn.addEventListener('click', function () { fileInput.click(); });
  fileBtn.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') fileInput.click();
  });
  fileInput.addEventListener('change', function () {
    fileNameEl.textContent = fileInput.files.length
      ? fileInput.files[0].name + '（已选择，仅记录文件名）'
      : '未选择照片（可只发文字记录）';
  });

  function persist() { save(FEED_KEY, FEED); }

  function timeLabel(iso) {
    return iso; /* 记录以日期为主，不做相对时间 */
  }

  /* ---------- 渲染 ---------- */
  /* 头像：按昵称首字符取站点色渐变，让每条记录有可辨识的身份色 */
  var AVATAR_COLORS = ['#4a9e6e', '#b8956a', '#9b8ec4', '#7ab5b0', '#8fa8c8', '#8fe0b4'];
  function avatarStyle(name) {
    var i = (name.charCodeAt(0) || 0) % AVATAR_COLORS.length;
    var j = (i + 2) % AVATAR_COLORS.length;
    return ' style="background:linear-gradient(135deg,' + AVATAR_COLORS[i] + ',' + AVATAR_COLORS[j] + ')"';
  }

  function commentHtml(n) {
    if (!n.comments.length) {
      return '<p class="comment-empty">还没有评论，说点什么吧。</p>';
    }
    return n.comments.map(function (c) {
      return '<div class="comment"><span class="avatar sm"' + avatarStyle(c.name) + '>' + esc(c.name.charAt(0)) + '</span>' +
        '<div class="comment-body"><b>' + esc(c.name) + '</b><p>' + esc(c.text) + '</p></div></div>';
    }).join('');
  }

  function render() {
    feedEl.innerHTML = FEED.slice().sort(function (a, b) { return b.time - a.time; })
      .map(function (n) {
        var open = n._open ? ' open' : '';
        return '<article class="feed-card" data-id="' + esc(n.id) + '">' +
          '<div class="feed-head">' +
            '<span class="avatar"' + avatarStyle(n.name) + '>' + esc(n.name.charAt(0)) + '</span>' +
            '<div class="feed-head-info"><b>' + esc(n.name) + '</b>' +
            '<span class="feed-meta">' + timeLabel(n.date) + ' · ' + esc(n.place) + '</span></div>' +
          '</div>' +
          '<div class="feed-photo">' + (n.photo ? '📷 ' + esc(n.photo) : (n.bug ? '<span class="feed-bug-tag">' + esc(n.bug) + '</span>' : '文字记录 · 未附照片')) + '</div>' +
          (n.text ? '<p class="feed-text">' + esc(n.text) + '</p>' : '') +
          '<div class="feed-actions">' +
            '<button type="button" class="act-like' + (n.liked ? ' on' : '') + '" data-act="like">' +
              '<span class="heart">' + (n.liked ? '♥' : '♡') + '</span> <span class="like-count">' + n.likes + '</span></button>' +
            '<button type="button" class="act-comment" data-act="comment">💬 评论 <span class="comment-count">' + n.comments.length + '</span></button>' +
          '</div>' +
          '<div class="feed-comments' + open + '">' +
            '<div class="comment-list">' + commentHtml(n) + '</div>' +
            '<form class="comment-form"><input type="text" maxlength="120" placeholder="友善评论……" aria-label="写评论">' +
            '<button type="submit">发送</button></form>' +
          '</div>' +
          '</article>';
      }).join('');
  }

  /* ---------- 交互 ---------- */
  feedEl.addEventListener('click', function (e) {
    var card = e.target.closest('.feed-card');
    if (!card) return;
    var n = FEED.find(function (x) { return x.id === card.dataset.id; });
    if (!n) return;

    var likeBtn = e.target.closest('[data-act="like"]');
    if (likeBtn) {
      n.liked = !n.liked;
      n.likes += n.liked ? 1 : -1;
      persist();
      render();
      return;
    }

    var cBtn = e.target.closest('[data-act="comment"]');
    if (cBtn) {
      n._open = !n._open;
      render();
      if (n._open) {
        var box = feedEl.querySelector('.feed-card[data-id="' + cssEsc(n.id) + '"] .comment-form input');
        if (box) box.focus();
      }
    }
  });

  function cssEsc(s) {
    return (window.CSS && CSS.escape) ? CSS.escape(s) : s.replace(/"/g, '\\"');
  }

  feedEl.addEventListener('submit', function (e) {
    var formEl = e.target.closest('.comment-form');
    if (!formEl) return;
    e.preventDefault();
    var card = e.target.closest('.feed-card');
    var n = FEED.find(function (x) { return x.id === card.dataset.id; });
    if (!n) return;
    var input = formEl.querySelector('input');
    var text = input.value.trim();
    if (!text) return;
    var me = document.getElementById('note-name').value.trim() || '我';
    n.comments.push({ name: me, text: text, time: Date.now() });
    n._open = true;
    persist();
    render();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    FEED.push({
      id: 'u-' + Date.now(),
      name: document.getElementById('note-name').value.trim(),
      place: document.getElementById('note-place').value.trim(),
      date: document.getElementById('note-date').value,
      bug: document.getElementById('note-bug').value.trim(),
      photo: fileInput.files.length ? fileInput.files[0].name : '',
      text: document.getElementById('note-text').value.trim(),
      time: Date.now(),
      liked: false, likes: 0, comments: []
    });
    persist();
    form.reset();
    fileNameEl.textContent = '未选择照片（可只发文字记录）';
    uploadSection.hidden = true;
    render();
    feedEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  render();
})();
