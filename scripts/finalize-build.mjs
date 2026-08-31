import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { lstatSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = join(root, 'dist');
const commit = (process.env.BUILD_VCS_NUMBER || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' })).trim();

if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error('无法确定有效的 Git 提交 SHA。');

writeFileSync(
  join(dist, 'version.json'),
  `${JSON.stringify({ commit, builtAt: new Date().toISOString() }, null, 2)}\n`,
  'utf8',
);

const files = [];
const walk = directory => {
  for (const name of readdirSync(directory).sort()) {
    const path = join(directory, name);
    const stat = lstatSync(path, { throwIfNoEntry: true });
    if (stat.isDirectory()) walk(path);
    else if (stat.isFile() && name !== 'SHA256SUMS') files.push(path);
    else if (!stat.isFile()) throw new Error(`构建产物包含非普通文件：${path}`);
  }
};
walk(dist);

const lines = files.map(path => {
  const name = relative(dist, path).split('\\').join('/');
  if (!name || name.includes('\n')) throw new Error('构建产物路径无效。');
  const digest = createHash('sha256').update(readFileSync(path)).digest('hex');
  return `${digest}  ${name}`;
});
writeFileSync(join(dist, 'SHA256SUMS'), `${lines.join('\n')}\n`, 'utf8');
