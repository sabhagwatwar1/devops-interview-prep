#!/usr/bin/env node
/*
 * Splits website/js/all_questions.js (single source of truth) into one
 * minified file per topic: website/js/data/<topic>.js
 * Topic pages load only their own file; search/mock-interview lazy-load the rest.
 * Run after editing all_questions.js:  node tools/split_questions.js
 */
const fs = require('fs'), path = require('path');
const SITE = path.resolve(__dirname, '../website');
global.window = {}; eval(fs.readFileSync(path.join(SITE, 'js/all_questions.js'), 'utf8'));
const out = path.join(SITE, 'js/data'); fs.mkdirSync(out, { recursive: true });
for (const [topic, qs] of Object.entries(window.allQuestionsData)) {
  fs.writeFileSync(path.join(out, topic + '.js'),
    `window.allQuestionsData=window.allQuestionsData||{};window.allQuestionsData[${JSON.stringify(topic)}]=${JSON.stringify(qs)};\n`);
  console.log(topic.padEnd(14), qs.length);
}
