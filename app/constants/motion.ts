/**
 * Fluid Functionalism Motion Tokens
 * Three spring speeds and one-tier-quicker asymmetric exits.
 */
export const MOTION_TOKENS = {
  fast: 80,
  moderate: 160,
  slow: 240,
  fastExit: 60,
  moderateExit: 120,
  slowExit: 160,
  easeFluid: 'cubic-bezier(0.23, 1, 0.32, 1)',
  easeFluidExit: 'cubic-bezier(0.4, 0, 1, 1)',
} as const

export type MotionTier = 'fast' | 'moderate' | 'slow'
