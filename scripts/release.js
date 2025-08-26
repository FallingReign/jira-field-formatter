#!/usr/bin/env node

/**
 * Release Script for Jira Field Formatter
 * 
 * This script helps manage version releases by:
 * 1. Updating package.json version
 * 2. Creating version tags
 * 3. Updating the 'latest' tag
 * 4. Running tests before release
 * 
 * Usage:
 *   node scripts/release.js patch   # 1.2.0 -> 1.2.1
 *   node scripts/release.js minor   # 1.2.0 -> 1.3.0
 *   node scripts/release.js major   # 1.2.0 -> 2.0.0
 *   node scripts/release.js 1.5.0   # specific version
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const packageJsonPath = path.join(process.cwd(), 'package.json');

function exec(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'inherit' });
  } catch (error) {
    console.error(`Error executing: ${command}`);
    process.exit(1);
  }
}

function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  return packageJson.version;
}

function updatePackageVersion(newVersion) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`✅ Updated package.json version to ${newVersion}`);
}

function incrementVersion(currentVersion, type) {
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  switch (type) {
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'major':
      return `${major + 1}.0.0`;
    default:
      // Assume it's a specific version
      if (/^\d+\.\d+\.\d+$/.test(type)) {
        return type;
      }
      throw new Error(`Invalid version type: ${type}. Use 'patch', 'minor', 'major', or a specific version like '1.5.0'`);
  }
}

function main() {
  const versionType = process.argv[2];
  
  if (!versionType) {
    console.error('Usage: node scripts/release.js <patch|minor|major|x.y.z>');
    process.exit(1);
  }

  console.log('🚀 Starting release process...\n');

  // Get current version
  const currentVersion = getCurrentVersion();
  console.log(`📋 Current version: ${currentVersion}`);

  // Calculate new version
  const newVersion = incrementVersion(currentVersion, versionType);
  console.log(`📋 New version: ${newVersion}\n`);

  // Run tests first
  console.log('🧪 Running tests...');
  exec('npm test');
  console.log('✅ All tests passed!\n');

  // Check git status
  console.log('📊 Checking git status...');
  exec('git status --porcelain');

  // Update package.json
  updatePackageVersion(newVersion);

  // Commit version update
  console.log('📝 Committing version update...');
  exec('git add package.json');
  exec(`git commit -m "Bump version to ${newVersion}"`);

  // Create version tag
  console.log(`🏷️  Creating version tag v${newVersion}...`);
  exec(`git tag -a v${newVersion} -m "Release version ${newVersion}"`);

  // Update latest tag
  console.log('🏷️  Updating latest tag...');
  exec('git tag -f latest');

  console.log('\n🎉 Release process completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Push commits: git push origin master');
  console.log('2. Push tags: git push origin --tags --force');
  console.log('\n📖 Users can now use:');
  console.log(`   git submodule add -b v${newVersion} <repo-url> lib/jira-field-formatter`);
  console.log(`   git submodule add -b latest <repo-url> lib/jira-field-formatter`);
}

main();
