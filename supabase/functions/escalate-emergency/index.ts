import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = user.id;

    const { session_id, justification, transcript_snippet } = await req.json();
    if (!session_id) {
      return new Response(JSON.stringify({ error: "session_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role for all DB operations
    const admin = createClient(supabaseUrl, serviceKey);

    // 1. Get session
    const { data: session, error: sessErr } = await admin
      .from("blackbox_sessions")
      .select("id, student_id, therapist_id, flag_level, escalation_reason, status")
      .eq("id", session_id)
      .single();

    if (sessErr || !session) {
      return new Response(JSON.stringify({ error: "Session not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Verify caller is therapist or expert
    const isTherapist = session.therapist_id === callerId;
    let isExpert = false;
    if (!isTherapist) {
      const { data: roleCheck } = await admin
        .from("user_roles")
        .select("id")
        .eq("user_id", callerId)
        .eq("role", "expert")
        .limit(1);
      isExpert = !!(roleCheck && roleCheck.length > 0);
    }

    if (!isTherapist && !isExpert) {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Fetch student profile
    const { data: studentProfile } = await admin
      .from("profiles")
      .select("institution_id, student_id, username")
      .eq("id", session.student_id)
      .single();

    // 4. Fetch emergency contact (service role bypasses RLS)
    const { data: privateData } = await admin
      .from("user_private")
      .select("emergency_name_encrypted, emergency_phone_encrypted, emergency_relation, contact_is_self")
      .eq("user_id", session.student_id)
      .single();

    const contact = privateData
      ? {
          name: privateData.emergency_name_encrypted || "Not provided",
          phone: privateData.emergency_phone_encrypted || "Not provided",
          relation: privateData.emergency_relation || "Not specified",
          is_self: privateData.contact_is_self || false,
        }
      : null;

    // 5. Find SPOC for institution
    let spocId = callerId; // fallback
    if (studentProfile?.institution_id) {
      const { data: spocs } = await admin
        .from("profiles")
        .select("id")
        .eq("institution_id", studentProfile.institution_id)
        .eq("role", "spoc")
        .limit(1);
      if (spocs && spocs.length > 0) spocId = spocs[0].id;
    }

    // 6. Build trigger_snippet
    const triggerSnippet = JSON.stringify({
      type: "emergency_contact",
      ...(contact || {}),
      student_eternia_id: studentProfile?.student_id || null,
      student_username: studentProfile?.username || null,
      transcript_snippet: transcript_snippet || null,
      session_id: session.id,
    });

    // 7. Insert escalation request
    const { data: escalation, error: escError } = await admin
      .from("escalation_requests")
      .insert({
        spoc_id: spocId,
        justification_encrypted: justification || `L3 Emergency escalation during BlackBox session. ${session.escalation_reason || "Critical risk detected by AI."}`,
        escalation_level: 3,
        status: "critical",
        trigger_snippet: triggerSnippet,
        trigger_timestamp: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (escError) {
      console.error("Escalation insert error:", escError);
      return new Response(JSON.stringify({ error: "Failed to create escalation", details: escError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 8. Notify SPOC
    await admin.from("notifications").insert({
      user_id: spocId,
      type: "emergency_escalation",
      title: "🚨 L3 Emergency — Contact Info Available",
      message: `Critical BlackBox session (L${session.flag_level}) escalated. Emergency contact: ${contact?.name || "N/A"} (${contact?.phone || "N/A"}, ${contact?.relation || "N/A"}). ${session.escalation_reason || "Immediate attention required."}`,
      metadata: {
        session_id: session.id,
        student_id: session.student_id,
        escalated_by: callerId,
        emergency_contact: contact || null,
        student_eternia_id: studentProfile?.student_id || null,
        student_username: studentProfile?.username || null,
      },
    });

    // 9. Notify other experts
    const { data: expertProfiles } = await admin
      .from("profiles")
      .select("id")
      .eq("role", "expert")
      .eq("is_active", true)
      .neq("id", callerId);

    if (expertProfiles && expertProfiles.length > 0) {
      await admin.from("notifications").insert(
        expertProfiles.map((e) => ({
          user_id: e.id,
          type: "emergency_escalation",
          title: "🚨 Emergency Case Escalated",
          message: `A critical BlackBox session (L${session.flag_level}) has been escalated. ${session.escalation_reason || "Immediate attention required."}`,
          metadata: {
            session_id: session.id,
            student_id: session.student_id,
            escalated_by: callerId,
          },
        }))
      );
    }

    // 10. Audit log
    await admin.from("audit_logs").insert({
      actor_id: callerId,
      action_type: "l3_emergency_escalation",
      target_table: "blackbox_sessions",
      target_id: session.id,
      metadata: { student_id: session.student_id, has_contact: !!contact },
    });

    return new Response(
      JSON.stringify({
        success: true,
        escalation_id: escalation?.id,
        contact,
        student_username: studentProfile?.username,
        student_eternia_id: studentProfile?.student_id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("escalate-emergency error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
