#!/usr/bin/env node
/*
 * Verifies that the question counts shown on every topic page match what the
 * page actually renders. READ-ONLY: never modifies anything under website/.
 *
 * Run:  cd tests && npm i jsdom && node verify_question_counts.js [--json out.json]
 *
 * Test cases per topic
 *  T1  data:    All/Junior/Mid/Senior counts in data == counts printed in the page HTML
 *  T2  data:    question ids unique, question texts unique
 *  T3  answers: every answer HTML is "safe" — rendered in a feed of 3 cards it
 *               must yield exactly 3 top-level cards (no swallowed/nested cards)
 *  T4  DOM:     for each filter (all/junior/mid/senior) the number of cards that
 *               really exist in #questions-feed-container == label == data
 *  T5  DOM:     every card is a top-level child of the feed (none nested/hidden)
 *  T6  DOM:     ticking every "Mark Learned" box yields mastered == data total
 */
const fs = require('fs'), path = require('path'), http = require('http');
const { JSDOM, VirtualConsole } = require('jsdom');
const SITE = path.resolve(__dirname, '../website');
const TOPICS = ['kubernetes','terraform','linux','aws','cicd','docker','git','networking','gitops','observability','security','scenario'];
const LEVELS = ['junior','mid','senior'];

global.window = {}; require(path.join(SITE, 'js/all_questions.js'));
const DATA = window.allQuestionsData;

const server = http.createServer((req, res) => {
  const f = path.join(SITE, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(f, (e, b) => e ? (res.writeHead(404), res.end()) : res.end(b));
});

const failures = []; const report = {};
const fail = (t, tc, msg) => failures.push({ topic: t, test: tc, msg });

function staticChecks(t) {
  const q = DATA[t], html = fs.readFileSync(path.join(SITE, t + '.html'), 'utf8');
  const g = r => { const m = html.match(r); return m ? +m[1] : null; };
  const lv = l => q.filter(x => x.level === l).length;
  const page = { all: g(/data-filter="all">All \((\d+)\)/), junior: g(/Junior \((\d+)\)/), mid: g(/Mid-Level \((\d+)\)/), senior: g(/Senior \((\d+)\)/), badge: g(/badge-number">(\d+)/) };
  const exp = { all: q.length, junior: lv('junior'), mid: lv('mid'), senior: lv('senior'), badge: q.length };
  for (const k in exp) if (page[k] !== exp[k]) fail(t, 'T1', `page HTML shows ${k}=${page[k]} but data has ${exp[k]}`);
  const ids = new Set(q.map(x => x.id)); if (ids.size !== q.length) fail(t, 'T2', `${q.length - ids.size} duplicate ids`);
  const txt = new Map(); q.forEach(x => txt.set(x.question, (txt.get(x.question) || []).concat(x.id)));
  for (const [k, v] of txt) if (v.length > 1) fail(t, 'T2', `duplicate question text (${v.join(', ')}): ${k.slice(0, 60)}`);
  report[t] = { data: exp };
}

function answerChecks(t) {
  const doc = new JSDOM('<body></body>').window.document;
  DATA[t].forEach(q => {
    const card = id => `<div class="cyber-qa-item" id="${id}"><div class="qa-header-row"><h4>${q.question}</h4></div><div class="qa-answer-body"><div class="qa-answer-inner">${q.answer}<div class="qa-tags-row"></div></div></div></div>`;
    const host = doc.createElement('div'); host.innerHTML = card('a') + card('b') + card('c');
    const top = [...host.children].filter(c => c.classList.contains('cyber-qa-item')).length;
    const nested = host.querySelectorAll('.cyber-qa-item .cyber-qa-item').length;
    const why = [];
    if (/<script\b/i.test(q.answer)) why.push('contains literal <script> tag (swallows everything after it)');
    for (const tg of ['code','pre','div','ul','ol','table','details','strong','em']) {
      const o = (q.answer.match(new RegExp('<' + tg + '\\b', 'gi')) || []).length, c = (q.answer.match(new RegExp('</' + tg + '>', 'gi')) || []).length;
      if (o !== c) why.push(`unbalanced <${tg}> (${o} open / ${c} close) leaks into the following cards`);
    }
    if (top !== 3 || nested || why.length) {
      fail(t, 'T3', `${q.id} [${q.level}] "${q.question.slice(0, 55)}…" breaks the feed: ${why.join('; ') || 'unknown'}`);
    }
  });
}

async function domChecks(t, port) {
  const vc = new VirtualConsole();
  const html = fs.readFileSync(path.join(SITE, t + '.html'), 'utf8').replace(/<script[^>]*src="https?:[^>]*><\/script>/g, '').replace(/<link[^>]*href="https?:[^>]*>/g, '');
  const dom = new JSDOM(html, { url: `http://localhost:${port}/${t}.html`, runScripts: 'dangerously', resources: 'usable', virtualConsole: vc, pretendToBeVisual: true,
    beforeParse(w) { w.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} }; w.AOS = { init() {}, refresh() {} };
      w.HTMLCanvasElement.prototype.getContext = () => null; w.speechSynthesis = { getVoices: () => [], cancel() {}, speak() {}, addEventListener() {} }; w.scrollTo = () => {}; } });
  const w = dom.window, d = w.document;
  for (let i = 0; i < 100 && !(d.querySelectorAll('.cyber-qa-item').length); i++) await new Promise(r => setTimeout(r, 100));
  const cont = d.getElementById('questions-feed-container');
  if (!cont) return fail(t, 'T4', 'feed container missing');
  const data = DATA[t]; const dom_ = {};
  for (const f of ['all', ...LEVELS]) {
    const btn = d.querySelector(`.filter-btn[data-filter="${f}"]`); if (!btn) continue; btn.click();
    const label = +(btn.textContent.match(/\((\d+)\)/) || [])[1];
    const exp = f === 'all' ? data.length : data.filter(q => q.level === f).length;
    const cards = cont.querySelectorAll('.cyber-qa-item').length;
    const top = [...cont.children].filter(c => c.classList.contains('cyber-qa-item')).length;
    dom_[f] = { label, expected: exp, cards, topLevel: top };
    if (cards !== exp || label !== exp) fail(t, 'T4', `filter "${f}": button says ${label}, data has ${exp}, DOM actually renders ${cards}`);
    if (top !== cards) {
      const all = [...cont.querySelectorAll('.cyber-qa-item')];
      const culprits = [...new Set(all.filter(c => c.parentElement !== cont).map(c => { const p = c.parentElement.closest('.cyber-qa-item') || c.parentElement; return (p.previousElementSibling || p).id || p.tagName; }))];
      fail(t, 'T5', `filter "${f}": ${cards - top} of ${cards} cards are nested inside another card (hidden unless parent expanded). Leak originates after card: ${culprits.slice(0, 5).join(', ')}`);
    }
  }
  w.launchCyberConfetti = () => {}; // canvas confetti is unsupported in jsdom and would abort the handler at the 25% milestone
  d.querySelector('.filter-btn[data-filter="all"]').click();
  [...cont.querySelectorAll('.q-mastery-chk')].forEach(b => { b.checked = true; b.dispatchEvent(new w.Event('change', { bubbles: true })); });
  const stored = JSON.parse(w.localStorage.getItem('mastered_' + t) || '[]').length;
  if (stored !== data.length) fail(t, 'T6', `ticking every visible "Mark Learned" box masters ${stored}/${data.length}`);
  report[t].dom = dom_; report[t].masteredAfterTickingAll = stored;
  w.close();
}

(async () => {
  await new Promise(r => server.listen(0, r)); const port = server.address().port;
  for (const t of TOPICS) { staticChecks(t); answerChecks(t); await domChecks(t, port); }
  server.close();
  const byTopic = {}; failures.forEach(f => (byTopic[f.topic] = byTopic[f.topic] || []).push(f));
  console.log('Topic          Questions  Result');
  for (const t of TOPICS) console.log(t.padEnd(14), String(DATA[t].length).padEnd(10), byTopic[t] ? `FAIL (${byTopic[t].length})` : 'PASS');
  console.log();
  failures.forEach(f => console.log(`[${f.test}] ${f.topic}: ${f.msg}`));
  const j = process.argv.indexOf('--json'); if (j > 0) fs.writeFileSync(process.argv[j + 1], JSON.stringify({ report, failures }, null, 2));
  process.exit(failures.length ? 1 : 0);
})();
