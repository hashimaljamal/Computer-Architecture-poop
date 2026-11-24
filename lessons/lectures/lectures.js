/*
 * lectures.js - the Lessons section: every lecture as one long, scrollable page.
 *
 * The filter on the left (All / Mid 1 / Mid 2 / Final, or one button per lesson) is shared with
 * the Practice problems section, so picking "Mid 2" here also limits the practice tabs.
 *
 * Lecture content: call Lectures.register('<lesson id from curriculum.js>', function () { return html; })
 * from a file in this folder. A lesson without its own lecture content shows the matching
 * practice tab's lesson guide (the same text as its Lesson pop-up), if there is one.
 */
(function () {
  'use strict';

  var content = {};
  window.Lectures = { register: function (topic, fn) { content[topic] = fn; }, has: function (topic) { return !!content[topic]; } };

  // practice tab -> the class its pictures are styled with
  var STYLE = { 'lc3-encoding': 'lesson-lc3', 'pipelining': 'lesson-pipe', 'memory-design': 'lesson-memory', 'cache': 'lesson-cache',
                'io-systems': 'lesson-iomc', 'multicore': 'lesson-iomc', 'alu': 'lesson-iomc' };

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function C() { return window.Curriculum; }
  function practiceFor(topic) { var P = C().PRACTICE; return Object.keys(P).filter(function (k) { return P[k] === topic; })[0] || null; }

  var built = {};
  function lessonHtml(topic) {
    if (built[topic] !== undefined) return built[topic];
    var html = null, cls = '';
    try {
      if (content[topic]) html = content[topic]();
      else {
        var tab = practiceFor(topic);
        if (tab && window.Guide && Guide.has(tab)) { html = Guide.html(tab); cls = STYLE[tab] || ''; }
      }
    } catch (err) { console.error(err); html = '<p class="err">This lesson could not be shown.</p>'; }
    return (built[topic] = html ? { html: html, cls: cls } : null);
  }

  var TEMPLATE = `
    <h2 class="lesson-title">Lessons</h2>
    <div class="split"><div class="col-a">
      <details class="lp-fbox" data-o="fbox" open>
        <summary data-o="flabel">Filter</summary>
        <div class="lp-filter" data-o="filter"></div>
      </details>
      <details class="lp-toc" data-o="tocbox" open>
        <summary>Contents</summary>
        <nav data-o="toc" aria-label="Lesson contents"></nav>
      </details>
    </div><div class="col-b" data-o="scroll">
      <div data-o="body"></div>
    </div></div>
  `;

  function mount(el) {
    el.classList.add('lesson-lecs');
    el.innerHTML = TEMPLATE;
    function O(n) { return el.querySelector('[data-o="' + n + '"]'); }
    var F = Lessons.filter;
    F.bind(O('filter'));
    if (window.matchMedia && window.matchMedia('(max-width: 899px)').matches) { O('tocbox').open = false; O('fbox').open = false; }

    function render() {
      F.render(O('filter'));
      O('flabel').textContent = 'Showing: ' + F.label();
      var on = F.get(), list = C().TOPICS.filter(function (t) { return on[t.id]; });
      var shown = [], missing = [];
      list.forEach(function (t) { var c = lessonHtml(t.id); if (c) shown.push({ t: t, c: c }); else missing.push(t); });
      var h = '';
      if (!list.length) h = '<div class="lp-empty"><p><b>No lessons picked.</b></p><p class="muted">Choose an exam or some lessons on the left.</p></div>';
      if (missing.length) {
        h += '<div class="lp-missing"><b>Not added yet:</b> ' + missing.map(function (t) { return esc(t.title); }).join(', ') +
          '. These lectures will appear here once their slides are added.</div>';
      }
      shown.forEach(function (s, i) {
        var t = s.t, tab = practiceFor(t.id);
        var badges = t.exams.map(function (x) { var e = C().EXAMS.filter(function (y) { return y.id === x; })[0]; return e ? '<span class="lp-badge">' + e.title + '</span>' : ''; }).join('');
        h += '<article class="lp-lesson" id="lec-' + t.id + '"><header class="lp-head"><h2>' + esc(t.title) + '</h2><div class="lp-meta">' + badges +
          (tab ? '<a class="pb lp-go" href="#' + tab + '">Practice problems →</a>' : '') + '</div></header>' +
          '<div class="gtext ' + s.c.cls + '">' + s.c.html + '</div></article>';
      });
      O('body').innerHTML = h;
      // number the headings for the contents list and links
      var toc = '';
      shown.forEach(function (s) {
        var art = O('body').querySelector('#lec-' + s.t.id), subs = art.querySelectorAll('.gtext h3');
        toc += '<div class="lp-ti"><a href="#lessons/' + s.t.id + '" data-jump="lec-' + s.t.id + '" data-topic="' + s.t.id + '">' + esc(s.t.title) + '</a>';
        if (subs.length) {
          toc += '<ul>';
          Array.prototype.forEach.call(subs, function (h3, i) {
            h3.id = 'lec-' + s.t.id + '-' + i;
            toc += '<li><a href="#lessons/' + s.t.id + '" data-jump="' + h3.id + '">' + esc(h3.textContent.replace(/^\d+\.\s*/, '')) + '</a></li>';
          });
          toc += '</ul>';
        }
        toc += '</div>';
      });
      O('toc').innerHTML = toc || '<p class="muted small">Nothing to show.</p>';
      watch();
    }

    // highlight the lesson being read (the last one whose top has scrolled past the top area)
    var raf = 0;
    function mark() {
      raf = 0;
      var arts = O('body').querySelectorAll('.lp-lesson'), cur = arts.length ? arts[0].id : '', lim = Math.min(window.innerHeight * 0.3, 240);
      Array.prototype.forEach.call(arts, function (a) { if (a.getBoundingClientRect().top < lim) cur = a.id; });
      var id = cur.replace(/^lec-/, '');
      Array.prototype.forEach.call(O('toc').querySelectorAll('[data-topic]'), function (a) { a.parentNode.classList.toggle('cur', a.getAttribute('data-topic') === id); });
    }
    function queue() { if (!raf) raf = requestAnimationFrame(mark); }
    function watch() { mark(); }
    O('scroll').addEventListener('scroll', queue, { passive: true });
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);

    function jump(id) {
      var t = el.querySelector('#' + id);
      if (t) t.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
    O('toc').addEventListener('click', function (e) {
      var a = e.target.closest('[data-jump]');
      if (!a) return;
      e.preventDefault();
      jump(a.getAttribute('data-jump'));
      if (window.matchMedia && window.matchMedia('(max-width: 899px)').matches) { O('tocbox').open = false; O('fbox').open = false; }
    });
    F.onChange(render);
    render();
    el._jump = function () {
      var part = decodeURIComponent(location.hash.replace(/^#/, '')).split('/')[1];
      if (part) setTimeout(function () { jump('lec-' + part); }, 30);
    };
  }

  Lessons.register({ id: 'lessons', title: 'Lessons', section: 'lessons', mount: mount, onShow: function (el) { if (el._jump) el._jump(); } });
})();
