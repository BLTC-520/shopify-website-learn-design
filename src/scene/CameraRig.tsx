import { useRef, type ReactNode } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import type { Group } from "three"
import { lerp, smoothstep } from "../lib/math"
import { dampPointer, pointer } from "../lib/pointer"
import { scroll } from "../lib/scroll"
import { useExperience } from "../store/experience"

type CameraRigProps = {
  children: ReactNode
}

export function CameraRig({ children }: CameraRigProps) {
  const group = useRef<Group>(null)
  const reducedMotion = useExperience((s) => s.reducedMotion)
  const width = useThree((s) => s.size.width)

  useFrame((_, delta) => {
    dampPointer(delta)
    if (!group.current) return
    const mobile = width < 700
    const settle = reducedMotion ? 0 : smoothstep(0.08, 0.42, scroll.current)
    group.current.position.x = lerp(mobile ? -0.72 : 0, 0, settle)
    group.current.position.y = lerp(mobile ? 0.08 : 0, 0, settle)
    if (reducedMotion) {
      group.current.rotation.set(0, 0, 0)
      return
    }
    const pointerAmt = 1 - smoothstep(0.12, 0.45, scroll.current)
    group.current.rotation.y = pointer.x * 0.02 * pointerAmt
    group.current.rotation.x = pointer.y * 0.05 * pointerAmt
  })

  return <group ref={group}>{children}</group>
}
