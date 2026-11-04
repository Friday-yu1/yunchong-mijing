/* ============================================
   物种详情页 · 渲染 + 对比滑杆 + 翻页
   数据来自共享模块 js/species-data.js（window.YC）
   说明：形态热区需待真实照片就位后按图标注，当前不渲染
   种级完整档案（引言/识别要点/快速事实等）逐种补充中，
   未补充的种自动回退：已有种级描述复用，其余显示「待补充」
   ============================================ */
(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var id = params.get('id') || 'sp-001';
  var sp = YC.byId[id];

  var root = document.getElementById('detail-root');

  /* ---------- 未找到物种 ---------- */
  if (!sp) {
    root.innerHTML = '<div class="detail-missing">'
      + '<h1>未找到该物种</h1>'
      + '<p>请从<a href="species.html">物种图鉴</a>重新选择。</p>'
      + '</div>';
    return;
  }

  var band = YC.bandMap[sp.band];
  var accent = band.color;
  var det = YC.detail[sp.num] || {};
  var idCode = det.code ||
    ('YN-' + (YC.orderCode[sp.order] || 'XXX') + '-' + String(sp.num).padStart(4, '0'));
  document.title = sp.zh + ' · 云虫秘境物种详情';

  function setText(elId, text) {
    document.getElementById(elId).textContent = text;
  }
  function setOrPending(elId, value) {
    var el = document.getElementById(elId);
    el.textContent = value || '待补充';
    el.classList.toggle('pending', !value);
  }

  /* ---------- 左栏：名称 + 引言 + 信息区 ---------- */
  setText('d-name', sp.zh);
  var latinEl = document.getElementById('d-latin');
  latinEl.textContent = sp.latin;
  if (sp.tbd) latinEl.classList.add('tbd');

  setOrPending('d-intro', det.intro);

  // 野外识别：编号要点；无数据时显示待补充
  var ol = document.getElementById('d-idpoints');
  if (det.idPoints && det.idPoints.length) {
    ol.innerHTML = det.idPoints.map(function (p) {
      return '<li>' + p + '</li>';
    }).join('');
  } else {
    ol.innerHTML = '<li class="pending">待补充</li>';
  }

  // 形态特征：完整档案 > 种级描述 > 目级描述
  setText('d-morph', det.morph ||
    YC.morphSpecies[sp.num] || YC.morph[sp.order] || '');
  setOrPending('d-behavior', det.behavior || YC.habit[sp.order]);
  setOrPending('d-habitat', det.habitatText);

  // 分布：完整档案优先，其次已核验备注 + 生态站短语
  var distText = det.distribution;
  if (!distText) {
    var note = YC.distNote[sp.num];
    distText = (note ? note + '。' : '') +
      '在' + band.phrase + '有分布记录（项目组整理数据）。';
  }
  setText('d-dist', distText);

  setOrPending('d-hosts', det.hosts);

  /* ---------- 物种图片（真实照片接入） ---------- */
  var hasMain = window.YC_IMG ? YC_IMG.hasMain(sp.num) : !!sp.photo;
  var hasB = window.YC_IMG && YC_IMG.hasB(sp.num);
  var dImg = document.getElementById('detail-img');
  var stagePh = document.getElementById('stage-ph');
  var thumbs = document.getElementById('stage-thumbs');
  var imgCredit = document.getElementById('img-credit');

  function creditText(key) {
    var c = window.YC_IMG && YC_IMG.credit(key);
    if (!c) return '';
    return c.length > 1 ? '摄影：' + c[0] + ' | ' + c[1] : '摄影：' + c[0];
  }

  if (hasMain) {
    dImg.hidden = false;
    dImg.src = YC_IMG.src(sp.num);
    dImg.alt = sp.zh + '照片';
    imgCredit.textContent = creditText(sp.num);
    document.getElementById('photo-stage').classList.add('has-img');
    if (hasB) {
      thumbs.hidden = false;
      thumbs.innerHTML =
        '<button type="button" class="stage-thumb active" data-key="' + sp.num + '" aria-label="主图">' +
        '<img src="' + YC_IMG.src(sp.num) + '" alt=""></button>' +
        '<button type="button" class="stage-thumb" data-key="' + sp.num + 'b" aria-label="补充图">' +
        '<img src="' + YC_IMG.src(sp.num + 'b') + '" alt=""></button>';
      thumbs.addEventListener('click', function (e) {
        var btn = e.target.closest('.stage-thumb');
        if (!btn) return;
        thumbs.querySelectorAll('.stage-thumb').forEach(function (t) {
          t.classList.toggle('active', t === btn);
        });
        dImg.src = YC_IMG.src(btn.dataset.key);
        imgCredit.textContent = creditText(btn.dataset.key);
      });
    }
  } else {
    stagePh.hidden = false;
  }

  // 署名（CC 许可要求保留作者署名；项目组自摄待归档种不出现个人信息）
  document.getElementById('d-credit').textContent = hasMain
    ? creditText(sp.num)
    : '影像整理中 · 投稿图片将署名并采用 CC-BY 4.0';

  /* ---------- 成虫期月份条 ---------- */
  var monthBar = document.getElementById('month-bar');
  var months = det.months || [];
  var html = '';
  for (var m = 1; m <= 12; m++) {
    var on = months.indexOf(m) !== -1;
    html += '<span class="month-cell' + (on ? ' on' : '') + '" title="' + m + '月">'
      + m + '</span>';
  }
  monthBar.innerHTML = html;
  if (!months.length) monthBar.classList.add('empty');

  /* ---------- 右栏：分类地位 ---------- */
  setText('t-order', sp.orderLabel);
  var family = det.family || sp.family;
  var genus = det.genus || sp.genus;
  setOrPending('t-family', family === '待鉴定' ? '' : family);
  setOrPending('t-genus', genus === '待鉴定' || genus === '待定' ? '' : genus);
  setText('t-zh', sp.zh);
  var tLatin = document.getElementById('t-latin');
  tLatin.textContent = sp.latin;
  if (sp.tbd) tLatin.classList.add('tbd');

  var tbdTag = sp.tbd ? '<span class="detail-tag tag-tbd">待鉴定</span>' : '';
  var protectTag = sp.protect
    ? '<span class="detail-tag tag-protect">' + sp.protect + '</span>' : '';

  /* ---------- 标签系统：核验状态 + 生态标签 ---------- */
  var ecoTags = [];
  if (sp.order === 'butterfly') ecoTags.push('蝴蝶主角');
  if (sp.order === 'moth') ecoTags.push('灯诱常客');
  var behaviorText = det.behavior || (YC.habit[sp.order] || '');
  if (behaviorText.indexOf('夜') !== -1) ecoTags.push('夜行性');
  if (sp.band === 'gaoligong' || sp.band === 'alpine') ecoTags.push('高山带');
  var verifyTag = det.intro
    ? '<span class="detail-tag tag-verified">已核验</span>'
    : '<span class="detail-tag tag-tbd">待核验</span>';
  var ecoTagsHtml = ecoTags.map(function (t) {
    return '<span class="detail-tag ' + (t === '夜行性' ? 'tag-night' : 'tag-eco') + '">' + t + '</span>';
  }).join('');
  document.getElementById('t-tags').innerHTML = ''
    + verifyTag
    + '<span class="detail-tag tag-band">'
    +   '<i class="band-dot" style="background:' + accent + '"></i>' + band.label
    + '</span>'
    + protectTag + tbdTag + ecoTagsHtml;

  /* ---------- 记录完整度 ---------- */
  var checks = [
    [hasMain, '实拍影像'],
    [det.intro, '一句话引言'],
    [det.idPoints && det.idPoints.length, '野外识别要点'],
    [det.morph || YC.morphSpecies[sp.num], '形态描述'],
    [det.distribution || YC.distNote[sp.num], '分布记录'],
    [det.months && det.months.length, '成虫期']
  ];
  var doneCnt = checks.filter(function (c) { return c[0]; }).length;
  var pct = Math.round(doneCnt / checks.length * 100);
  document.getElementById('pct-fill').style.width = pct + '%';
  document.getElementById('pct-val').textContent = pct + '%';
  var missing = checks.filter(function (c) { return !c[0]; }).map(function (c) { return c[1]; });
  document.getElementById('pct-note').textContent = pct === 100
    ? '档案字段齐全，等待实拍影像归档后即为完整标本记录。'
    : (hasMain ? '' : '缺实拍影像；') + (pct < 100 && hasMain ? '待补：' : '缺：') +
      (missing.length ? missing.join('、') : '') + '。';

  /* ---------- 面包屑 ---------- */
  document.getElementById('crumb-order').innerHTML =
    '<a href="species.html?order=' + sp.order + '">' + sp.orderLabel + '</a>';
  document.getElementById('crumb-family').textContent = (det.family || sp.family) || '待鉴定';
  document.getElementById('crumb-species').textContent = sp.zh;

  /* ---------- 主图 tab：2D 照片 / 3D 模型 ---------- */
  document.querySelector('.stage-tabs').addEventListener('click', function (e) {
    var btn = e.target.closest('.stage-tab');
    if (!btn) return;
    this.querySelectorAll('.stage-tab').forEach(function (t) {
      var on = t === btn;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on);
    });
    document.getElementById('photo-stage').hidden = btn.dataset.stage !== 'photo';
    document.getElementById('model-stage').hidden = btn.dataset.stage !== 'model';
  });

  /* ---------- 右栏：快速事实表 ---------- */
  var facts = [
    ['档案编号', idCode, true],
    ['海拔范围', det.altitude, false],
    ['成虫期', det.adultPeriod, false],
    ['食性', det.diet, false],
    ['生境', det.habitat || det.habitatText, false],
    ['体型 / 翅展', det.size, false],
    ['最近校核', det.checked || (det.intro ? '2026-11-02' : ''), false]
  ];
  document.getElementById('fact-table').innerHTML = facts.map(function (f) {
    var val = f[2] || f[1] ? f[1] : '';
    var pending = !(f[2] || f[1]);
    return '<div class="fact-row">'
      + '<dt>' + f[0] + '</dt>'
      + '<dd class="' + (pending ? 'pending' : '') + '">'
      + (pending ? '待补充' : val) + '</dd></div>';
  }).join('');

  /* ---------- 右栏：引用格式 ---------- */
  var today = new Date();
  var dateStr = today.getFullYear() + '-'
    + String(today.getMonth() + 1).padStart(2, '0') + '-'
    + String(today.getDate()).padStart(2, '0');
  var citeStr = '云虫秘境项目组. ' + sp.zh + ' ' + sp.latin +
    '. 云虫秘境物种档案 ' + idCode + ' [EB/OL]. 2026.（访问日期：' + dateStr + '）';
  setText('cite-text', citeStr);

  var copyBtn = document.getElementById('cite-copy');
  copyBtn.addEventListener('click', function () {
    function done() {
      copyBtn.textContent = '已复制 ✓';
      setTimeout(function () { copyBtn.textContent = '复制引用'; }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(citeStr).then(done);
    } else {
      var ta = document.createElement('textarea');
      ta.value = citeStr;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      done();
    }
  });

  /* ---------- 对比滑杆：相似种映射（80 种全覆盖） ----------
   * 字段：
   *   name         本种中文名 vs 对比种中文名
   *   comparePhoto 对比种真实照片直链（Wikimedia Commons / iNaturalist CC）；空串表示暂缺
   *   tips         2-3 句通俗野外区分要点
   * 选取原则：同属/同科、野外最易混淆、中国（尤其云南）有分布；待鉴定种用同科近似种
   */
  var SIMILAR_PAIR = {
    // 鞘翅目
    1: {
      name: '巨叉锹甲 vs 斑股深山锹甲',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Lucanus_maculifemoratus_maculifemoratus_sjh.jpg/1000px-Lucanus_maculifemoratus_maculifemoratus_sjh.jpg',
      tips: '斑股深山锹甲雄虫大颚短粗，不像巨叉锹甲那样又长又向上弯；最明显的是它后腿腿节上有一块黄褐色的斑（"斑股"由此得名）。巨叉锹甲大颚极长、弯成鹿角状，两者大颚长短一眼可分。'
    },
    2: {
      name: '格彩臂金龟 vs 阳彩臂金龟',
      comparePhoto: 'https://inaturalist-open-data.s3.amazonaws.com/photos/143086860/large.jpg',
      tips: '臂金龟雌雄前足都特别细长。格彩臂金龟鞘翅上有大片鲜艳的金绿色闪光斑；阳彩臂金龟鞘翅以黄褐色为主、绿色部分较窄。看翅面上绿色斑块的大小就能区分。'
    },
    3: {
      name: '细角尤犀金龟 vs 双叉犀金龟',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Trypoxylus_dichotomus_135465060.jpg/1000px-Trypoxylus_dichotomus_135465060.jpg',
      tips: '双叉犀金龟（独角仙）头顶只有一根长角、末端分二叉，前胸背板上没有角；细角尤犀金龟除头角外，前胸背板还另有角突，看起来头上有两个以上的角。数角的数量即可区分。'
    },
    4: {
      name: '铁甲（待鉴定）vs 稻铁甲',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Rice_Hispa_(6282950178).jpg/1000px-Rice_Hispa_(6282950178).jpg',
      tips: '稻铁甲身体扁长、前胸和鞘翅边缘长满刺突，常在水稻叶上啃出白色条斑。本种为待鉴定铁甲，可对照"边缘带刺、长椭圆形"这一整体特征。'
    },
    5: {
      name: '七星瓢虫 vs 龟纹瓢虫',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Propylea_japonica.JPG/1000px-Propylea_japonica.JPG',
      tips: '七星瓢虫鞘翅橙红、两侧各3个大圆黑斑加会合处1个，共7个大斑；龟纹瓢虫鞘翅黄底，黑斑小而连成不规则的网状纹路（像龟壳纹），斑的数量不固定。看黑斑是大圆斑还是网纹即可区分。'
    },
    6: {
      name: '异色瓢虫 vs 七星瓢虫',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Coccinella_septempunctata_Luc_Viatour.JPG/1000px-Coccinella_septempunctata_Luc_Viatour.JPG',
      tips: '异色瓢虫斑纹变化极大（从全黑到全黄都有），但鞘翅末端近尾部有一条明显的横向压痕；七星瓢虫固定7个大圆黑斑、鞘翅上没有这条横压痕。看尾部那道横压痕最稳。'
    },
    7: {
      name: '六斑异瓢虫 vs 多异瓢虫',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Hippodamia_variegata_1.jpg/1000px-Hippodamia_variegata_1.jpg',
      tips: '六斑异瓢虫体型明显偏大，鞘翅橙红上只有6个大黑斑；多异瓢虫体型小一圈，鞘翅灰黄或橙黄，黑斑小而多、常排成两列，前胸有黑白相间花纹。比体型大小和黑斑大小即可区分。'
    },
    8: {
      name: '星天牛 vs 光肩星天牛',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Anoplophora_glabripennis_142849981.jpg/1000px-Anoplophora_glabripennis_142849981.jpg',
      tips: '星天牛鞘翅基部（靠近前胸的一截）布满密密麻麻的小颗粒、摸起来粗糙；光肩星天牛鞘翅基部光滑无颗粒（"光肩"由此得名）。两者都是黑底白斑，用手摸翅基是否粗糙即可区分。'
    },
    9: {
      name: '桑天牛 vs 云斑白条天牛',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Batoceralineolata.JPG/1000px-Batoceralineolata.JPG',
      tips: '桑天牛全身密被黄褐色绒毛、样子灰扑扑；云斑白条天牛体型更大，鞘翅上有灰白色云状斑纹，前胸背板两侧各有一个尖刺。看体型和云状白斑即可区分。'
    },
    10: {
      name: '桃红颈天牛 vs 红缘天牛',
      comparePhoto: 'https://inaturalist-open-data.s3.amazonaws.com/photos/698455395/large.jpg',
      tips: '桃红颈天牛身体亮黑色，前胸背板（颈部）整圈都是鲜亮的红色、有光泽；红缘天牛前胸黑色、只有两侧边缘镶一条窄红边（"红缘"），中间并不红。看"脖子"是整圈红还是只两边红即可。'
    },
    11: {
      name: '松墨天牛 vs 双条杉天牛',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Semanotus_bifasciatus.jpg/1000px-Semanotus_bifasciatus.jpg',
      tips: '松墨天牛触角极长、常超过身体一倍，鞘翅有黑白相间的纵纹；双条杉天牛体型短粗，触角短，鞘翅上有两条明显的棕黄色横带。看触角长短和鞘翅上是纵纹还是横带即可区分。'
    },
    12: {
      name: '云南扁萤 vs 红胸黑翅萤',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/202505_紅胸黑翅螢特寫_(Luciola_kagiana_).jpg/1000px-202505_紅胸黑翅螢特寫_(Luciola_kagiana_).jpg',
      tips: '云南扁萤雌虫没有翅膀、身体扁平像个大幼虫、通体黑；红胸黑翅萤有完整的黑色鞘翅，前胸背板（前胸）是桃红或粉红色，一眼就能看到那块红色。'
    },
    13: {
      name: '云南窗萤 vs 胸窗萤',
      comparePhoto: 'https://inaturalist-open-data.s3.amazonaws.com/photos/324815850/large.jpg',
      tips: '两者都是窗萤、雄虫有翅。胸窗萤前胸背板前缘有一对半透明的"窗户"状浅斑；云南窗萤雄虫腹部末端的发光器极发达，夜晚黄绿色光更亮。看前胸是否有透明窗斑即可区分。'
    },
    14: {
      name: '大灰象甲 vs 蒙古灰象甲',
      comparePhoto: 'https://inaturalist-open-data.s3.amazonaws.com/photos/700039850/large.jpg',
      tips: '大灰象甲全身覆灰白色鳞片、喙较粗；蒙古灰象甲体型更小、体色灰褐，鞘翅背面有浅纵沟。两者都是不会飞、爱装死的灰色小象，看体型大小和灰调深浅即可区分。'
    },
    15: {
      name: '铜绿丽金龟 vs 黄褐丽金龟',
      comparePhoto: 'https://inaturalist-open-data.s3.amazonaws.com/photos/611221378/large.jpg',
      tips: '铜绿丽金龟通体铜绿色、有金属光泽；黄褐丽金龟整体黄褐色、没有金属绿，阳光下只泛暗黄色。看身体是否有金属绿色即可区分。'
    },
    16: {
      name: '白星花金龟 vs 小青花金龟',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Gametis_jucunda_(Faldermann,_1835)_(3303711015).jpg/1000px-Gametis_jucunda_(Faldermann,_1835)_(3303711015).jpg',
      tips: '白星花金龟个头大（约2厘米多），古铜色鞘翅上散布不规则的小白斑；小青花金龟体型小一圈（约1厘米多），绿铜色、斑点偏黄白。比体型大小即可区分。'
    },
    17: {
      name: '黄粉鹿花金龟 vs 日铜罗花金龟',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Pseudotorynorrhina_japonica.jpg/1000px-Pseudotorynorrhina_japonica.jpg',
      tips: '黄粉鹿花金龟雄虫头面有鹿角状的分叉突起、体色偏黄粉；日铜罗花金龟全身铜绿或紫铜色光滑发亮、头上没有鹿角突。看头上有没有鹿角状分叉即可区分。'
    },
    18: {
      name: '暗黑鳃金龟 vs 华北大黑鳃金龟',
      comparePhoto: 'https://inaturalist-open-data.s3.amazonaws.com/photos/503878243/large.jpg',
      tips: '两者都是黑褐色、土里钻的鳃金龟，很难分。粗略看：暗黑鳃金龟体型偏小、鞘翅光泽较暗；华北大黑鳃金龟体型更大、触角鳃片部更宽。野外以体型大小和光泽强弱大致区分。'
    },
    19: {
      name: '红色金属叶甲（待鉴定）vs 稻负泥虫',
      comparePhoto: 'https://inaturalist-open-data.s3.amazonaws.com/photos/652046289/large.jpg',
      tips: '稻负泥虫身体蓝黑、前胸黄红色，幼虫背上总驮着一团黑粪便（"负泥"）；本种为通体红色金属光泽的叶甲，整体色调和稻负泥虫的蓝黑+黄红差别明显。'
    },
    20: {
      name: '青翅蚁形隐翅虫 vs 梭毒隐翅虫',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Paederus_fuscipes_Curtis,_1826_(9772362315).png/1000px-Paederus_fuscipes_Curtis,_1826_(9772362315).png',
      tips: '这两个中文名其实指的是同一种（毒隐翅虫 Paederus fuscipes）。野外见到细长红黑相间、头尾黑色、鞘翅金属蓝绿色的小虫就是它，体液有毒，吹走别拍。'
    },
    // 鳞翅目·蝶
    21: {
      name: '金斑喙凤蝶 vs 金带喙凤蝶',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Open_wing_puddling_position_of_Teinopalpus_imperialis_Hope,_1843_-_Kaiser-i-Hind.jpg/1000px-Open_wing_puddling_position_of_Teinopalpus_imperialis_Hope,_1843_-_Kaiser-i-Hind.jpg',
      tips: '金斑喙凤蝶后翅的金色是较小、分散的斑点；金带喙凤蝶后翅有一条宽阔醒目的金黄色横带，像围了一条金腰带。看金色是"斑"还是"带"，一眼就能分开。'
    },
    22: {
      name: '金裳凤蝶 vs 裳凤蝶',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Common_birdwing_(Troides_helena),_Lawachara_National_Park.jpg/1000px-Common_birdwing_(Troides_helena),_Lawachara_National_Park.jpg',
      tips: '金裳凤蝶后翅金黄色斑块大而连成一片，外缘黑色锯齿较窄；裳凤蝶后翅黄色斑块小而分散，外缘黑色带更宽。整体金裳凤蝶"更黄更大片"。'
    },
    23: {
      name: '箭环蝶 vs 纹环蝶',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Close_wing_of_Aemona_amathusia_(Hewitson,_1867)_-_Yellow_Dryad.jpg/1000px-Close_wing_of_Aemona_amathusia_(Hewitson,_1867)_-_Yellow_Dryad.jpg',
      tips: '箭环蝶前后翅外缘有一排箭头状（矛头形）黑斑，像一排小鱼图案；纹环蝶整体偏淡黄色，外缘没有这排箭簇状黑斑，而是两条较直的深色横带。'
    },
    24: {
      name: '美凤蝶 vs 玉带凤蝶',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Open_wing_basking_position_of_Papilio_polytes_(Linnaeus,1758)_–_Common_Mormon_(Male).jpg/1000px-Open_wing_basking_position_of_Papilio_polytes_(Linnaeus,1758)_–_Common_Mormon_(Male).jpg',
      tips: '美凤蝶雄蝶通体黑色、后翅没有白色横带；玉带凤蝶无论雌雄，后翅中部都有一排整齐相连的白色小斑，像围了一条白玉带。看到"玉带"就是玉带凤蝶。'
    },
    25: {
      name: '枯叶蛱蝶 vs 蠹叶蛱蝶',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Autumn_leaf_(Doleschallia_bisaltide)_Bali_I.jpg/1000px-Autumn_leaf_(Doleschallia_bisaltide)_Bali_I.jpg',
      tips: '枯叶蛱蝶合拢翅膀时高度模拟枯叶，有一条对称清晰的纵脉纹和尖出的"叶柄"；蠹叶蛱蝶（秋叶蛱蝶）正面是橙黄色、反面褐色，虽也似枯叶但没有那条逼真的中脉线。'
    },
    26: {
      name: '碧凤蝶 vs 绿带翠凤蝶',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Papilio_maackii_male.JPG/1000px-Papilio_maackii_male.JPG',
      tips: '碧凤蝶翅面是整片弥散的蓝绿色金属光泽，没有成条的绿纹；绿带翠凤蝶前翅有一条边界清晰的黄绿色横带，这条横带是它的标志。'
    },
    27: {
      name: '蓝凤蝶 vs 碧凤蝶',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Open_wing_position_of_Papilio_bianor_Cramer,_1777_–_Common_Peacock_(Male)_WLB_DSC_0450.jpg/1000px-Open_wing_position_of_Papilio_bianor_Cramer,_1777_–_Common_Peacock_(Male)_WLB_DSC_0450.jpg',
      tips: '蓝凤蝶通体墨黑，雄蝶只在阳光下隐约泛蓝紫色，翅面看不到绿色鳞粉；碧凤蝶满翅都有闪眼的蓝绿色金属光泽，颜色明显更"花"。'
    },
    28: {
      name: '翠蓝眼蛱蝶 vs 美眼蛱蝶',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Junonia_almana-Kadavoor-2016-07-11-002.jpg/1000px-Junonia_almana-Kadavoor-2016-07-11-002.jpg',
      tips: '翠蓝眼蛱蝶雄蝶后翅有一大块鲜艳的蓝绿色金属斑；美眼蛱蝶翅膀是橙黄色底色、缀着几个大眼睛斑，完全没有蓝色。看有没有那块蓝绿色即可分辨。'
    },
    29: {
      name: '燕凤蝶 vs 绿带燕凤蝶',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Open_wing_dorsal_basking_activity_of_Lamproptera_meges_(Zincken,_1831)_-_Green_Dragontail_WLB_DSC_8459.jpg/1000px-Open_wing_dorsal_basking_activity_of_Lamproptera_meges_(Zincken,_1831)_-_Green_Dragontail_WLB_DSC_8459.jpg',
      tips: '燕凤蝶前后翅有一大块透明斑，但没有绿色横纹；绿带燕凤蝶在透明斑上多出一条清晰的浅绿色横带，尾突细长如丝。'
    },
    30: {
      name: '橙翅襟粉蝶 vs 黄尖襟粉蝶',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Anthocharis_scolymus_(male)_on_Anthriscus_sylvestris.jpg/1000px-Anthocharis_scolymus_(male)_on_Anthriscus_sylvestris.jpg',
      tips: '橙翅襟粉蝶雄蝶前翅顶角有一块醒目的橙色斑；黄尖襟粉蝶雄蝶顶角斑是淡黄色而非橙色，颜色偏浅。看顶角是橙还是黄就能分开。'
    },
    // 鳞翅目·蛾
    31: {
      name: '乌桕大蚕蛾 vs 樗蚕',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Samia_cynthia_adult_male_sjh.JPG/1000px-Samia_cynthia_adult_male_sjh.JPG',
      tips: '乌桕大蚕蛾体型巨大，前翅顶角突出像蛇头，每片翅中央有一个三角形半透明窗斑；樗蚕体型小一圈，翅面均匀黄褐色、带一条白色横带，没有蛇头状顶角。'
    },
    32: {
      name: '绿尾大蚕蛾 vs 长尾大蚕蛾',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Actias_dubernardi_male_sjh.jpg/1000px-Actias_dubernardi_male_sjh.jpg',
      tips: '绿尾大蚕蛾翅粉绿色、后翅尾突像飘带、末端略膨大；长尾大蚕蛾尾突更长更细、像两根垂下的丝线，翅色更偏淡青。比谁的尾巴又细又长。'
    },
    33: {
      name: '鬼脸天蛾 vs 芝麻鬼脸天蛾',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Acherontia_styx_styx_MHNT_Female_Dos.jpg/1000px-Acherontia_styx_styx_MHNT_Female_Dos.jpg',
      tips: '鬼脸天蛾胸部背面的骷髅形纹偏棕褐色、较宽大；芝麻鬼脸天蛾肩板（骷髅纹两侧）带明显青蓝色，骷髅纹更细长，腹部有黄黑相间的横纹。'
    },
    34: {
      name: '豆天蛾 vs 洋槐天蛾',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Clanis_deucalion_BMNHE813931_male_up.jpg/1000px-Clanis_deucalion_BMNHE813931_male_up.jpg',
      tips: '豆天蛾前翅黄褐色、略带绿色调，外缘有一条较明显的暗绿色曲线；洋槐天蛾整体偏赭黄、灰褐色，颜色更暗沉，翅上斜纹不如豆天蛾清晰。'
    },
    35: {
      name: '褐边绿刺蛾 vs 双齿绿刺蛾',
      comparePhoto: '',
      tips: '褐边绿刺蛾前翅大部翠绿，外缘有一条较宽、边界清楚的棕褐色边带；双齿绿刺蛾（棕边绿刺蛾）整体绿色偏暗、外缘棕色带较窄，体型略小。对比种照片暂缺，参考文字描述识别。'
    },
    36: {
      name: '斜纹夜蛾 vs 甜菜夜蛾',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Spodoptera_exigua_229766975.jpg/1000px-Spodoptera_exigua_229766975.jpg',
      tips: '斜纹夜蛾前翅灰褐色、斑纹复杂，雄蛾从前缘到后缘有一条明显的灰白色斜纹带；甜菜夜蛾体型更小，前翅灰褐色、没有那条醒目的斜纹，外线只是一串小点。'
    },
    37: {
      name: '桑斑雪灯蛾 vs 人纹污灯蛾',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Spilarctia_subcarnea_(15796894424).jpg/1000px-Spilarctia_subcarnea_(15796894424).jpg',
      tips: '桑斑雪灯蛾通体白色、翅面散布黑色小斑点；人纹污灯蛾翅白色，腹背（翻开可见）是明显的红色，前翅中后部常有一个黑色"人"字形斑纹。'
    },
    38: {
      name: '萝藦艳青尺蛾 vs 焦斑艳青尺蛾',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Agathia_visenda_on_exterior_wall.jpg/1000px-Agathia_visenda_on_exterior_wall.jpg',
      tips: '两者都是鲜亮的翠绿色尺蛾。萝藦艳青尺蛾腹部大部分呈焦枯的褐色；焦斑艳青尺蛾腹部多为绿色，仅翅外缘有零星焦褐色小斑。'
    },
    39: {
      name: '咖啡透翅天蛾 vs 小豆长喙天蛾',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Hummingbird_hawk_moth_(Macroglossum_stellatarum)_in_flight.jpg/1000px-Hummingbird_hawk_moth_(Macroglossum_stellatarum)_in_flight.jpg',
      tips: '咖啡透翅天蛾的翅膀几乎完全透明、像苍蝇一样没有鳞粉，腹部末端有黄色毛丛；小豆长喙天蛾翅膀是灰褐色不透明的，悬空飞行时长喙前伸。看翅膀透不透明。'
    },
    40: {
      name: '核桃豹蠹蛾 vs 六星黑点豹蠹蛾',
      comparePhoto: '',
      tips: '核桃豹蠹蛾（多斑豹蠹蛾）灰白色翅膀上密布大量小黑点、排列较密；六星黑点豹蠹蛾翅上黑斑较少、排列成规则的六星状。对比种照片暂缺，参考文字描述识别。'
    },
    // 膜翅目
    41: {
      name: '中华蜜蜂 vs 意大利蜂',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/European_honey_bee_extracts_nectar.jpg/1000px-European_honey_bee_extracts_nectar.jpg',
      tips: '意大利蜂工蜂体型较大（约12-14mm），腹部黄色区宽大、第二腹节黄斑明显，绒毛浅黄、吻更长；中华蜜蜂略小（约10-13mm），腹部黄色环带窄、整体偏深黑，绒毛密而偏灰。'
    },
    42: {
      name: '意大利蜂 vs 中华蜜蜂',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Apis_cerana_08354.jpg/1000px-Apis_cerana_08354.jpg',
      tips: '中华蜜蜂工蜂体型略小，腹部黑色环带多而黄色区窄，整体体色偏深黑，绒毛密集呈灰色；意大利蜂体型更大更壮，腹部黄色区宽大、第二腹节黄斑明显，绒毛浅黄。'
    },
    43: {
      name: '大蜜蜂 vs 黑大蜜蜂',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/ApisLaboriosa1.jpg/1000px-ApisLaboriosa1.jpg',
      tips: '黑大蜜蜂体型更大（工蜂约17-18mm），体色接近全黑，腹部几乎无黄色带，常在高海拔岩壁下筑巢；大蜜蜂体型稍小，腹部有明显的金黄色环带，单个悬垂大型巢脾于树枝下。'
    },
    44: {
      name: '黑小蜜蜂 vs 小蜜蜂',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Apis_florea_worker_1.jpg/1000px-Apis_florea_worker_1.jpg',
      tips: '小蜜蜂工蜂约7-8mm，腹部第二、三节背板呈明显红褐/橙黄色，其余节黑色，露天筑小圆巢于灌木枝上；黑小蜜蜂体型相近但体色更深，腹部以黑色为主、仅基部略红。'
    },
    45: {
      name: '金环胡蜂 vs 黑尾胡蜂',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Black-tailed_hornet_(Vespa_ducalis_pulchra)_in_Japan.jpg/1000px-Black-tailed_hornet_(Vespa_ducalis_pulchra)_in_Japan.jpg',
      tips: '金环胡蜂是世界最大胡蜂（工蜂约30-40mm），头部橙黄，腹部除末端外各节都有黄黑相间的粗环纹；黑尾胡蜂体型略小（约24-32mm），腹部末端三节全黑、占腹部一半以上。黑尾胡蜂的"黑尾巴"是识别关键。'
    },
    46: {
      name: '黑尾胡蜂 vs 黄腰胡蜂',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Vespa_affinis_(Linnaeus,_1764)_Lesser_Banded_Hornet_(15686144603).jpg/1000px-Vespa_affinis_(Linnaeus,_1764)_Lesser_Banded_Hornet_(15686144603).jpg',
      tips: '黄腰胡蜂体型中等（约20-25mm），腹部前半段（第一、二节）为鲜明的橙黄色、后半段黑色，故称"黄腰"，胸部黑色、足褐色；黑尾胡蜂黄色区域更小、仅腹部基部有少量黄色，末端黑色部分更长。'
    },
    47: {
      name: '黄脚胡蜂 vs 黑盾胡蜂',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Vespa_bicolor.jpg/1000px-Vespa_bicolor.jpg',
      tips: '黄脚胡蜂（黄脚虎头蜂）中足和后足胫节以下明显鲜黄色，腹部黑色为主、每节后缘有细黄边；黑盾胡蜂头部正面几乎全黄，中胸背板（"盾片"）黑色并带一对黄色纵斑，足颜色偏浅黄褐。黄脚胡蜂的"黄脚"最醒目。'
    },
    48: {
      name: '黑盾胡蜂 vs 黄脚胡蜂',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Asian_hornet_(Vespa_velutina).jpg/1000px-Asian_hornet_(Vespa_velutina).jpg',
      tips: '黄脚胡蜂足端鲜黄色，腹部黑色为主、每节后缘有细黄边，整体偏暗、体型略纤细；黑盾胡蜂头部正面几乎全黄，中胸背板黑色带黄斑，腹部黄色斑纹更多更大。看足部和头部颜色即可区分。'
    },
    49: {
      name: '红黑长毛蚁（待鉴定）vs 日本弓背蚁',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Camponotus_japonicus_on_metallic_column_-_2.jpg/1000px-Camponotus_japonicus_on_metallic_column_-_2.jpg',
      tips: '日本弓背蚁大型工蚁体长约12-14mm，通体亮黑色、体表有细密刻点，腹部硕大呈卵形，是校园里常见的大黑蚂蚁；红黑长毛蚁体色为红黑相间（头胸部红褐、腹部黑色），体表毛较长。'
    },
    50: {
      name: '黄猄蚁 vs 红黑细长蚁',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Tetraponera_rufonigra_20210822_004440_0544_D500_Yathumon_M_A.jpg/1000px-Tetraponera_rufonigra_20210822_004440_0544_D500_Yathumon_M_A.jpg',
      tips: '黄猄蚁通体鲜黄至橙黄色，工蚁细长约8-10mm，用幼虫丝把树叶缀成叶巢，树栖；红黑细长蚁头胸部红褐色、腹部黑色，体型更细长，上颚发达、具螫针、行动敏捷。黄猄蚁通体一色、无黑斑是关键。'
    },
    // 双翅目
    51: {
      name: '不显口鼻蝇 vs 棕尾别麻蝇',
      comparePhoto: 'https://inaturalist-open-data.s3.amazonaws.com/photos/565910063/original.jpg',
      tips: '棕尾别麻蝇属麻蝇，胸部背面有三条黑色纵纹，腹部底色灰黑、带棋盘格状银灰色斑点，体型粗壮灰色；不显口鼻蝇属丽蝇类，体中型、腹部末端有红橙色斑，复眼红色，胸部灰色。麻蝇腹部的"棋盘格"花纹最易辨认。'
    },
    52: {
      name: '黄腹狭口食蚜蝇（待鉴定）vs 黑带食蚜蝇',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Episyrphus_balteatus_on_flower_2.jpg/1000px-Episyrphus_balteatus_on_flower_2.jpg',
      tips: '黑带食蚜蝇腹部黄色底色上有多条黑色横带，雌虫黄黑相间，复眼红褐色，翅透明，飞行时能空中悬停；黄腹狭口食蚜蝇腹部以黄色为主、黑斑较少较窄。食蚜蝇都拟态蜜蜂，但只有一对翅。'
    },
    53: {
      name: '亮绿蝇 vs 丝光绿蝇',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Common_green_bottle_flies_(Lucilia_sericata)_female_left_and_male_Bürgerpark.jpg/1000px-Common_green_bottle_flies_(Lucilia_sericata)_female_left_and_male_Bürgerpark.jpg',
      tips: '丝光绿蝇通体带明亮的金属铜绿/金绿色，腹部圆卵形，复眼红色，中胸侧板有短毛；亮绿蝇外形相似、金属绿色略偏蓝绿，两者肉眼难分，需靠翅脉和鬃毛细分。野外看到金属绿色的中型蝇基本就是绿蝇。'
    },
    54: {
      name: '黑带食蚜蝇 vs 大灰食蚜蝇',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Hoverfly_(Eupeodes_corollae)_female.jpg/1000px-Hoverfly_(Eupeodes_corollae)_female.jpg',
      tips: '大灰食蚜蝇腹部黄色斑纹呈弯月形/弧形，斑纹间有黑色横带，黄黑对比明显，复眼红色；黑带食蚜蝇腹部黑带更宽更直。看腹部黄斑形状即可区分。'
    },
    55: {
      name: '大蚊 vs 稻大蚊',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/キリウジガガンボ(Tipula_aino)_(15249733959).jpg/1000px-キリウジガガンボ(Tipula_aino)_(15249733959).jpg',
      tips: '稻大蚊体长约15-20mm，足细长易断，翅灰褐色带深色斑纹，无刺吸式口器、不咬人；大蚊属种类外形相似，体色多为灰褐色、胸部背面有明显"V"字形沟。大蚊常停在草丛墙上，像巨型蚊子但完全无害。'
    },
    56: {
      name: '中华斑虻 vs 华广虻',
      comparePhoto: 'https://inaturalist-open-data.s3.amazonaws.com/photos/309961179/original.jpeg',
      tips: '中华斑虻体型较小（约10-12mm），复眼色彩鲜艳带绿色斑纹，翅中央有黑色横带（花翅膀），足有黑白环纹；华广虻体型大（约20-22mm），翅透明无明显斑纹，复眼无鲜艳带纹，雌虫刺吸牛血。斑虻的"花翅膀"是关键。'
    },
    57: {
      name: '蚕饰腹寄蝇 vs 家蚕追寄蝇',
      comparePhoto: 'https://inaturalist-open-data.s3.amazonaws.com/photos/270532133/original.jpg',
      tips: '家蚕追寄蝇体中型灰色，胸部背面有四条黑色纵纹，腹部灰色带黑斑，尾部有短产卵器，是家蚕的主要寄生蝇；蚕饰腹寄蝇体中型、腹部背面有银灰色粉被和黑色斑纹，翅透明。看胸部纵纹条数即可区分。'
    },
    58: {
      name: '黑腹果蝇 vs 斑翅果蝇',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Drosophila_suzukii_170169589.jpg/1000px-Drosophila_suzukii_170169589.jpg',
      tips: '黑腹果蝇体长约3mm，浅黄褐色，腹部有黑色环纹，雄虫前翅无斑点，在腐烂水果上繁殖；斑翅果蝇雄虫翅膀末端有明显的圆形黑斑，雌虫产卵器大而坚硬可刺破果皮，是果树害虫。斑翅果蝇雄虫的"翅端黑斑"一眼可辨。'
    },
    // 直翅目
    59: {
      name: '云南负蝗 vs 短额负蝗',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Atractomorpha_sinensis.jpg',
      tips: '短额负蝗通体翠绿、体型细长匀称，颜面隆起短，常趴在阔叶草本叶片上；云南负蝗体型更粗壮，前胸背板较宽且具明显纵脊，体色常杂有黄褐色斑点，后足股节也更粗短。'
    },
    60: {
      name: '短额负蝗 vs 柳枝负蝗',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Atractomorpha_lata_female%2C_Burdwan%2C_West_Bengal%2C_India_17_10_2012.jpg/1280px-Atractomorpha_lata_female%2C_Burdwan%2C_West_Bengal%2C_India_17_10_2012.jpg',
      tips: '柳枝负蝗体型明显更大（雌虫可达40mm以上），体色多变、常呈褐色或枯草色，多栖于灌木枝条上；短额负蝗较小、多为鲜嫩绿色，停在阔叶草本上，头虽尖但身材小巧。'
    },
    61: {
      name: '中华剑角蝗 vs 短额负蝗',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Atractomorpha_sinensis.jpg',
      tips: '中华剑角蝗身体极细长如剑，头部尖长，触角扁宽呈剑状；短额负蝗虽是尖头，但身体短粗得多，触角是细长的丝状。两者都常见绿色，但剑角蝗身材修长得多。'
    },
    62: {
      name: '黑瘤黄星蝗 vs 棉蝗',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Chondracris_rosea_157295933.jpg/1280px-Chondracris_rosea_157295933.jpg',
      tips: '棉蝗通体翠绿、体型巨大粗壮，后足发达、后翅多带粉红色；黑瘤黄星蝗体色暗褐带紫，前胸背板布满黑色瘤状突起，前翅有黄色圆斑，和翠绿硕大的棉蝗一眼可分。'
    },
    63: {
      name: '优雅蝈螽 vs 暗褐蝈螽',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Gampsocleis_sedakovii_ssp._obscura_male.jpg/1280px-Gampsocleis_sedakovii_ssp._obscura_male.jpg',
      tips: '优雅蝈螽通体翠绿或黄绿，翅膀短缩只盖住腹部一半，是常被当鸣虫饲养的种类；暗褐蝈螽体色偏暗褐或褐绿色，体型略小，翅膀相对更长一些。两者都有长长的丝状触角。'
    },
    64: {
      name: '纺织娘 vs 似织螽',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Hexacentrus_japonicus.jpg/1280px-Hexacentrus_japonicus.jpg',
      tips: '纺织娘体型宽大像一片树叶，前翅宽阔如纺布、完整盖住腹部；似织螽身体细长，前足带刺、呈捕捉式，外形有点像小螳螂，是捕食性螽斯。'
    },
    65: {
      name: '油葫芦 vs 迷卡斗蟋',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Velarifictorus_micado.jpg/1280px-Velarifictorus_micado.jpg',
      tips: '油葫芦体型较大（约20mm），黑褐色有光泽，头顶有两条深色纵纹；迷卡斗蟋较小（约15mm），黑褐色、头圆饱满，就是常说的"斗蟋"。'
    },
    66: {
      name: '东方蝼蛄 vs 华北蝼蛄',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Gryllotalpa_unispina_Saussure%2C_1874.jpg/1280px-Gryllotalpa_unispina_Saussure%2C_1874.jpg',
      tips: '东方蝼蛄体型较小（约30mm），体色较浅、呈黄褐色；华北蝼蛄明显更大（约45mm），体色深褐。两者都有铲子状的挖掘前足和短短的复翅。'
    },
    // 半翅目
    67: {
      name: '荔蝽 vs 硕蝽',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Eurostus_validus.jpg/1280px-Eurostus_validus.jpg',
      tips: '荔蝽体大扁阔、棕褐色，前胸背板侧角圆钝；硕蝽体型更硕大，棕褐色，革片外缘常镶红边，小盾片发达。'
    },
    68: {
      name: '麻皮蝽 vs 茶翅蝽',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Brown_marmorated_stink_bug_adult.jpg/1280px-Brown_marmorated_stink_bug_adult.jpg',
      tips: '麻皮蝽体色灰褐斑驳，触角细长、末端几节黄白相间，体型偏长；茶翅蝽身体短圆呈盾形，棕褐色密布黑点，触角节间有浅色环带。'
    },
    69: {
      name: '稻绿蝽 vs 珀蝽',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Plautia_stali_%2830698316498%29.jpg/1280px-Plautia_stali_%2830698316498%29.jpg',
      tips: '稻绿蝽通体鲜绿色、卵圆形，小盾片末端有一个小白点；珀蝽同样是绿色，但前胸背板和小盾片边缘常镶一圈红或紫褐色边，体型稍宽短。'
    },
    70: {
      name: '九香虫 vs 小皱蝽',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/3/34/Cyclopelta_obscura_%28Lepeletier_%26_Serville%2C1828%29_Dindoridae_%2816242636512%29_%28cropped%29.jpg',
      tips: '九香虫长约17–20mm，紫黑褐色有光泽，长椭圆形；小皱蝽明显更小（约12mm），黑褐色无光泽，小盾片基部中央有一个倒三角形的黄棕色斑。（小皱蝽本种无Commons照片，图为同属近缘皱蝽，仅示整体形态。）'
    },
    71: {
      name: '黑蚱蝉 vs 蟪蛄',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Platypleura_kaempferi_01.jpg/1280px-Platypleura_kaempferi_01.jpg',
      tips: '黑蚱蝉通体黑色、体型大（约45mm），夏日鸣声洪亮；蟪蛄体型小（约20mm），前翅有深浅交错的云状斑纹，是初夏最先鸣叫的小型蝉。'
    },
    72: {
      name: '红蝽（待鉴定）vs 棉红蝽',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Dysdercus_cingulatus_2.jpg/1280px-Dysdercus_cingulatus_2.jpg',
      tips: '棉红蝽体狭长、鲜红色，前胸背板和鞘翅上有明显黑色横带；常见的小红蝽体型较圆短、以红色为主，黑斑较少。'
    },
    // 蜻蜓目
    73: {
      name: '碧伟蜓 vs 马大头',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Anax_nigrofasciatus_nigrofasciatus%28Male%2CJapan%2C2018.06.09%29.jpg/1280px-Anax_nigrofasciatus_nigrofasciatus%28Male%2CJapan%2C2018.06.09%29.jpg',
      tips: '碧伟蜓合胸黄绿色，雄虫腹部第1–2节膨大、呈明亮的天蓝色，是其标志特征；近似的大型蜓类合胸常带黑褐纵纹、腹部整体偏暗，不会有这样鲜亮的蓝色腹基。（注："马大头"在文献中常即指碧伟蜓的东亚亚种，本图借近缘大型蜓类示大体形态。）'
    },
    74: {
      name: '红蜻 vs 晓褐蜻',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Trithemis_aurora_male_2_by_kadavoor.jpg/1280px-Trithemis_aurora_male_2_by_kadavoor.jpg',
      tips: '红蜻通体鲜艳朱红，翅膀透明无斑纹，翅痣红色；晓褐蜻雄虫体色偏粉红紫红，翅基部有橙褐色熏染，体型略小纤细。'
    },
    75: {
      name: '截斑脉蜻 vs 网脉蜻',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Neurothemis_fulvia_1.JPG/1280px-Neurothemis_fulvia_1.JPG',
      tips: '截斑脉蜻前后翅端部透明、中部有一大段黑白相间的醒目斑纹；网脉蜻翅膀整体呈均匀的琥珀黄褐色，像一块棕黄色玻璃。'
    },
    76: {
      name: '黄蜻 vs 狭腹灰蜻',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Slender_skimmer_%28Orthetrum_sabina%29_male_Cyprus.jpg/1280px-Slender_skimmer_%28Orthetrum_sabina%29_male_Cyprus.jpg',
      tips: '黄蜻体色淡黄褐、通体较一致，翅透明、翅痣黄色，是长途迁徙的常见蜻蜓；狭腹灰蜻体色灰绿，腹部细长并带明显黑绿相间的条纹。'
    },
    77: {
      name: '黄狭扇蟌 vs 白狭扇蟌',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Copera_ciliata_%28Selys%2C_1863%29_female_%2823352866393%29.jpg',
      tips: '白狭扇蟌复眼和胸部常覆一层白色粉霜、足色偏白；黄狭扇蟌体色偏黄、足节带黄色。两者都是停栖时四翅竖立于背上的细小豆娘。'
    },
    // 螳螂目
    78: {
      name: '丽眼斑螳 vs 云眼斑螳',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Creobroter_by_kadavoor.jpg/1280px-Creobroter_by_kadavoor.jpg',
      tips: '丽眼斑螳前翅上的眼斑圆润、黑色圆心配浅色外圈，体色鲜绿；云眼斑螳前翅眼斑更大、形状不规则似云纹，体色偏黄绿并杂有褐斑。（云眼斑螳本种无Commons照片，图为眼斑螳属近缘种，仅示花螳整体形态与眼斑位置。）'
    },
    79: {
      name: '中华大刀螳 vs 狭翅大刀螳',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Tenodera_angustipennis_Saussure%28Pregnant%29_DSCN9575.jpg/1280px-Tenodera_angustipennis_Saussure%28Pregnant%29_DSCN9575.jpg',
      tips: '中华大刀螳体型大、前胸背板宽，前翅宽阔；狭翅大刀螳身体较细，前翅窄长，背部常贯一条黄褐色纵带。'
    },
    80: {
      name: '广斧螳 vs 勇斧螳',
      comparePhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Hierodula_membranacea_-_Wilhelma.jpg/1280px-Hierodula_membranacea_-_Wilhelma.jpg',
      tips: '广斧螳通体翠绿、前足腿节宽扁如斧；勇斧螳体型更粗大，前胸背板更长，通体翠绿或褐色。'
    }
  };

  var pair = SIMILAR_PAIR[sp.num];
  setText('compare-title', pair ? ('相似种对比：' + pair.name)
    : ('相似种对比：' + sp.zh + ' vs 相似种（待补充）'));

  // pane-a：本种照片
  var paneA = document.getElementById('pane-a');
  if (hasMain) {
    var aImg = document.createElement('img');
    aImg.src = YC_IMG.src(sp.num);
    aImg.alt = sp.zh + '照片';
    paneA.appendChild(aImg);
  }
  // pane-b：对比种照片
  var paneB = document.getElementById('pane-b');
  var bTag = paneB.querySelector('.pane-tag');
  if (pair && pair.comparePhoto) {
    var bImg = document.createElement('img');
    bImg.alt = (pair.name || '').split(' vs ')[1] + '照片';
    bImg.crossOrigin = 'anonymous';
    /* 加载中占位：外链（Wikimedia/iNaturalist）在国内访问较慢，先给出反馈避免黑屏 */
    var bLoad = document.createElement('span');
    bLoad.className = 'pane-tag';
    bLoad.textContent = '对比种照片加载中…';
    paneB.appendChild(bLoad);
    var bDone = false;
    bImg.onload = function () { bDone = true; if (bLoad.parentNode) bLoad.parentNode.removeChild(bLoad); };
    bImg.onerror = function () {
      if (this.dataset.retry === '1') {
        bLoad.textContent = '对比种照片加载失败：图片源（Wikimedia/iNaturalist）当前网络无法访问';
        bLoad.dataset.failed = '1';
        return;
      }
      this.dataset.retry = '1';
      setTimeout(function (el) { return function () { el.src = pair.comparePhoto; }; }(this), 1200);
    };
    /* 15 秒仍未完成则提示网络问题，图片继续在后台尝试 */
    setTimeout(function () {
      if (!bDone && !bLoad.dataset.failed && bLoad.parentNode) bLoad.textContent = '对比种照片连接缓慢：图片源当前网络访问不稳定，稍后可刷新重试';
    }, 15000);
    bImg.src = pair.comparePhoto;
    paneB.appendChild(bImg);
    if (bTag) bTag.textContent = (pair.name || '相似种').split(' vs ')[1] || '相似种';
  } else {
    paneB.innerHTML = '<span class="pane-tag">对比种照片整理中</span>';
  }
  // tips
  var tipsEl = document.getElementById('compare-tips');
  if (pair && pair.tips) {
    tipsEl.textContent = pair.tips;
  } else {
    tipsEl.textContent = '区分要点整理中。';
  }

  var range = document.getElementById('compare-range');
  var divider = document.getElementById('compare-divider');
  function syncCompare() {
    paneB.style.clipPath = 'inset(0 0 0 ' + range.value + '%)';
    divider.style.left = range.value + '%';
  }
  range.addEventListener('input', syncCompare);
  syncCompare();

  /* ---------- 收藏（localStorage 个人档案占位） ---------- */
  var FAV_KEY = 'yc-favs';
  function favs() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
    catch (e) { return []; }
  }
  var favBtn = document.getElementById('fav-btn');
  function syncFavBtn() {
    var has = favs().indexOf(sp.id) !== -1;
    favBtn.textContent = has ? '已加入个人档案 ✓' : '收藏加入个人档案';
    favBtn.classList.toggle('faved', has);
  }
  favBtn.addEventListener('click', function () {
    var list = favs();
    var i = list.indexOf(sp.id);
    if (i === -1) list.push(sp.id); else list.splice(i, 1);
    localStorage.setItem(FAV_KEY, JSON.stringify(list));
    syncFavBtn();
  });
  syncFavBtn();

  /* ---------- 上一个 / 下一个（按序号循环） ---------- */
  var prev = YC.species[(sp.num - 2 + YC.species.length) % YC.species.length];
  var next = YC.species[sp.num % YC.species.length];
  var prevLink = document.getElementById('prev-link');
  var nextLink = document.getElementById('next-link');
  prevLink.href = 'species-detail.html?id=' + prev.id;
  nextLink.href = 'species-detail.html?id=' + next.id;
  prevLink.textContent = '← ' + prev.zh;
  nextLink.textContent = next.zh + ' →';
})();
