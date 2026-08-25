import { clamp01, easeInOutCubic, lerp, smoothstep } from "./math"

export const PHASE = {
  assemble: 0.42,
  settle: 0.48,
  enter: 0.7,
  deep: 0.94,
  introIn: 0.74,
  introCopy: 0.88,
} as const

export function assembleP(p: number) {
  return clamp01(p / PHASE.assemble)
}

export function settleP(p: number) {
  return smoothstep(PHASE.assemble, PHASE.settle, p)
}

export function enterP(p: number) {
  return smoothstep(PHASE.settle, PHASE.enter, p)
}

export function deepP(p: number) {
  return smoothstep(PHASE.enter, PHASE.deep, p)
}

export function cubeSpinY(p: number) {
  const assembleSpin = smoothstep(0.7, 1, assembleP(p)) * Math.PI * 1.18
  return lerp(assembleSpin, Math.PI * 2, easeInOutCubic(settleP(p)))
}

export function introHeadP(p: number) {
  return smoothstep(PHASE.introIn, PHASE.introIn + 0.1, p)
}

export function introBodyP(p: number) {
  return smoothstep(PHASE.introIn + 0.06, PHASE.introCopy, p)
}

export function introScrimP(p: number) {
  return smoothstep(PHASE.introIn - 0.04, PHASE.introIn + 0.12, p)
}
