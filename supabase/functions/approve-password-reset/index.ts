import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  corsHeaders,
  checkRateLimit,
  rateLimitResponse,
  getClientIP,
  sanitizeString,
  isValidUUID,
  errorResponse,
  jsonResponse,
} from "../_shared/security.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ip = getClientIP(req);
    const rl = checkRateLimit(`approve-reset:${ip}`, 20, 60_000);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfter!);

    // Verify admin via auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return errorResponse("Unauthorized", 401);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller is admin
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await anonClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return errorResponse("Unauthorized", 401);
    }
    const adminUserId = claimsData.claims.sub;

    // Check admin role
    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
      _user_id: adminUserId,
      _role: "admin",
    });
    if (!isAdmin) return errorResponse("Admin access required", 403);

    const { request_id, action, admin_note } = await req.json();

    if (!isValidUUID(request_id)) return errorResponse("Invalid request ID");
    if (action !== "approve" && action !== "reject") {
      return errorResponse("Action must be 'approve' or 'reject'");
    }

    // Fetch the request
    const { data: resetReq, error: fetchErr } = await supabaseAdmin
      .from("password_reset_requests")
      .select("*")
      .eq("id", request_id)
      .maybeSingle();

    if (fetchErr) return errorResponse("Server error", 500);
    if (!resetReq) return errorResponse("Request not found", 404);
    if (resetReq.status !== "pending") {
      return errorResponse("Request already processed");
    }

    if (action === "reject") {
      const { error: updateErr } = await supabaseAdmin
        .from("password_reset_requests")
        .update({
          status: "rejected",
          admin_id: adminUserId,
          admin_note: sanitizeString(admin_note, 500) || null,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", request_id);

      if (updateErr) return errorResponse("Failed to reject", 500);
      return jsonResponse({ success: true, message: "Request rejected" });
    }

    // action === "approve"
    // Look up the user by username
    const email = `${resetReq.username.toLowerCase()}@eternia.local`;
    const { data: users, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) return errorResponse("Server error", 500);

    const user = users.users.find((u: any) => u.email === email);
    if (!user) return errorResponse("User not found in auth system", 404);

    // Generate random temp password
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
    let tempPassword = "";
    for (let i = 0; i < 12; i++) {
      tempPassword += chars[Math.floor(Math.random() * chars.length)];
    }

    // Reset the password
    const { error: updateUserErr } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: tempPassword }
    );
    if (updateUserErr) {
      return errorResponse("Failed to reset password: " + updateUserErr.message, 500);
    }

    // Update the request
    const { error: updateReqErr } = await supabaseAdmin
      .from("password_reset_requests")
      .update({
        status: "approved",
        admin_id: adminUserId,
        admin_note: sanitizeString(admin_note, 500) || null,
        temp_password: tempPassword,
        user_id: user.id,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", request_id);

    if (updateReqErr) {
      return errorResponse("Password reset but failed to update request record", 500);
    }

    return jsonResponse({
      success: true,
      message: "Password reset successfully",
      temp_password: tempPassword,
    });
  } catch {
    return errorResponse("Invalid request", 400);
  }
});
