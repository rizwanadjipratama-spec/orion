export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === "object" && error !== null) {
    const candidate = error as { message?: unknown; details?: unknown; hint?: unknown }
    const message = typeof candidate.message === "string" ? candidate.message : ""
    const details = typeof candidate.details === "string" ? candidate.details : ""
    const hint = typeof candidate.hint === "string" ? candidate.hint : ""
    const merged = [message, details, hint].filter(Boolean).join(" ").trim()

    if (merged) {
      return merged
    }
  }

  if (typeof error === "string" && error.trim()) {
    return error
  }

  return fallback
}
