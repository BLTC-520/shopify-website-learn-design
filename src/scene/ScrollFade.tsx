import { useRef, type ReactNode } from "react"
import { useFrame } from "@react-three/fiber"
import { Mesh, type Group, type MeshBasicMaterial } from "three"
import { lerp, smoothstep } from "../lib/math"
import { scroll } from "../lib/scroll"
import { useExperience } from "../store/experience"

type ScrollFadeProps = {
  children: ReactNode
  from?: number
  to?: number
}

export function ScrollFade({ children, from = 0.06, to = 0.3 }: ScrollFadeProps) {
  const ref = useRef<Group>(null)
  const reducedMotion = useExperience((s) => s.reducedMotion)

  useFrame(() => {
    const group = ref.current
    if (!group) return
    const amount = reducedMotion ? 1 : 1 - smoothstep(from, to, scroll.current)
    group.visible = amount > 0.02
    group.scale.setScalar(lerp(0.86, 1, amount))
    group.traverse((obj) => {
      if (!(obj instanceof Mesh)) return
      const material = obj.material as MeshBasicMaterial
      if (!material) return
      material.transparent = true
      material.opacity = amount
      material.depthWrite = amount > 0.35
    })
  })

  return <group ref={ref}>{children}</group>
}
