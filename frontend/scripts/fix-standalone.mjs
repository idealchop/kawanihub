/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { cpSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const standaloneDir = join(process.cwd(), '.next/standalone');
const nestedAppDir = join(standaloneDir, 'frontend');
const routesManifest = join(nestedAppDir, '.next', 'routes-manifest.json');

if (!existsSync(routesManifest)) {
  process.exit(0);
}

for (const entry of ['.next', 'node_modules', 'package.json', 'server.js']) {
  const source = join(nestedAppDir, entry);
  if (!existsSync(source)) continue;

  const target = join(standaloneDir, entry);
  rmSync(target, { recursive: true, force: true });
  cpSync(source, target, { recursive: true });
}

rmSync(nestedAppDir, { recursive: true, force: true });

const workspaceModules = join(process.cwd(), '..', 'node_modules');
const standaloneModules = join(standaloneDir, 'node_modules');
const hoistedPackages = ['react', 'react-dom', 'scheduler'];

for (const pkg of hoistedPackages) {
  const source = join(workspaceModules, pkg);
  if (!existsSync(source)) continue;

  const target = join(standaloneModules, pkg);
  rmSync(target, { recursive: true, force: true });
  cpSync(source, target, { recursive: true });
}
