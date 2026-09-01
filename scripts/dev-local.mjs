/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 *
 * Starts the local API (8080) and Next.js app (3000) together.
 */
import { spawn } from 'node:child_process';

const children = [
  spawn('npm', ['run', 'serve:local', '--workspace=kawanihub-api'], {
    stdio: 'inherit',
    shell: true,
  }),
  spawn('npm', ['run', 'dev', '--workspace=frontend'], {
    stdio: 'inherit',
    shell: true,
  }),
];

function shutdown() {
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM');
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

for (const child of children) {
  child.on('exit', (code) => {
    if (code && code !== 0) {
      shutdown();
      process.exit(code);
    }
  });
}
