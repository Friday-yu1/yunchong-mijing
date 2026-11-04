/* ============================================
   Quiz：测测你是什么虫侦探（首页）
   从互动区迁移至此；结果存 yc-quiz
   ============================================ */
(function () {
  'use strict';

  var QUIZ = [
    { q: '蝴蝶和蛾子的区别？', opts: ['触角棒状 vs 羽状', '蝴蝶大蛾子小', '没区别'] },
    { q: '下面哪个是昆虫？', opts: ['蜘蛛', '蜈蚣', '瓢虫'] },
    { q: '甲虫的前翅叫什么？', opts: ['鞘翅', '鳞翅', '膜翅'] },
    { q: '萤火虫发光的部位？', opts: ['头部', '腹部末端', '胸部'] },
    { q: '观虫时应该？', opts: ['翻石头找虫', '安静观察不打扰', '捕捉回家'] }
  ];
  var ANSWERS = [0, 2, 0, 1, 1]; // 正确选项下标

  var quizBody = document.getElementById('quiz-body');
  var quizSubmit = document.getElementById('quiz-submit');
  var quizResult = document.getElementById('quiz-result');
  var quizEntry = document.getElementById('quiz-entry');
  var quizStart = document.getElementById('quiz-start');
  if (!quizBody || !quizSubmit || !quizResult) return;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  quizBody.innerHTML = QUIZ.map(function (item, qi) {
    return '<fieldset class="quiz-q"><legend>' + (qi + 1) + '. ' + esc(item.q) + '</legend>' +
      item.opts.map(function (opt, oi) {
        return '<label class="quiz-opt"><input type="radio" name="quiz-q' + qi + '" value="' + oi + '">' +
          String.fromCharCode(65 + oi) + '. ' + esc(opt) + '</label>';
      }).join('') +
      '</fieldset>';
  }).join('');

  /* 入口卡片：点击「开始测试」才展开题目 */
  if (quizStart && quizEntry) {
    quizStart.addEventListener('click', function () {
      quizEntry.hidden = true;
      quizBody.hidden = false;
      quizSubmit.hidden = false;
      document.querySelector('.quiz-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function labelFor(ans) {
    if (ans[4] === 1 && ans[3] === 1) return '你是夜行观察者';
    if (ans[0] === 0) return '你是花田蝴蝶迷';
    if (ans[1] === 2 && ans[2] === 0) return '你是严谨分类学家';
    return '你是虫境漫游者';
  }

  quizSubmit.addEventListener('click', function () {
    var ans = [];
    for (var qi = 0; qi < QUIZ.length; qi++) {
      var picked = quizBody.querySelector('input[name="quiz-q' + qi + '"]:checked');
      if (!picked) {
        quizResult.hidden = false;
        quizResult.innerHTML = '<p>还有第 ' + (qi + 1) + ' 题没作答哦。</p>';
        return;
      }
      ans.push(Number(picked.value));
    }
    var score = ans.filter(function (v, i) { return v === ANSWERS[i]; }).length;
    var labels = {
      '你是夜行观察者': '提着头灯走进黑夜的人——夜幕下的虫境由你解读。',
      '你是花田蝴蝶迷': '访花者的知己——晴天花甸上的翅影逃不过你的眼睛。',
      '你是严谨分类学家': '鞘翅、鳞翅分得清清楚楚——未来的昆虫学家就是你。',
      '你是虫境漫游者': '带着好奇心四处走走——每一条山道都有新发现。'
    };
    var label = labelFor(ans);
    var review = QUIZ.map(function (item, qi) {
      var ok = ans[qi] === ANSWERS[qi];
      return '<li class="' + (ok ? 'ok' : 'no') + '">' + (qi + 1) + '. ' +
        (ok ? '✓' : '✗ 正确答案：' + String.fromCharCode(65 + ANSWERS[qi])) + '</li>';
    }).join('');
    try {
      localStorage.setItem('yc-quiz', JSON.stringify({ ans: ans, score: score, label: label, time: Date.now() }));
    } catch (e) { /* 隐私模式下忽略 */ }
    quizResult.hidden = false;
    quizResult.innerHTML =
      '<h3>' + label + '</h3>' +
      '<p class="quiz-score">答对 ' + score + ' / 5 题</p>' +
      '<p class="quiz-tag-line">' + labels[label] + '</p>' +
      '<ul class="quiz-review">' + review + '</ul>';
  });
})();
