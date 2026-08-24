import { useRef, type ReactNode } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group } from "three"
import { useExperience } from "../store/experience"

type FloatGroupProps = {
  amp: number
  speed: number
  phase: number
  children: ReactNode
}

export function FloatGroup({ amp, speed, phase, children }: FloatGroupProps) {
  const ref = useRef<Group>(null)
  const reducedMotion = useExperience((s) => s.reducedMotion)

  useFrame(({ clock }) => {
    const group = ref.current
    if (!group || reducedMotion) return
    const t = clock.elapsedTime * speed + phase
    group.position.y = Math.sin(t) * amp
    group.rotation.z = Math.sin(t * 0.65) * amp * 0.35
  })

  return <group ref={ref}>{children}</group>
}
