/* ============================================
   云南寻虫页 · 五站地图 + 站点卡片（参考页结构版）
   站点详细内容由项目组提供（2026-11）；
   目标类群与 80 条共享档案 YC 按中文名匹配，命中自动带详情链接
   ============================================ */
(function () {
  'use strict';

  /* ---------- 五站元数据 ----------
     map: 圆点坐标（由真实经纬度投影到 720x700 viewBox） */
  var STATIONS = [
    {
      key: 'rainforest',
      no: '01',
      name: '滇南热带雨林',
      region: '西双版纳勐仑',
      alt: '500-1000m',
      color: '#4a9e6e',
      map: { x: 262, y: 618 },
      months: [3, 4, 5, 6, 7, 8, 9, 10, 11],
      season: '3-11月，雨前闷热时最活跃',
      best: '旱季11-4月',
      habitat: '中科院西双版纳热带植物园所在的罗梭江环流地带，是国内少见的成片龙脑香林与人工引种园交错区。园内引种植物超过一万种，等于给植食性昆虫摆了一桌持续供应的自助餐——因此这里的优势类群不是「稀有种」，而是数量极大的常见种：蚂蚁、蛾类、甲虫。沟谷内终年高湿，落叶层厚，腐食性和捕食性昆虫繁盛。',
      spots: [
        { name: '沟谷雨林步道', note: '夜间灯诱效果最好，大蚕蛾、天蛾、锹甲' },
        { name: '百花园', note: '白天观察访花昆虫，凤蝶、食蚜蝇、蜂类' },
        { name: '棕榈园', note: '叶甲与象甲集中' },
        { name: '绿石林', note: '看拟态与警戒色，斑衣蜡蝉、螽斯' },
        { name: '罗梭江江边', note: '傍晚看蚁群与蛾类群飞' }
      ],
      route: [
        'D1 下午：勐仑镇落脚，傍晚沿罗梭江边看蚁群与蛾类（黄猄蚁）',
        'D1 夜间：园内灯诱点（需提前联系园区）——乌桕大蚕蛾、大蚕蛾类',
        'D2 上午：百花园→沟谷雨林步道，重点看访花昆虫（金裳凤蝶、燕凤蝶）',
        'D2 下午：绿石林，看拟态与警戒色（枯叶蛱蝶、翠蓝眼蛱蝶）'
      ],
      targets: ['乌桕大蚕蛾', '黄猄蚁', '金裳凤蝶', '枯叶蛱蝶', '丽眼斑螳', '燕凤蝶'],
      tips: {
        transit: '飞机至景洪，转班车/包车至勐仑（植物园）、勐腊、磨憨。',
        stay: '景洪市区或勐仑镇，建议至少两晚。',
        caution: '雨季路滑；夜间观虫结伴；勿翻动枯枝石块，小心蜈蚣和毒蛇。'
      }
    },
    {
      key: 'mist-forest',
      no: '02',
      name: '哀牢云雾林',
      region: '景东无量山',
      alt: '1800-2600m',
      color: '#b8956a',
      map: { x: 268, y: 405 },
      months: [5, 6, 7, 8, 9],
      season: '5-9月，夜间灯诱最佳',
      best: '6-8月，萤火虫季',
      habitat: '无量山和哀牢山拦截了来自印度洋的水汽，终年云雾笼罩。树干和树枝厚覆苔藓，像铺了一层绿色绒毯。腐木层深厚，是锹甲、臂金龟和萤火虫的王国。这里海拔比西双版纳高1000米以上，温度低8-10度，虫相完全不同——你看不到热带大蚕蛾，但能看到温带山地特有的锹甲和萤类。夜间灯诱时，飞蛾扑灯的密度远低海拔，但种类更稀有。',
      spots: [
        { name: '黄草岭观测站', note: '夜间灯诱锹甲和臂金龟' },
        { name: '杜鹃湖步道', note: '白天看蝉和螽斯，清晨鸟类' },
        { name: '老街子原始林', note: '腐木层找锹甲幼虫' },
        { name: '景区大门路边', note: '夏季萤火虫成片' },
        { name: '核桃林', note: '天牛和豹蠹蛾寄主' }
      ],
      route: [
        'D1 下午：景东县城出发，驱车至黄草岭观测站落脚',
        'D1 夜间：观测站灯诱——巨叉锹甲、格彩臂金龟、云南窗萤',
        'D2 上午：杜鹃湖步道，沿溪看蝉和螽斯',
        'D2 下午：老街子原始林翻腐木找锹甲幼虫，路边看萤火虫'
      ],
      targets: ['巨叉锹甲', '格彩臂金龟', '云南窗萤', '黄粉鹿花金龟', '星天牛'],
      tips: {
        transit: '昆明至景东约6小时车程，再包车至保护区入口。',
        stay: '景东县城或保护区附近客栈。',
        caution: '湿度大，备防水衣物；夜间路黑，必须头灯。'
      }
    },
    {
      key: 'valley',
      no: '03',
      name: '红河蝴蝶谷',
      region: '金平马鞍底',
      alt: '1000-2000m',
      color: '#9b8ec4',
      map: { x: 452, y: 540 },
      months: [3, 4, 5, 6, 7, 8, 9, 10],
      season: '3-10月，6月集中爆发',
      best: '6月，箭环蝶爆发期',
      habitat: '金平分水岭位于红河州金平县，2009年发现箭环蝶集中爆发，记录11科320余种蝴蝶。2023年获「中国蝴蝶之乡」称号。每年6月，箭环蝶从蛹中同时羽化，亿万只蝴蝶在山谷间飞舞，是全球最大的蝴蝶聚集景观之一。这里山势陡峭，溪流纵横，原始常绿阔叶林保存完好。爆发期蝴蝶不怕人，会停在你身上吸水。',
      spots: [
        { name: '滮水岩瀑布', note: '箭环蝶爆发核心区' },
        { name: '拉登观景台', note: '俯瞰山谷蝶群' },
        { name: '蝴蝶谷广场', note: '每天清晨蝶群起飞' },
        { name: '五台山原始林', note: '高海拔找金斑喙凤蝶' },
        { name: '马拐塘溪流', note: '水边凤蝶群吸' }
      ],
      route: [
        'D1 下午：昆明驱车至马鞍底乡落脚，傍晚沿溪流看凤蝶群吸',
        'D1 夜间：保护区内灯诱蛾类',
        'D2 上午：滮水岩瀑布，箭环蝶爆发核心区（金裳凤蝶、箭环蝶）',
        'D2 下午：拉登观景台俯瞰蝶群，马拐塘溪边看凤蝶'
      ],
      targets: ['金斑喙凤蝶', '金裳凤蝶', '箭环蝶', '美凤蝶', '碧凤蝶'],
      tips: {
        transit: '昆明至金平约5小时，再包车至马鞍底乡。',
        stay: '马鞍底乡民宿。',
        caution: '爆发期人多提前订房；保护区核心区需报备进入。'
      }
    },
    {
      key: 'gaoligong',
      no: '04',
      name: '高黎贡山',
      region: '贡山/腾冲',
      alt: '1500-3200m',
      color: '#7ab5b0',
      map: { x: 100, y: 138 },
      months: [5, 6, 7, 8],
      season: '5-8月，垂直带谱完整',
      best: '6-7月，沿步道上下走',
      habitat: '高黎贡山是中国生物多样性最丰富的山地，从海拔1000m的热带季雨林一直到3500m的高山草甸，垂直带谱完整。东西坡差异显著，西坡迎西南季风湿润多雨，东坡干暖。沿步道每上升500米，虫相完全不同——低海拔看热带大蚕蛾，中海拔看凤蝶和锹甲，高海拔看粉蝶。夜间灯诱效果极佳，乌桕大蚕蛾和绿尾大蚕蛾都会来。',
      spots: [
        { name: '南斋公房步道', note: '海拔从2000到3000m，垂直带观察' },
        { name: '独龙江公路', note: '西坡湿润带，大蚕蛾集中' },
        { name: '腾冲来凤山', note: '低海拔看凤蝶' },
        { name: '大雪山保护区', note: '细角尤犀金龟' },
        { name: '岗至乡路边', note: '路边灯诱点' }
      ],
      route: [
        'D1 上午：腾冲出发，沿南斋公房步道上行，每上升500米停看虫相',
        'D1 下午：继续上行至高山草甸，看粉蝶和蛱蝶',
        'D1 夜间：路边灯诱——乌桕大蚕蛾、绿尾大蚕蛾',
        'D2 上午：独龙江方向，西坡湿润带找大蚕蛾和犀金龟'
      ],
      targets: ['乌桕大蚕蛾', '绿尾大蚕蛾', '细角尤犀金龟', '橙翅襟粉蝶', '金斑喙凤蝶'],
      tips: {
        transit: '昆明至保山/腾冲，再包车进入保护区。',
        stay: '腾冲或贡山县城。',
        caution: '海拔高差大，备保暖衣物；步道湿滑。'
      }
    },
    {
      key: 'alpine',
      no: '05',
      name: '滇西北高山',
      region: '德钦',
      alt: '3000-4200m',
      color: '#8fa8c8',
      map: { x: 118, y: 74 },
      months: [6, 7, 8],
      season: '6-8月，夏季草甸花期',
      best: '7月，野花盛开时',
      habitat: '德钦位于滇西北，横断山区核心。海拔3000m以上已是高山草甸和流石滩，冬季漫长严寒，夏季短暂。6-8月草甸野花盛开，粉蝶和蛱蝶在花甸上飞舞。这里没有热带雨林的斑斓，但高山昆虫有独特的适应——深色体色吸收阳光，低矮植株间快速飞行。紫外线极强，昆虫体色反而深暗。',
      spots: [
        { name: '飞来寺观景台', note: '草甸边缘看粉蝶' },
        { name: '明永冰川步道', note: '灌丛边缘找蛱蝶' },
        { name: '白马雪山垭口', note: '流石滩找高山甲虫' },
        { name: '纳帕海湿地', note: '水边蜻蜓和豆娘' },
        { name: '澜沧江峡谷', note: '干暖河谷看半翅目' }
      ],
      route: [
        'D1 上午：德钦出发，飞来寺草甸看花甸粉蝶',
        'D1 下午：明永冰川步道，灌丛边缘找蛱蝶',
        'D2 上午：白马雪山垭口，流石滩找高山甲虫',
        'D2 下午：纳帕海湿地，水边看蜻蜓和豆娘'
      ],
      targets: ['橙翅襟粉蝶', '高山粉蝶类', '黄蜻', '碧伟蜓'],
      tips: {
        transit: '昆明至德钦，沿214国道。',
        stay: '德钦或飞来寺。',
        caution: '高海拔紫外线强，备防晒；氧气稀薄，慢行。'
      }
    }
  ];

  /* 中文名 -> 档案条目 */
  var byName = {};
  YC.species.forEach(function (sp) {
    if (!byName[sp.zh]) byName[sp.zh] = sp;
  });

  function esc(s) {
    return String(s);
  }

  function targetChip(zh) {
    var sp = byName[zh];
    var label = esc(zh);
    return '<li>' +
      (sp ? '<a href="species-detail.html?id=' + sp.id + '">' + label + '</a>' : label) +
      '</li>';
  }

  function monthBar(months) {
    var html = '<div class="month-bar exp-months">';
    for (var m = 1; m <= 12; m++) {
      var on = months.indexOf(m) !== -1;
      html += '<span class="month-cell' + (on ? ' on' : '') + '" title="' + m + '月">' + m + '</span>';
    }
    return html + '</div>';
  }

  /* ---------- 大卡片：单卡联动渲染（随地图圆点切换） ---------- */
  var cardsEl = document.getElementById('station-cards');

  function cardHTML(st) {
    return '<article class="exp-card" id="exp-card-' + st.key + '" style="border-left:4px solid ' + st.color + ';--station-c:' + st.color + '">' +
      '<header class="exp-card-head">' +
        '<span class="band-dot" style="background:' + st.color + '"></span>' +
        '<div><h2>' + st.name + '</h2>' +
        '<p class="exp-region">' + st.region + ' · 海拔' + st.alt + '</p></div>' +
        '<span class="exp-no">' + st.no + '</span>' +
      '</header>' +
      '<div class="exp-seasonline">' +
        monthBar(st.months) +
        '<p><b>季节</b>' + esc(st.season) + '<b class="ml">最佳</b>' + esc(st.best) + '</p>' +
      '</div>' +
      '<div class="exp-sec"><h3>博物学描述</h3><p class="exp-habitat">' + esc(st.habitat) + '</p></div>' +
      '<div class="exp-sec"><h3>具体点位</h3><ul class="exp-spots">' +
        st.spots.map(function (s) {
          return '<li><b>' + esc(s.name) + '</b><span>' + esc(s.note) + '</span></li>';
        }).join('') +
      '</ul></div>' +
      '<div class="exp-sec"><h3>建议路线</h3><ol class="exp-route">' +
        st.route.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') +
      '</ol></div>' +
      '<div class="exp-sec"><h3>目标类群</h3><ul class="exp-targets">' +
        st.targets.map(targetChip).join('') +
      '</ul></div>' +
      '<div class="exp-sec exp-tips"><h3>前往Tips</h3>' +
        '<p><b>交通</b>' + esc(st.tips.transit) + '</p>' +
        '<p><b>住宿</b>' + esc(st.tips.stay) + '</p>' +
        '<p><b>注意</b>' + esc(st.tips.caution) + '</p>' +
      '</div>' +
      '<p class="exp-safety">安全须知：遵守「三不原则」——不捕捉、不采集、不惊扰；夜观结伴而行。</p>' +
      '</article>';
  }

  var activeStation = STATIONS[0];
  cardsEl.innerHTML = cardHTML(activeStation);

  /* 淡出 → 换内容 → 淡入（0.3s，与 CSS transition 一致） */
  function swapFade(el, apply) {
    el.classList.add('fade-out');
    window.setTimeout(function () {
      apply();
      el.classList.remove('fade-out');
    }, 300);
  }

  /* ---------- 地图圆点 ---------- */
  var dotsEl = document.getElementById('station-dots');
  dotsEl.innerHTML = STATIONS.map(function (st) {
    return '<g class="station-dot" data-key="' + st.key + '" tabindex="0" role="button"' +
      ' aria-label="' + st.name + '" style="--dot-c:' + st.color + '">' +
      '<circle class="dot-halo" cx="' + st.map.x + '" cy="' + st.map.y + '" r="16" fill="' + st.color + '"/>' +
      '<circle class="dot-core" cx="' + st.map.x + '" cy="' + st.map.y + '" r="8" fill="' + st.color + '"/>' +
      '<text class="dot-label" x="' + (st.map.x + 16) + '" y="' + (st.map.y + 4) + '">' + st.name + '</text>' +
      '</g>';
  }).join('');

  /* ---------- 右侧联动面板 ---------- */
  var panelHint = document.getElementById('panel-hint');
  var panelBody = document.getElementById('panel-body');
  var panelShown = false;

  /* 各站实景照片（版权见 credit） */
  var PHOTOS = {
    'rainforest':  { src: 'assets/images/expedition/station-rainforest.jpg', credit: '摄影：视觉中国' },
    'mist-forest': { src: 'assets/images/expedition/station-ailao.jpg',      credit: '摄影：视觉中国' },
    'valley':      { src: 'assets/images/expedition/station-butterfly.jpg',  credit: '摄影：胡超|新华社' },
    'gaoligong':   { src: 'assets/images/expedition/station-gaoligong.jpg',  credit: '摄影：李雨霖|中国大百科全书' },
    'alpine':      { src: 'assets/images/expedition/station-alpine.jpg',     credit: '摄影：视觉中国' }
  };

  function panelHTML(st) {
    var ph = PHOTOS[st.key];
    return '<figure class="panel-photo has-img">' +
        '<img src="' + ph.src + '" alt="' + st.name + '实景照片" loading="lazy">' +
        '<figcaption class="panel-credit">' + ph.credit + '</figcaption>' +
      '</figure>' +
      '<h3 class="panel-title"><span class="band-dot" style="background:' + st.color + '"></span>' +
        st.name + '</h3>' +
      '<p class="panel-region">' + st.region + '</p>' +
      '<div class="panel-stats">' +
        '<div class="p-stat"><b>' + st.alt + '</b><span>海拔</span></div>' +
        '<div class="p-stat"><b>' + st.season.replace(/，.*$/, '') + '</b><span>季节</span></div>' +
        '<div class="p-stat"><b>' + st.best + '</b><span>最佳时段</span></div>' +
      '</div>' +
      '<p class="panel-sec">代表类群</p>' +
      '<ul class="panel-targets">' + st.targets.slice(0, 4).map(function (zh) {
        var sp = byName[zh];
        return '<li>' + (sp
          ? '<a href="species-detail.html?id=' + sp.id + '">' + esc(zh) + '</a>'
          : esc(zh)) + '</li>';
      }).join('') + '</ul>' +
      '<a class="panel-more" href="#exp-card-' + st.key + '">查看本站完整攻略 ↓</a>';
  }

  function setActiveDot(key) {
    dotsEl.querySelectorAll('.station-dot').forEach(function (g) {
      g.classList.toggle('active', g.dataset.key === key);
    });
  }

  /* 点击圆点：面板 + 大卡片 + 月份条同步切换到对应站 */
  function selectStation(st) {
    setActiveDot(st.key);
    /* 面板顶边条随站点色切换 */
    var mp = document.querySelector('.map-panel');
    if (mp) mp.style.borderTop = '4px solid ' + st.color;
    if (!panelShown) {
      panelShown = true;
      panelHint.hidden = true;
      panelBody.hidden = false;
      panelBody.innerHTML = panelHTML(st);
    } else {
      swapFade(panelBody, function () {
        panelBody.innerHTML = panelHTML(st);
      });
    }
    if (st.key !== activeStation.key) {
      activeStation = st;
      swapFade(cardsEl, function () {
        cardsEl.innerHTML = cardHTML(st);
      });
    }
  }

  dotsEl.addEventListener('click', function (e) {
    var g = e.target.closest('.station-dot');
    if (!g) return;
    var st = STATIONS.filter(function (s) { return s.key === g.dataset.key; })[0];
    if (st) selectStation(st);
  });
  dotsEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      var g = e.target.closest('.station-dot');
      if (g) g.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
  });
})();
