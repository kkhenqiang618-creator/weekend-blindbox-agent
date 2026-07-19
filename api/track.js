/**
 * Weekend Buddy - /api/track (Vercel Serverless)
 *
 * Self-contained — uses native fetch to call Supabase REST API directly,
 * no @supabase/supabase-js dependency needed.
 *
 * Required env vars (set in Vercel Dashboard):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

/**
 * POST a JSON row to a Supabase table using the REST API.
 */
async function supabaseInsert(table, row) {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.warn("[api/track] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — skipping");
    return { ok: false, error: "Supabase not configured" };
  }

  const url = `${SUPABASE_URL.replace(/\/+$/, "")}/rest/v1/${table}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SERVICE_KEY,
      "Authorization": `Bearer ${SERVICE_KEY}`,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify(row),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`[api/track] Supabase ${table} insert failed (${res.status}):`, text);
    return { ok: false, error: `Supabase error ${res.status}` };
  }

  return { ok: true };
}

module.exports = async function handler(req, res) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    res.status(204).setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const headers = { ...corsHeaders(), "Content-Type": "application/json" };

  try {
    const body = typeof req.body === "object" ? req.body : JSON.parse(req.body || "{}");
    const { sessionId, eventName, eventData, planData } = body;

    if (!sessionId || typeof sessionId !== "string") {
      res.writeHead(400, headers);
      res.end(JSON.stringify({ error: "Missing or invalid sessionId" }));
      return;
    }

    // Write to wb_generated_plans if planData provided
    if (planData) {
      const planResult = await supabaseInsert("wb_generated_plans", {
        session_id: sessionId,
        intent_source: planData.intentSource || null,
        live_search_status: planData.liveSearchStatus || null,
        city: planData.city || "",
        district: planData.district || null,
        people_type: planData.peopleType || "",
        budget_max: planData.budgetMax ?? 0,
        blind_box_theme: planData.blindBoxTheme || null,
        route_names: planData.routeNames || [],
        route_types: planData.routeTypes || [],
        total_minutes: planData.totalMinutes ?? null,
        budget_min: planData.budgetMin ?? null,
        budget_max_est: planData.budgetMaxEst ?? null,
        raw_plan: planData.rawPlan || {},
      });
      if (!planResult.ok) {
        console.warn("[api/track] plan insert failed, continuing:", planResult.error);
      }
    }

    // Write event to wb_events (always, even when planData is present)
    if (eventName && typeof eventName === "string") {
      const eventResult = await supabaseInsert("wb_events", {
        session_id: sessionId,
        event_name: eventName,
        page: eventData?.page || null,
        payload: eventData?.payload || {},
      });
      if (!eventResult.ok) {
        console.warn("[api/track] event insert failed:", eventResult.error);
      }
    }

    res.writeHead(200, headers);
    res.end(JSON.stringify({ ok: true }));
  } catch (err) {
    console.error("[api/track] unexpected error:", err);
    res.writeHead(500, headers);
    res.end(JSON.stringify({ error: err.message }));
  }
};
