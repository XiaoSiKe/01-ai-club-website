import test from 'node:test';
import assert from 'node:assert/strict';
import { pioneers, searchPioneers } from '../src/data/pioneers.js';

test('name search accepts partial Chinese names and ignores surrounding spaces', () => {
  assert.ok(searchPioneers('  荣晖  ').some(member => member.id === 'likezz-rh'));
  assert.deepEqual(searchPioneers('张荣晖').map(member => member.name), ['张荣晖']);
  assert.ok(searchPioneers('王').length > 1);
});

test('English names accept case and full-width input', () => {
  assert.deepEqual(searchPioneers('ＳＡＮ').map(member => member.name), ['San']);
  assert.deepEqual(searchPioneers('keven').map(member => member.name), ['KevenChen']);
});

test('blank and unmatched input do not expose unrelated members', () => {
  for (const query of ['', '   ', '不存在的先锋', '福州大学']) assert.deepEqual(searchPioneers(query), []);
});

test('new and existing member IDs, schools, portraits and GitHub links remain valid', () => {
  assert.equal(new Set(pioneers.map(member => member.id)).size, pioneers.length);
  assert.equal(pioneers.length, 32);
  const member = pioneers.find(member => member.id === 'likezz-rh');
  assert.deepEqual([member.name, member.university, member.href, member.photoPlaceholder],
    ['张荣晖', '福州大学', 'https://github.com/likezz-rh', false]);
  assert.equal(pioneers.find(member => member.name === '零一扬').id, 'XiaoSiKe');
  assert.equal(searchPioneers('吴耀辉')[0].university, '福建农林大学');
  assert.equal(searchPioneers('吴耀辉')[0].photo, '/images/business-members-ezcut/03-wuyaohui.webp');
  assert.equal(pioneers.find(member => member.id === 'Joshmax010').university, '吉林建筑大学');
});

test('founders link to the corresponding branch and retain their independent joining dates', () => {
  const founder = pioneers.find(member => member.id === 'XiaoSiKe');
  assert.deepEqual(founder.founding, {
    date: '2026-09-01', name: '零一 AI 日新社', href: './?branch=fzu#cooperation',
  });
  const eug = pioneers.find(member => member.id === 'Eug-Y');
  assert.equal(eug.joinedAt, '2026-09-01');
  assert.equal(eug.founding.date, '2026-10-26');
  assert.equal(eug.founding.href, './?branch=fit#cooperation');
  const quanzhou = pioneers.find(member => member.id === 'qwq2008123-star');
  assert.equal(quanzhou.founding.href, './?branch=qzoi#cooperation');
  const wu = pioneers.find(member => member.id === 'wu-yaohui');
  assert.equal(wu.founding, null);
  assert.equal(wu.joinedAt, '2026-10-30');
  assert.equal(wu.href, 'https://github.com/1302707875wu');
  assert.equal(pioneers.filter(member => member.founding).length, 6);
  assert(pioneers.every(member => /^2026-\d{2}-\d{2}$/.test(member.joinedAt)));
});
