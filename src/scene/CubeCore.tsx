import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Quaternion, Vector3, type Mesh } from "three"
import { CUBE_EDGE } from "../data/paperJourney"
import { easeInOutCubic, smoothstep } from "../lib/math"
import { scroll, view } from "../lib/scroll"
import { useExperience } from "../store/experience"

const Y_AXIS = new Vector3(0, 1, 0)

export function CubeCore() {
  const mesh = useRef<Mesh>(null)
  const spinQ = useRef(new Quaternion())
  const reducedMotion = useExperience((s) => s.reducedMotion)

  useFrame(() => {
    const el = mesh.current
    if (!el) return
    if (reducedMotion) {
      el.visible = false
      return
    }
    const p = scroll.current
    const grow = easeInOutCubic(smoothstep(0.78, 0.94, p))
    const spin = smoothstep(0.7, 1, p) * Math.PI * 1.18
    el.visible = grow > 0.02
    el.scale.setScalar(grow * CUBE_EDGE * 0.985 * view.cubeFit)
    spinQ.current.setFromAxisAngle(Y_AXIS, spin)
    el.quaternion.copy(spinQ.current)
  })

  return (
    <mesh ref={mesh} visible={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#cfc9b6" roughness={0.94} metalness={0} />
    </mesh>
  )
}
