import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.join(root, 'dist');
const includedPaths = [
  'LICENSE',
  'background.js',
  'config.js',
  'content.js',
  'style.css',
  '_locales',
  'images',
  'options'
];

const requestedTarget = process.argv[2] || 'all';
if (!['all', 'chrome', 'firefox'].includes(requestedTarget)) {
  throw new Error(`Unknown build target "${requestedTarget}". Use "chrome", "firefox", or omit the target.`);
}

const sourceManifest = JSON.parse(await readFile(path.join(root, 'manifest.json'), 'utf8'));
const targets = requestedTarget === 'all' ? ['firefox', 'chrome'] : [requestedTarget];

for (const target of targets) {
  const outputDirectory = path.join(outputRoot, target);
  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory, { recursive: true });

  for (const relativePath of includedPaths) {
    await cp(path.join(root, relativePath), path.join(outputDirectory, relativePath), { recursive: true });
  }

  const manifest = structuredClone(sourceManifest);
  if (target === 'firefox') {
    manifest.background = { scripts: sourceManifest.background.scripts };
  } else {
    manifest.background = { service_worker: sourceManifest.background.service_worker || 'background.js' };
    delete manifest.browser_specific_settings;
  }

  await writeFile(
    path.join(outputDirectory, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`
  );
  console.log(`Built ${target}: ${path.relative(root, outputDirectory)}`);
}
