import { createHash } from 'node:crypto';
import { lstatSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = join(root, 'dist');
const actual = new Set();

const walk = directory => {
  for (const name of readdirSync(directory).sort()) {
    const path = join(directory, name);
    const stat = lstatSync(path, { throwIfNoEntry: true });
    if (stat.isDirectory()) walk(path);
    else if (stat.isFile()) actual.add(relative(dist, path).split('\\').join('/'));
    else throw new Error(`构建产物包含非普通文件：${path}`);
  }
};
walk(dist);

for (const required of ['index.html', 'CNAME', 'lingyi-logo.jpg', 'version.json', 'SHA256SUMS']) {
  if (!actual.has(required)) throw new Error(`构建产物缺少 ${required}。`);
}
if (![...actual].some(name => /^assets\/.+\.js$/.test(name))) throw new Error('构建产物缺少 JavaScript 资源。');
if (![...actual].some(name => /^assets\/.+\.css$/.test(name))) throw new Error('构建产物缺少 CSS 资源。');
if (readFileSync(join(dist, 'CNAME'), 'utf8').trim() !== 'club.01aiedu.com') throw new Error('CNAME 与正式域名不一致。');
if (!readFileSync(join(dist, 'index.html'), 'utf8').includes('零一 AI 日新社')) throw new Error('首页品牌标识缺失。');

const version = JSON.parse(readFileSync(join(dist, 'version.json'), 'utf8'));
if (!/^[a-f0-9]{40}$/.test(version.commit)) throw new Error('version.json 的提交 SHA 无效。');
if (Number.isNaN(Date.parse(version.builtAt))) throw new Error('version.json 的构建时间无效。');

const listed = new Set();
for (const line of readFileSync(join(dist, 'SHA256SUMS'), 'utf8').trim().split('\n')) {
  const match = line.match(/^([a-f0-9]{64})  ([^\r\n]+)$/);
  if (!match) throw new Error('SHA256SUMS 格式错误。');
  const [, expected, name] = match;
  if (listed.has(name) || name === 'SHA256SUMS' || !actual.has(name)) throw new Error(`SHA256SUMS 路径异常：${name}`);
  listed.add(name);
  const digest = createHash('sha256').update(readFileSync(join(dist, name))).digest('hex');
  if (digest !== expected) throw new Error(`构建产物校验失败：${name}`);
}
if (listed.size !== actual.size - 1) throw new Error('构建产物存在未列入校验清单的文件。');

console.log(`已验证 ${listed.size} 个静态文件，提交 ${version.commit.slice(0, 12)}。`);
