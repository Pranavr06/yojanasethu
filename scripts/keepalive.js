/**
 * Supabase Keepalive Ping Script for YojanaSethu
 *
 * Keeps Supabase free-tier project active by executing real queries against
 * PostgREST and Auth endpoints, resetting the 7-day inactivity pause counter.
 *
 * Can be run:
 * 1. Inside GitHub Actions on a 5-day schedule (using GitHub Secrets)
 * 2. Locally via Node.js: `node scripts/keepalive.js` (reads .env.local)
 * 3. Via Windows Task Scheduler using keepalive.xml
 */

const fs = require('fs');
const path = require('path');

function getCredentials() {
  let url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  let anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

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
    console.error('Ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in environment or .env.local.');
    process.exit(1);
  }

  console.log(`Target Supabase URL: ${url}`);
  let allSuccess = true;

  // 1. PostgREST Database Query (executes a real SQL SELECT against PostgreSQL)
  try {
    const postgrestStart = Date.now();
    const restRes = await fetch(`${url}/rest/v1/profiles?select=count`, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Range': '0-0',
      },
    });
    const duration = Date.now() - postgrestStart;

    if (restRes.ok) {
      console.log(`✅ [PostgREST / Database]: OK (${restRes.status} in ${duration}ms) — Active database query registered.`);
    } else {
      console.warn(`⚠️ [PostgREST / Database]: Returned HTTP ${restRes.status} ${restRes.statusText}`);
      // Even 404 or table check still hits PostgREST and registers API activity
    }
  } catch (err) {
    console.error(`❌ [PostgREST / Database]: Request failed:`, err.message);
    allSuccess = false;
  }

  // 2. Auth Service Health Check
  try {
    const authStart = Date.now();
    const authRes = await fetch(`${url}/auth/v1/health`, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
      },
    });
    const duration = Date.now() - authStart;

    if (authRes.ok) {
      console.log(`✅ [Auth / GoTrue]: OK (${authRes.status} in ${duration}ms) — Auth service alive.`);
    } else {
      console.warn(`⚠️ [Auth / GoTrue]: Returned HTTP ${authRes.status}`);
    }
  } catch (err) {
    console.error(`❌ [Auth / GoTrue]: Request failed:`, err.message);
    allSuccess = false;
  }

  // 3. Storage Service Health Check
  try {
    const storageStart = Date.now();
    const storageRes = await fetch(`${url}/storage/v1/bucket`, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      },
    });
    const duration = Date.now() - storageStart;

    if (storageRes.ok) {
      console.log(`✅ [Storage API]: OK (${storageRes.status} in ${duration}ms) — Storage service alive.`);
    } else {
      console.log(`ℹ️ [Storage API]: Status ${storageRes.status} (${duration}ms) — Endpoint reached.`);
    }
  } catch (err) {
    console.warn(`ℹ️ [Storage API]: Request notice:`, err.message);
  }

  console.log('----------------------------------------------------');
  if (allSuccess) {
    console.log('🎉 SUCCESS: Supabase project successfully kept alive! 7-day inactivity pause timer reset.');
    process.exit(0);
  } else {
    console.error('⚠️ WARNING: One or more keepalive pings encountered issues.');
    process.exit(1);
  }
}

pingSupabase();
