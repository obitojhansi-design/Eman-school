// ============================================================
// Supabase client + shared helpers
// ============================================================

const SUPABASE_URL = 'https://ssmvuiklljfbvzlaxywc.supabase.co';      // ← replace
const SUPABASE_ANON_KEY = 'sb_publishable_2V1bVNhKlfXLCqFTp9Qc0A_mGI-YPYf';                     // ← replace

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Redirect to login if not authenticated. Optionally require role.
async function requireAuth(requiredRole = null) {
  const { data: { session } } = await db.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  const { data: profile, error } = await db
    .from('profiles').select('*').eq('id', session.user.id).single();
  if (error || !profile) {
    await db.auth.signOut();
    window.location.href = 'login.html';
    return null;
  }
  if (requiredRole === 'admin_or_teacher') {
    if (!['admin','teacher'].includes(profile.role)) {
      window.location.href = 'daily-lessons.html';
      return null;
    }
  } else if (requiredRole && profile.role !== requiredRole) {
    window.location.href = profile.role === 'student' ? 'daily-lessons.html' : 'admin.html';
    return null;
  }
  return { session, profile };
}

async function signOut() {
  await db.auth.signOut();
  window.location.href = 'login.html';
}

// Extract YouTube video ID from any YouTube URL
function getYoutubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

// Shuffle array (Fisher-Yates)
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Simple toast
function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = `
    position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
    background:${type==='error'?'#b91c1c':type==='success'?'#174B3A':'#26332D'};
    color:#fff;padding:12px 22px;border-radius:6px;font-family:'DM Sans',sans-serif;
    font-size:14px;z-index:99999;box-shadow:0 8px 24px rgba(0,0,0,.2);
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}