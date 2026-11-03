import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createTranslator, initialLocale, normalizeLocale, LOCALE_STORAGE_KEY } from '../src/i18n/translate.js';
import { searchBranches } from '../src/data/branches.js';
import { searchPioneers } from '../src/data/pioneers.js';

const catalogue = locale => JSON.parse(readFileSync(new URL(`../src/i18n/${locale}.json`, import.meta.url), 'utf8'));

test('locale aliases accept supported languages and reject invalid preferences', () => {
  for (const locale of ['zh-Hans', 'zh-CN', 'zh-SG']) assert.equal(normalizeLocale(locale), 'zh-Hans');
  for (const locale of ['zh-Hant', 'zh-TW', 'zh-HK']) assert.equal(normalizeLocale(locale), 'zh-Hant');
  assert.equal(normalizeLocale('en-US'), 'en');
  for (const locale of [null, '', 'fr', '__proto__']) assert.equal(normalizeLocale(locale), null);
});

test('language URLs take priority, preferences persist, and denied storage has a default', () => {
  const previousWindow = globalThis.window;
  const previousStorage = globalThis.localStorage;
  try {
    globalThis.window = { location: { search: '?page=pioneers&lang=en' } };
    globalThis.localStorage = { getItem: key => key === LOCALE_STORAGE_KEY ? 'zh-Hant' : null };
    assert.equal(initialLocale(), 'en');
    window.location.search = '?lang=invalid';
    assert.equal(initialLocale(), 'zh-Hant');
    globalThis.localStorage = { getItem: () => { throw new Error('Storage blocked'); } };
    assert.equal(initialLocale(), 'zh-Hans');
    window.location.search = '?lang=zh-TW';
    assert.equal(initialLocale(), 'zh-Hant');
  } finally {
    if (previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow;
    if (previousStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = previousStorage;
  }
});

test('translated messages cover dynamic labels without changing supplied names or literal placeholder content', () => {
  const t = createTranslator('en');
  assert.equal(t('关于我们'), 'About us');
  assert.equal(t('查看{0}的领航先锋介绍', ['零一扬']), 'View 零一扬’s pioneer profile');
  assert.equal(t('找到 {0} 所高校', [2]), 'Universities found: 2');
  assert.equal(t('  关于我们 '), '  About us ');
  assert.equal(t('unregistered input'), 'unregistered input');
  assert.equal(t('保存{0}', ['$& <script>{1}</script>']), 'Save $& <script>{1}</script>');
  assert.equal(t(0), 0);
  assert.equal(t(undefined), undefined);
  assert.equal(createTranslator('zh-Hans')('关于我们'), '关于我们');
});

test('Traditional Chinese covers all messages, phrases, member names, and map labels', () => {
  assert.deepEqual(Object.keys(catalogue('en')).sort(), Object.keys(catalogue('zh-Hant')).sort());
  const t = createTranslator('zh-Hant');
  assert.equal(t('关于我们'), '關於我們');
  assert.equal(t('零一高校分社'), '零一高校分社');
  assert.equal(t('零一扬'), '零一揚');
  assert.equal(t('软件大道'), '軟件大道');
  assert.equal(t('查看{0}的领航先锋介绍', ['零一扬']), '查看零一揚的領航先鋒介紹');
});

test('chapter and pioneer search match translated labels and retain existing Chinese search', () => {
  const en = createTranslator('en'), traditional = createTranslator('zh-Hant');
  assert.deepEqual(searchBranches('Fujian Normal', en).map(branch => branch.id), ['fjnu']);
  assert.deepEqual(searchBranches('福建師範', traditional).map(branch => branch.id), ['fjnu']);
  assert.deepEqual(searchBranches('福师大', en).map(branch => branch.id), ['fjnu']);
  assert.equal(searchPioneers('零一揚', traditional)[0]?.id, 'XiaoSiKe');
  assert.equal(searchPioneers('零一扬', en)[0]?.id, 'XiaoSiKe');
});

test('all translations preserve the source interpolation fields', () => {
  const fields = message => [...new Set(message.match(/\{\d+\}/g) || [])].sort();
  for (const locale of ['en', 'zh-Hant']) {
    for (const [source, translation] of Object.entries(catalogue(locale))) {
      assert.deepEqual(fields(translation), fields(source), `${locale}: ${source}`);
    }
  }
});

test('chapter counts and founding labels read correctly in each language', () => {
  const en = createTranslator('en'), traditional = createTranslator('zh-Hant');
  assert.equal(en('1 所高校'), '1 university');
  assert.equal(en('{0} 所高校', [6]), '6 universities');
  assert.equal(en('{0} 成立于', ['分社']), 'Chapter · Founded');
  assert.equal(traditional('{0} 成立于', ['总社']), '總社 成立於');
  assert.equal(createTranslator('zh-Hans')('{0} 成立于', ['总社']), '总社 成立于');
});

test('search continues to match across all languages after a locale switch', () => {
  for (const locale of ['zh-Hans', 'zh-Hant', 'en']) {
    const t = createTranslator(locale);
    assert.equal(searchPioneers('零一揚', t)[0]?.id, 'XiaoSiKe');
    assert.equal(searchPioneers('零一扬', t)[0]?.id, 'XiaoSiKe');
    assert.deepEqual(searchBranches('Fujian Normal', t).map(branch => branch.id), ['fjnu']);
    assert.deepEqual(searchBranches('福建師範', t).map(branch => branch.id), ['fjnu']);
    assert.deepEqual(searchBranches('福师大', t).map(branch => branch.id), ['fjnu']);
  }
});
