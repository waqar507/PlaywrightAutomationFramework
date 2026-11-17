// import { spawn } from 'child_process';
// import path from 'path';

// const args = process.argv.slice(2);
// const playwrightArgs = [];

// // Extract CLI runtime overrides
// for (const arg of args) {
//   if (arg.startsWith('--env=')) process.env.ENV = arg.split('=')[1];
//   else if (arg.startsWith('--base-url=')) process.env.BASE_URL = arg.split('=')[1];
//   else if (arg.startsWith('--api-base-url=')) process.env.API_BASE_URL = arg.split('=')[1];
//   else if (arg === '--all') process.env.RUN_ALL = 'true';
//   else playwrightArgs.push(arg);
// }

// // Fallbacks: default environment is 'qa', default tag is '@smoke', default browser is 'chromium'
// process.env.ENV = process.env.ENV || 'qa';
// if (!process.env.RUN_ALL && !playwrightArgs.some((a) => a.startsWith('--grep'))) {
//   playwrightArgs.push('--grep=@smoke');
// }
// if (!playwrightArgs.some((a) => a.startsWith('--project'))) {
//   playwrightArgs.push('--project=chromium');
// }

// const activeTag = process.env.RUN_ALL ? 'ALL' : playwrightArgs.find((a) => a.startsWith('--grep'));
// console.log(`[Runner] Environment: ${process.env.ENV.toUpperCase()} | Base URL: ${process.env.BASE_URL || 'From Config'} | Tag: ${activeTag}`);

// // Directly execute Playwright CLI via Node (cross-platform, zero deprecation warnings)
// const playwrightCli = path.resolve('node_modules', '@playwright', 'test', 'cli.js');
// spawn(process.execPath, [playwrightCli, 'test', ...playwrightArgs], {
//   stdio: 'inherit',
//   env: process.env,
// }).on('exit', (code) => process.exit(code ?? 0));

import { spawn } from 'child_process';
import path from 'path';

const args = process.argv.slice(2);
const playwrightArgs = [];

// Parse custom environment/infrastructure flags strictly via '--flag=value'
for (const arg of args) {
  if (arg.startsWith('--env=')) {
    process.env.ENV = arg.split('=')[1];
  } else if (arg.startsWith('--base-url=')) {
    process.env.BASE_URL = arg.split('=')[1];
  } else {
    // Forward all native Playwright flags (--grep, --project, --workers, etc.) untouched
    playwrightArgs.push(arg);
  }
}

// Fallback to 'qa' if no environment is provided
process.env.ENV = (process.env.ENV || 'qa').toLowerCase();

console.log(`\n🚀 [Test Runner] Environment: ${process.env.ENV.toUpperCase()} | Base URL: ${process.env.BASE_URL || 'Config Default'}\n`);

// Directly execute Playwright CLI via Node
const playwrightCli = path.resolve('node_modules', '@playwright', 'test', 'cli.js');
spawn(process.execPath, [playwrightCli, 'test', ...playwrightArgs], {
  stdio: 'inherit',
  env: process.env,
}).on('exit', (code) => process.exit(code ?? 0));