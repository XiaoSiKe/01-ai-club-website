import { readFileSync, writeFileSync } from 'node:fs';
import OpenCC from 'opencc-js/cn2t';

// Keep the conversion dictionary out of the browser bundle. Phrase-aware
// Traditional Chinese is generated once; both message catalogues ship locally.
const english = JSON.parse(readFileSync(new URL('../src/i18n/en.json', import.meta.url), 'utf8'));
const convert = OpenCC.Converter({ from: 'cn', to: 'tw' });
const traditional = Object.fromEntries(Object.keys(english).map(key => [key, convert(key)]));
writeFileSync(new URL('../src/i18n/zh-Hant.json', import.meta.url), `${JSON.stringify(traditional, null, 2)}\n`);
console.log(`Generated ${Object.keys(traditional).length} Traditional Chinese messages.`);
