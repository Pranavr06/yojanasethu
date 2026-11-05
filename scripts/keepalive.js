/**
 * Supabase Keepalive Ping Script for YojanaSethu
 *
 * Keeps Supabase free-tier project active by executing real queries against
 * PostgREST tables, Auth, and Storage endpoints, preventing the 7-day inactivity pause.
 *
 * Can be run:
 * 1. Inside GitHub Actions on a daily schedule (using GitHub Secrets)
 * 2. Locally via Node.js: `npm run keepalive` (reads .env.local)
 * 3. Via Windows Task Scheduler using keepalive.xml
 */

const fs = require('fs');
const path = require('path');

function getCredentials() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  let anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  // Fallback to .env.local if running locally
  if (!url || !anonKey) {
    const envPath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const urlMatch = content.match(/NEXT_PUBLIC_SUPABASE_URL=([^\r\n]+)/);
      const keyMatch = content.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=([^\r\n]+)/);
      if (urlMatch) url = urlMatch[1].trim();
      if (keyMatch) anonKey = keyMatch[1].trim();
    }
  }

  // Sanitize trailing slash
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }

  return { url, anonKey };
}

async function pingSupabase() {
  const { url, anonKey } = getCredentials();
  const timestamp = new Date().toISOString();

  console.log('====================================================');
  console.log(`[${timestamp}] 🚀 SUPABASE KEEPALIVE HEARTBEAT`);
  console.log('====================================================');

  if (!url || !anonKey) {
    console.error('❌ ERROR: Missing Supabase credentials!');
    console.error('Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
    process.exit(1);
  }

  console.log(`Target Supabase URL: ${url}`);
  let successCount = 0;

  const headers = {
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`,
  };

  // 1. PostgREST Query: placement_announcements
  try {
    const start = Date.now();
    const res = await fetch(`${url}/rest/v1/placement_announcements?select=id,title&limit=1`, {
      method: 'GET',
      headers,
    });
    const dur = Date.now() - start;
    if (res.ok) {
      console.log(`✅ [Database - Announcements]: OK (${res.status} in ${dur}ms) — PostgreSQL query executed.`);
      successCount++;
    } else {
      console.warn(`⚠️ [Database - Announcements]: HTTP ${res.status} (${dur}ms)`);
    }
  } catch (err) {
    console.error(`❌ [Database - Announcements]: ${err.message}`);
  }

  // 2. PostgREST Query: companies
  try {
    const start = Date.now();
    const res = await fetch(`${url}/rest/v1/companies?select=id,name&limit=1`, {
      method: 'GET',
      headers,
    });
    const dur = Date.now() - start;
    if (res.ok) {
      console.log(`✅ [Database - Companies]: OK (${res.status} in ${dur}ms) — PostgreSQL query executed.`);
      successCount++;
    } else {
      console.warn(`⚠️ [Database - Companies]: HTTP ${res.status} (${dur}ms)`);
    }
  } catch (err) {
    console.error(`❌ [Database - Companies]: ${err.message}`);
  }

  // 3. PostgREST Query: profiles
  try {
    const start = Date.now();
    const res = await fetch(`${url}/rest/v1/profiles?select=id,role&limit=1`, {
      method: 'GET',
      headers,
    });
    const dur = Date.now() - start;
    if (res.ok) {
      console.log(`✅ [Database - Profiles]: OK (${res.status} in ${dur}ms) — PostgreSQL query executed.`);
      successCount++;
    } else {
      console.warn(`⚠️ [Database - Profiles]: HTTP ${res.status} (${dur}ms)`);
    }
  } catch (err) {
    console.error(`❌ [Database - Profiles]: ${err.message}`);
  }

  // 4. Auth Service Health Check
  try {
    const start = Date.now();
    const res = await fetch(`${url}/auth/v1/health`, {
      method: 'GET',
      headers: { 'apikey': anonKey },
    });
    const dur = Date.now() - start;
    if (res.ok) {
      console.log(`✅ [Auth / GoTrue]: OK (${res.status} in ${dur}ms) — Auth service alive.`);
      successCount++;
    } else {
      console.warn(`⚠️ [Auth / GoTrue]: HTTP ${res.status} (${dur}ms)`);
    }
  } catch (err) {
    console.error(`❌ [Auth / GoTrue]: ${err.message}`);
  }

  // 5. Storage Service Health Check
  try {
    const start = Date.now();
    const res = await fetch(`${url}/storage/v1/bucket`, {
      method: 'GET',
      headers,
    });
    const dur = Date.now() - start;
    if (res.ok) {
      console.log(`✅ [Storage API]: OK (${res.status} in ${dur}ms) — Storage service alive.`);
      successCount++;
    } else {
      console.log(`ℹ️ [Storage API]: HTTP ${res.status} (${dur}ms)`);
    }
  } catch (err) {
    console.warn(`ℹ️ [Storage API]: ${err.message}`);
  }

  console.log('----------------------------------------------------');
  if (successCount > 0) {
    console.log(`🎉 SUCCESS: ${successCount} keepalive checks succeeded! Supabase database activity registered.`);
    process.exit(0);
  } else {
    console.error('❌ FAILURE: All keepalive checks failed. Project may be paused or unreachable.');
    process.exit(1);
  }
}

pingSupabase();
