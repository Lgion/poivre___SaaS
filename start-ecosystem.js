const { spawn } = require('child_process');
const path = require('path');

const services = [
  { name: 'App 1 (Crowdfunding 50M)', script: path.join(__dirname, 'apps/crowdfunding/server.js'), port: 3001 },
  { name: 'App 2 (Boutique B2C/B2B)', script: path.join(__dirname, 'apps/ecommerce/server.js'), port: 3002 },
  { name: 'App 3 (SaaS Coopérative)', script: path.join(__dirname, 'apps/saas/server.js'), port: 3003 }
];

const children = services.map((svc) => {
  const child = spawn(process.execPath, [svc.script], {
    env: { ...process.env, PORT: String(svc.port) },
    stdio: 'inherit'
  });
  return child;
});

process.on('SIGINT', () => {
  children.forEach((c) => c.kill('SIGINT'));
  process.exit(0);
});

process.on('SIGTERM', () => {
  children.forEach((c) => c.kill('SIGTERM'));
  process.exit(0);
});

