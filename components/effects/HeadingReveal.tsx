"use client"

import { motion, useReducedMotion } from "framer-motion"
import { ANIMATION } from "@/lib/animation"

interface HeadingRevealProps {
  text: string
  className?: string
  as?: "h1" | "h2" | "h3"
  delay?: number
}

export default function HeadingReveal({
  text,
  className,
  as = "h2",
  delay = 0,
}: HeadingRevealProps) {
  const reducedMotion = useReducedMotion()
  const words = text.trim().split(/\s+/)

  if (reducedMotion) {
    if (as === "h1") return <h1 className={className}>{text}</h1>
    if (as === "h3") return <h3 className={className}>{text}</h3>
    return <h2 className={className}>{text}</h2>
  }

  const Tag = as

  return (
    <Tag className={className}>
      <motion.span
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.35 }}
        variants={{
          hidden: {},
          show: {
            transition: {
              delayChildren: delay,
              staggerChildren: 0.045,
            },
          },
        }}
        className="inline-block"
      >
        {words.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: ANIMATION.durationMedium,
                  ease: ANIMATION.easing,
                },
              },
            }}
            className="inline-block"
          >
            {word}
            {index < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  )
}
