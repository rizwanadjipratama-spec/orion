"use client"

import { motion, useReducedMotion } from "framer-motion"
import { ANIMATION } from "@/lib/animation"

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  y?: number
  amount?: number
  once?: boolean
}

export default function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 20,
  amount = 0.2,
  once = true,
}: ScrollRevealProps) {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{
        duration: ANIMATION.durationSlow,
        ease: ANIMATION.easing,
        delay,
      }}
    >
      {children}
    </motion.div>
  )
}
