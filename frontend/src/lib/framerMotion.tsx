import { AnimatePresence, motion } from 'framer-motion'

export interface AnimatedComponentProps extends React.PropsWithChildren {
  /**
   * A boolean value which activates the motion component when the condition is true.
   */
  condition: boolean
}

export function AnimatedComponent({ condition, children }: AnimatedComponentProps) {
  return <AnimatePresence>{condition && children}</AnimatePresence>
}

export const MotionSection = motion.section
export const MotionDiv = motion.div
export const MotionH1 = motion.h1
export const MotionH2 = motion.h2
export const MotionH3 = motion.h3
export const MotionH4 = motion.h4
export const MotionH5 = motion.h5
export const MotionH6 = motion.h6
export const MotionP = motion.p
export const MotionSpan = motion.span
export const MotionImg = motion.img
export const MotionButton = motion.button
