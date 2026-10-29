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
  assert.equal(pioneers.length, 30);
  const member = pioneers.find(member => member.id === 'likezz-rh');
  assert.deepEqual([member.name, member.university, member.href, member.photoPlaceholder],
    ['张荣晖', '福州大学', 'https://github.com/likezz-rh', false]);
  assert.equal(pioneers.find(member => member.name === '零一扬').id, 'XiaoSiKe');
  assert.equal(pioneers.find(member => member.id === 'Joshmax010').university, '吉林建筑大学');
});
