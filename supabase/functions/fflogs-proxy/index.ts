import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Token cache (within the same Edge Function isolate)
let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getFFLogsToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) return cachedToken;

  const clientId     = Deno.env.get("FFLOGS_CLIENT_ID");
  const clientSecret = Deno.env.get("FFLOGS_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("FFLogs credentials not configured in Supabase secrets");
  }

  const body = new URLSearchParams({
    grant_type:    "client_credentials",
    client_id:     clientId,
    client_secret: clientSecret,
  });

  const res = await fetch("https://www.fflogs.com/oauth/token", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`FFLogs token error ${res.status}: ${text}`);
  }

  const data = await res.json();
  cachedToken    = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;
  return cachedToken!;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const token = await getFFLogsToken();
    const body  = await req.text();

    const ffRes = await fetch("https://www.fflogs.com/api/v2/client", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body,
    });

    const data = await ffRes.json();
    return new Response(JSON.stringify(data), {
      status:  ffRes.ok ? 200 : ffRes.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status:  500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
