import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { parseEnv } from 'node:util';

const command = process.argv[2] ?? 'help';
const configPath = process.env.OPS_CONFIG_FILE
  ?? join(homedir(), '.local/share/01aiclub/ops/ops.env');

const readToken = config => {
  if (process.env.YUNXIAO_TOKEN) return process.env.YUNXIAO_TOKEN;
  if (process.platform === 'darwin' && config.YUNXIAO_TOKEN_KEYCHAIN_SERVICE) {
    return execFileSync('security', ['find-generic-password', '-w', '-s', config.YUNXIAO_TOKEN_KEYCHAIN_SERVICE], { encoding: 'utf8' }).trim();
  }
  throw new Error('未在环境变量或 macOS 钥匙串中找到云效只读令牌。');
};

async function main() {
  if (command === 'help') {
    console.log('只读运维：npm run ops:check / ops:status / ops:runs');
    return;
  }
  const stat = statSync(configPath);
  if (stat.mode & 0o077) throw new Error('私有配置权限必须为 600。');
  const config = parseEnv(readFileSync(configPath, 'utf8'));

  if (command === 'check') {
    for (const [name, url] of [['日新社官网', 'https://club.01aiedu.com/'], ['25th', 'https://arch.25thgame.vip/game.html']]) {
      const response = await fetch(url, { signal: AbortSignal.timeout(15000), redirect: 'manual' });
      console.log(`${name}：HTTP ${response.status}`);
      if (response.status !== 200) process.exitCode = 1;
      await response.body?.cancel();
    }
    return;
  }

  const org = config.YUNXIAO_ORGANIZATION_ID;
  const pipeline = config.YUNXIAO_PIPELINE_ID;
  const domain = config.YUNXIAO_FLOW_DOMAIN || 'https://openapi-rdc.aliyuncs.com';
  if (domain !== 'https://openapi-rdc.aliyuncs.com') throw new Error('仅允许云效中心站 OpenAPI。');
  if (!/^[a-zA-Z0-9]+$/.test(org ?? '') || !/^\d+$/.test(pipeline ?? '')) throw new Error('云效组织或流水线 ID 未配置。');
  const suffix = command === 'status' ? '/runs/latestPipelineRun' : command === 'runs' ? '/runs?page=1&perPage=5' : null;
  if (!suffix) throw new Error('未知运维命令。');
  const response = await fetch(`${domain}/oapi/v1/flow/organizations/${org}/pipelines/${pipeline}${suffix}`, {
    headers: { 'x-yunxiao-token': readToken(config) },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`云效请求失败：HTTP ${response.status}`);
  const data = await response.json();
  for (const run of Array.isArray(data) ? data : [data]) {
    console.log(JSON.stringify({ runId: run.id ?? run.pipelineRunId, status: run.status, triggerMode: run.triggerMode, startTime: run.startTime, endTime: run.endTime }));
  }
}

main().catch(error => {
  console.error(error.code === 'ENOENT' ? `私有配置不存在：${configPath}` : error.message);
  process.exitCode = 1;
});
