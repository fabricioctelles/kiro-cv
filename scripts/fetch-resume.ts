/**
 * Pre-build script: fetches resume.json from RESUME_URL if set,
 * otherwise falls back to the local resume.json.
 *
 * Usage:
 *   RESUME_URL=https://example.com/resume.json pnpm build
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Load .env.local if it exists (Next.js convention)
const envPath = resolve(__dirname, '..', '.env.local');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}

const RESUME_PATH = resolve(__dirname, '..', 'resume.json');

async function main() {
  const url = process.env.RESUME_URL;

  if (!url) {
    if (existsSync(RESUME_PATH)) {
      console.log('ℹ  RESUME_URL not set — using local resume.json');
    } else {
      console.error('✗  No RESUME_URL set and no local resume.json found.');
      console.error('   Set RESUME_URL or place a resume.json in the project root.');
      process.exit(1);
    }
    return;
  }

  console.log(`↓  Fetching resume from ${url}`);

  const res = await fetch(url);
  if (!res.ok) {
    console.error(`✗  Failed to fetch resume: ${res.status} ${res.statusText}`);
    process.exit(1);
  }

  const data = await res.text();

  // Validate it's valid JSON
  try {
    JSON.parse(data);
  } catch {
    console.error('✗  Fetched content is not valid JSON');
    process.exit(1);
  }

  writeFileSync(RESUME_PATH, data, 'utf-8');
  console.log('✓  resume.json updated successfully');
}

main();
