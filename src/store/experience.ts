import { create } from "zustand"
import { detectWebGL, prefersReducedMotion } from "../lib/quality"

type ExperienceState = {
  webglOk: boolean
  reducedMotion: boolean
  hydrate: () => void
}

export const useExperience = create<ExperienceState>((set) => ({
  webglOk: true,
  reducedMotion: false,
  hydrate: () =>
    set({
      webglOk: detectWebGL(),
      reducedMotion: prefersReducedMotion(),
    }),
}))
