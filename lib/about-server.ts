import "server-only"

import { normalizeAboutContent, FALLBACK_ABOUT_CONTENT } from "@/lib/about-content"

interface SupabaseAboutResponse {
  id: string
  title: string
  subtitle: string
  paragraph1: string
  paragraph2: string
  paragraph3: string
  created_at: string
}

export async function getPublicAboutContent() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return FALLBACK_ABOUT_CONTENT
  }

  try {
    const response = await fetch(
      `${url}/rest/v1/about_section?select=id,title,subtitle,paragraph1,paragraph2,paragraph3,created_at&order=created_at.asc&limit=1`,
      {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
        next: { revalidate: 300 },
      }
    )

    if (!response.ok) {
      return FALLBACK_ABOUT_CONTENT
    }

    const data = (await response.json()) as SupabaseAboutResponse[]
    return normalizeAboutContent(data[0])
  } catch {
    return FALLBACK_ABOUT_CONTENT
  }
}
