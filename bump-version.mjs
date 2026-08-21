#!/usr/bin/env node
// Bumps the app version across every file that currently has to be edited by hand.
//
// Usage: node bump-version.mjs <buildNumber>.<marketingVersion>
// Example: node bump-version.mjs 16.1.0
//   -> build number (iOS CURRENT_PROJECT_VERSION / Android versionCode) = 16
//   -> marketing version (iOS MARKETING_VERSION / Android versionName)  = 1.0
//   -> APP_VERSION constant / package.json version                     = "16.1.0"
//
// This mirrors the scheme already in use (e.g. APP_VERSION '15.1.0' with
// build 15 and marketing version 1.0) — just applied everywhere at once.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));

const input = process.argv[2];
if (!input) {
  console.error('Usage: node bump-version.mjs <buildNumber>.<marketingVersion>');
  console.error('Example: node bump-version.mjs 16.1.0');
  process.exit(1);
}

const match = input.match(/^(\d+)\.(\d+(?:\.\d+)*)$/);
if (!match) {
  console.error(`Invalid version "${input}". Expected format: <buildNumber>.<marketingVersion>, e.g. 16.1.0`);
  process.exit(1);
}

const [, buildNumber, marketingVersion] = match;
const fullVersion = input;

function replaceOrThrow(path, pattern, replacement, expectedCount = 1) {
  const full = join(root, path);
  const original = readFileSync(full, 'utf8');
  const count = (original.match(pattern) ?? []).length;
  if (count !== expectedCount) {
    throw new Error(`Expected ${expectedCount} match(es) of ${pattern} in ${path}, found ${count}`);
  }
  writeFileSync(full, original.replace(pattern, replacement));
  console.log(`  ${path} (${count} update${count === 1 ? '' : 's'})`);
}

console.log(`Bumping to build ${buildNumber}, marketing version ${marketingVersion} (APP_VERSION "${fullVersion}")\n`);

replaceOrThrow('package.json', /"version":\s*"[^"]*"/, `"version": "${fullVersion}"`);

replaceOrThrow('src/App.vue', /const APP_VERSION = '[^']*';/, `const APP_VERSION = '${fullVersion}';`);

replaceOrThrow('src/views/SettingsView.vue', /const APP_VERSION = '[^']*';/, `const APP_VERSION = '${fullVersion}';`);

replaceOrThrow('android/app/build.gradle', /versionCode \d+/, `versionCode ${buildNumber}`);
replaceOrThrow('android/app/build.gradle', /versionName "[^"]*"/, `versionName "${marketingVersion}"`);

replaceOrThrow(
  'ios/App/App.xcodeproj/project.pbxproj',
  /CURRENT_PROJECT_VERSION = \d+;/g,
  `CURRENT_PROJECT_VERSION = ${buildNumber};`,
  2,
);
replaceOrThrow(
  'ios/App/App.xcodeproj/project.pbxproj',
  /MARKETING_VERSION = [\d.]+;/g,
  `MARKETING_VERSION = ${marketingVersion};`,
  2,
);

console.log('\nDone. Next steps:');
console.log('  npx cap sync');
console.log('  Rebuild in Xcode / Android Studio before archiving.');
