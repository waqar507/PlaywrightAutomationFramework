import { spawn } from 'child_process';
import path from 'path';

// Enterprise Default Fallback Values
const DEFAULTS = {
  ENV: 'qa',
  GREP: '@smoke',
  PROJECT: 'chromium',
};

// Parse runtime arguments
const args = process.argv.slice(2);

let targetEnv = process.env.ENV || '';
let customBaseUrl = process.env.BASE_URL || '';
let customApiBaseUrl = process.env.API_BASE_URL || '';
let grepTag = '';
let runAll = false;
const playwrightArgs = [];

for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg.startsWith('--env=')) {
    targetEnv = arg.split('=')[1];
  } else if (arg === '--env' || arg === '-e') {
    if (args[i + 1]) {
      targetEnv = args[i + 1];
      i++;
    }
  } else if (arg.startsWith('--base-url=') || arg.startsWith('--baseUrl=')) {
    customBaseUrl = arg.split('=')[1];
  } else if (arg === '--base-url' || arg === '--baseUrl' || arg === '-u') {
    if (args[i + 1]) {
      customBaseUrl = args[i + 1];
      i++;
    }
  } else if (arg.startsWith('--api-base-url=') || arg.startsWith('--apiBaseUrl=')) {
    customApiBaseUrl = arg.split('=')[1];
  } else if (arg === '--api-base-url' || arg === '--apiBaseUrl') {
    if (args[i + 1]) {
      customApiBaseUrl = args[i + 1];
      i++;
    }
  } else if (arg.startsWith('--grep=') || arg.startsWith('-g=')) {
    grepTag = arg.split('=')[1];
  } else if (arg === '--grep' || arg === '-g') {
    if (args[i + 1]) {
      grepTag = args[i + 1];
      i++;
    }
  } else if (arg === '--all' || arg === '-a') {
    runAll = true;
  } else {
    playwrightArgs.push(arg);
  }
}

// 1. Fallback for Environment
const isEnvFallback = !targetEnv;
targetEnv = targetEnv || DEFAULTS.ENV;
process.env.ENV = targetEnv;

// 2. Base URL Override
if (customBaseUrl) {
  process.env.BASE_URL = customBaseUrl;
}

// 3. API Base URL Override
if (customApiBaseUrl) {
  process.env.API_BASE_URL = customApiBaseUrl;
}

// 4. Fallback for Grep Tag Filter
let isGrepFallback = false;
if (!runAll) {
  if (!grepTag) {
    grepTag = DEFAULTS.GREP;
    isGrepFallback = true;
  }
  playwrightArgs.push(`--grep=${grepTag}`);
}

// 5. Fallback for Browser Project
if (!playwrightArgs.some((a) => a.startsWith('--project'))) {
  playwrightArgs.push(`--project=${DEFAULTS.PROJECT}`);
}

console.log('====================================================');
console.log(`[Runner] Active Environment : ${targetEnv.toUpperCase()}${isEnvFallback ? ' (default fallback)' : ''}`);
if (customBaseUrl) {
  console.log(`[Runner] Base URL Override  : ${customBaseUrl}`);
}
if (customApiBaseUrl) {
  console.log(`[Runner] API URL Override   : ${customApiBaseUrl}`);
}
console.log(`[Runner] Tag Filter         : ${runAll ? 'ALL (no filter)' : `${grepTag}${isGrepFallback ? ' (default fallback)' : ''}`}`);
console.log(`[Runner] Command            : npx playwright test ${playwrightArgs.join(' ')}`);
console.log('====================================================\n');

const cliPath = path.resolve(process.cwd(), 'node_modules', '@playwright', 'test', 'cli.js');

const child = spawn(process.execPath, [cliPath, 'test', ...playwrightArgs], {
  stdio: 'inherit',
  env: {
    ...process.env,
    ENV: targetEnv,
    ...(customBaseUrl ? { BASE_URL: customBaseUrl } : {}),
    ...(customApiBaseUrl ? { API_BASE_URL: customApiBaseUrl } : {}),
  },
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
