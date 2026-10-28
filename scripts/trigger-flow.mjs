import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const repository = 'XiaoSiKe/01-ai-club-website';
const production = 'https://club.01aiedu.com';
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

export function validatePush(event, commit) {
  if (event.repository?.full_name !== repository || event.ref !== 'refs/heads/main'
    || event.deleted || !/^[a-f0-9]{40}$/.test(commit || '') || /^0+$/.test(commit)
    || event.after !== commit) {
    throw new Error('仅允许当前仓库 main 分支的本次推送触发发布。');
  }
}

export async function triggerFlow({ webhook, event, commit, fetchImpl = fetch, wait = pause }) {
  validatePush(event, commit);
  const url = new URL(webhook);
  if (url.protocol !== 'https:' || url.hostname !== 'flow-openapi.aliyun.com'
    || !/^\/scm\/webhook\/[a-zA-Z0-9_-]+$/.test(url.pathname)
    || url.username || url.password || url.search || url.hash || url.port) {
    throw new Error('云效 Webhook 地址无效。');
  }
  let failure;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      // Forward the validated push directly over HTTPS. The workflow can retry
      // failed delivery and report whether this exact revision reached production.
      const response = await fetchImpl(url.href, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event), signal: AbortSignal.timeout(20000),
      });
      const result = await response.json();
      if (response.ok && result.successful === true) return;
      const code = /^\d{1,12}$/.test(String(result.errorCode)) ? result.errorCode : 'unknown';
      failure = new Error(`云效拒绝触发：HTTP ${response.status}，错误码 ${code}。`);
    } catch {
      // Never echo a transport exception: it can contain the secret webhook URL.
      failure = new Error('云效触发请求失败或响应无效。');
    }
    if (attempt < 2) await wait((attempt + 1) * 3000);
  }
  throw failure;
}

export async function waitForProduction({ commit, fetchImpl = fetch, wait = pause }) {
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      const response = await fetchImpl(`${production}/version.json`, {
        cache: 'no-store', signal: AbortSignal.timeout(5000),
      });
      const version = await response.json();
      if (response.ok && version.commit === commit) return;
    } catch { /* A transient CDN/network error must not stop the next check. */ }
    if (attempt < 29) await wait(5000);
  }
  throw new Error('等待发布超时：官网版本尚未更新为本次提交，请检查云效运行记录。');
}

async function main() {
  if (process.env.GITHUB_EVENT_NAME !== 'push') throw new Error('发布入口仅接受 push 事件。');
  const webhook = process.env.CLUB_FLOW_WEBHOOK_URL;
  if (!webhook) throw new Error('缺少 GitHub Secret：CLUB_FLOW_WEBHOOK_URL。');
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  const commit = process.env.GITHUB_SHA;
  await triggerFlow({ webhook, event, commit });
  console.log(`云效已接受 main 提交 ${commit}，等待自动构建与发布。`);
  await waitForProduction({ commit });
  console.log(`发布验收通过：${production}/version.json = ${commit}`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    const { appendFileSync } = await import('node:fs');
    appendFileSync(process.env.GITHUB_STEP_SUMMARY,
      `官网已发布 [${commit.slice(0, 7)}](https://github.com/${repository}/commit/${commit})。\n\n[访问官网](${production}/)\n`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
