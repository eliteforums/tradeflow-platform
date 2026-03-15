import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function toBase64Url(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);

    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized', details: 'Missing or invalid Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    console.log('Auth result — user:', user?.id, 'error:', userError?.message);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized', details: userError?.message || 'Invalid session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let body: { action?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Bad request', details: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action } = body;
    console.log('Action requested:', action);

    const VIDEOSDK_API_KEY = Deno.env.get('VIDEOSDK_API_KEY');
    const VIDEOSDK_API_SECRET = Deno.env.get('VIDEOSDK_API_SECRET');

    if (!VIDEOSDK_API_KEY || !VIDEOSDK_API_SECRET) {
      console.error('VideoSDK credentials missing');
      return new Response(JSON.stringify({ error: 'VideoSDK not configured', details: 'API key or secret is missing from server configuration' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate JWT token for VideoSDK
    const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const now = Math.floor(Date.now() / 1000);
    const payload = toBase64Url(JSON.stringify({
      apikey: VIDEOSDK_API_KEY,
      permissions: ['allow_join', 'allow_mod'],
      iat: now,
      exp: now + 7200,
    }));

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(VIDEOSDK_API_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBytes = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(`${header}.${payload}`)
    );

    const signature = arrayBufferToBase64Url(signatureBytes);
    const videosdkToken = `${header}.${payload}.${signature}`;

    if (action === 'get-token') {
      console.log('Returning token successfully');
      return new Response(JSON.stringify({ token: videosdkToken }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'create-room') {
      console.log('Creating VideoSDK room...');
      const roomResponse = await fetch('https://api.videosdk.live/v2/rooms', {
        method: 'POST',
        headers: {
          Authorization: videosdkToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      let roomData: any;
      const responseText = await roomResponse.text();
      try {
        roomData = JSON.parse(responseText);
      } catch {
        console.error('Non-JSON response from VideoSDK:', responseText.substring(0, 200));
        return new Response(JSON.stringify({ error: 'Video provider error', details: `Upstream returned status ${roomResponse.status} with non-JSON body` }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Room response status:', roomResponse.status, JSON.stringify(roomData));

      if (!roomResponse.ok) {
        return new Response(JSON.stringify({ error: 'Failed to create room', details: roomData?.message || roomData?.error || `VideoSDK API returned ${roomResponse.status}` }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ token: videosdkToken, roomId: roomData.roomId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action', details: 'Use "get-token" or "create-room"' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unhandled error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
