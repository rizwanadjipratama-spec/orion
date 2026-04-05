import { supabase } from "@/lib/supabase"

/**
 * Shared admin access guard.
 */
export async function hasAdminAccess() {
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return false
  }

  const { data: adminRow, error: adminError } = await supabase
    .from("admin_users")
    .select("id")
    .eq("user_id", data.user.id)
    .eq("is_active", true)
    .maybeSingle()

  if (adminError) {
    return false
  }

  return Boolean(adminRow)
}
