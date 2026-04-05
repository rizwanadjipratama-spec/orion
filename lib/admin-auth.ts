import { supabase } from "@/lib/supabase"
import { siteConfig } from "@/lib/site-config"

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
    .select("id, email")
    .eq("user_id", data.user.id)
    .eq("is_active", true)
    .maybeSingle()

  if (adminError) {
    return data.user.email === siteConfig.contact.adminEmail
  }

  if (adminRow) {
    return true
  }

  return data.user.email === siteConfig.contact.adminEmail
}
