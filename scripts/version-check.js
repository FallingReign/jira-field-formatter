#!/usr/bin/env node

/**
 * Version Check Script for Jira Field Formatter Submodule
 * 
 * This script helps users check their current version and available updates.
 * Place this in your project root and run it to get version information.
 * 
 * Usage:
 *   node check-jira-formatter-version.js
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const SUBMODULE_PATH = './lib/jira-field-formatter';
const REPO_URL = 'https://github.com/FallingReign/jira-field-formatter.git';

function exec(command, cwd = process.cwd()) {
  try {
    return execSync(command, { 
      encoding: 'utf8', 
      cwd,
      stdio: 'pipe'
    }).trim();
  } catch (error) {
    return null;
  }
}

function checkSubmoduleExists() {
  return fs.existsSync(path.join(SUBMODULE_PATH, '.git'));
}

function getCurrentVersion() {
  const version = exec(`git describe --tags --exact-match`, SUBMODULE_PATH);
  if (version) return version;
  
  const commit = exec(`git rev-parse --short HEAD`, SUBMODULE_PATH);
  return commit ? `commit-${commit}` : 'unknown';
}

function getAvailableVersions() {
  const tags = exec(`git ls-remote --tags --sort=-v:refname ${REPO_URL}`);
  if (!tags) return [];
  
  return tags
    .split('\n')
    .map(line => {
      const match = line.match(/refs\/tags\/(.+)$/);
      return match ? match[1] : null;
    })
    .filter(tag => tag && !tag.includes('^{}'))
    .slice(0, 10); // Show latest 10 versions
}

function getLatestVersion(versions) {
  return versions.find(v => v.startsWith('v') && /^v\d+\.\d+\.\d+$/.test(v)) || 'unknown';
}

function main() {
  console.log('🔍 Jira Field Formatter Version Check\n');

  if (!checkSubmoduleExists()) {
    console.log('❌ Jira Field Formatter submodule not found.');
    console.log('\nTo add it to your project:');
    console.log(`   git submodule add -b latest ${REPO_URL} ${SUBMODULE_PATH}`);
    return;
  }

  // Get current version
  const currentVersion = getCurrentVersion();
  console.log(`📋 Current version: ${currentVersion}`);

  // Get available versions
  console.log('\n📥 Fetching available versions...');
  const availableVersions = getAvailableVersions();
  
  if (availableVersions.length === 0) {
    console.log('❌ Could not fetch available versions. Check your internet connection.');
    return;
  }

  const latestVersion = getLatestVersion(availableVersions);
  console.log(`📋 Latest stable version: ${latestVersion}`);

  // Check if update is available
  if (currentVersion !== latestVersion && currentVersion !== 'latest') {
    console.log('\n🆙 Update available!');
    console.log('\nTo update to latest stable version:');
    console.log(`   cd ${SUBMODULE_PATH}`);
    console.log('   git fetch origin');
    console.log('   git checkout latest');
    console.log('   cd ../..');
    console.log(`   git add ${SUBMODULE_PATH}`);
    console.log('   git commit -m "Update jira-field-formatter to latest version"');
  } else {
    console.log('\n✅ You are using the latest version!');
  }

  // Show available versions
  console.log('\n📋 Available versions:');
  availableVersions.forEach(version => {
    const marker = version === currentVersion ? ' (current)' : '';
    const latestMarker = version === 'latest' ? ' (stable)' : '';
    console.log(`   ${version}${marker}${latestMarker}`);
  });

  console.log('\n📖 Version usage:');
  console.log('   - Use "latest" for most recent stable release');
  console.log('   - Use "v1.2.0" for specific version pinning');
  console.log('   - Use "master" for development version (not recommended for production)');
}

main();
