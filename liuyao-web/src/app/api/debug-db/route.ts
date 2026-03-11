import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const results: Record<string, unknown> = {
    hasUrl: Boolean(url),
    urlPrefix: url?.substring(0, 30),
    hasServiceKey: Boolean(serviceKey),
    serviceKeyPrefix: serviceKey?.substring(0, 10),
  };

  if (!url || !serviceKey) {
    return NextResponse.json({ ...results, error: 'Missing env vars' });
  }

  // Test 1: Direct REST API call to Supabase
  try {
    const res = await fetch(`${url}/rest/v1/divinations?select=id&limit=1`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
    });
    results.restStatus = res.status;
    results.restOk = res.ok;
    const body = await res.text();
    results.restBody = body.substring(0, 200);
  } catch (err) {
    results.restError = (err as Error).message;
  }

  // Test 2: Supabase JS client
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const client = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await client.from('divinations').select('id').limit(1);
    results.clientOk = !error;
    results.clientError = error?.message;
    results.clientData = data?.length;
  } catch (err) {
    results.clientImportError = (err as Error).message;
  }

  // Test 3: Write test
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const client = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const testId = crypto.randomUUID();
    const { error } = await client.from('divinations').upsert({
      id: testId,
      question: 'diagnostic test',
      category: 'other',
      time_scope: 'recent',
      background: '',
      locale: 'zh-CN',
      created_at: new Date().toISOString(),
    });
    results.writeOk = !error;
    results.writeError = error?.message;
    // Clean up
    if (!error) {
      await client.from('divinations').delete().eq('id', testId);
    }
  } catch (err) {
    results.writeTestError = (err as Error).message;
  }

  return NextResponse.json(results);
}
