import { createClient } from '@supabase/supabase-js';
import useSWR from 'swr';
import { useState, useEffect } from 'react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnon);

export default function Home() {
  const [session, setSession] = useState(null);
  useEffect(() => {
    const s = supabase.auth.getSession().then(r => r.data.session);
    s.then(ss => setSession(ss));
  }, []);
  const fetcher = (url) => fetch(url, { headers: { Authorization: session ? `Bearer ${session.access_token}` : '' } }).then(r=>r.json());
  const { data: apps } = useSWR(session ? ['/api/apps', session.access_token] : null, () => fetcher((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/apps'));

  async function signIn() {
    // magic link example
    const email = prompt('Email for magic link:');
    if (!email) return;
    await supabase.auth.signInWithOtp({ email });
    alert('Check your email for a login link.');
  }

  return (
    <div style={{ padding: 24, fontFamily: 'Inter, Arial' }}>
      <h1>KeepAlive - Dashboard (MVP)</h1>
      {!session && <button onClick={signIn}>Sign in (magic link)</button>}
      {session && (
        <div>
          <p>Connected: {session.user?.email}</p>
          <h2>Your apps</h2>
          <pre>{JSON.stringify(apps, null, 2)}</pre>
        </div>
      )}
      <p style={{ marginTop: 20 }}>Note: replace NEXT_PUBLIC_API_URL to point to the API.</p>
    </div>
  )
}
