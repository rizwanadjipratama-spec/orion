"use client"

import { useEffect } from "react"
import Lenis from "lenis"

/**
 * COMPONENT: SmoothScroll
 * PURPOSE: Provides global smooth scroll behavior.
 * PERFORMANCE: Cancels requestAnimationFrame loop on unmount to avoid leaks.
 */
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const isTouchLikeDevice = window.matchMedia("(hover: none), (pointer: coarse)").matches

    if (prefersReducedMotion || isTouchLikeDevice) {
      return
    }

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      wheelMultiplier: 1,
    })
    let rafId = 0

    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }

    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
