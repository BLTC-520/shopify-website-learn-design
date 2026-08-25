import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type { AmbientLight } from "three"
import { scroll } from "../lib/scroll"
import { enterP } from "../lib/timeline"

export function Lights() {
  const ambient = useRef<AmbientLight>(null)

  useFrame(() => {
    if (!ambient.current) return
    ambient.current.intensity = 0.42 + enterP(scroll.current) * 0.32
  })

  return (
    <>
      <ambientLight ref={ambient} intensity={0.42} color="#f3eee0" />
      <directionalLight
        position={[-2.4, 1.6, 3.2]}
        intensity={1.35}
        color="#fff3dd"
      />
      <directionalLight
        position={[2.8, 0.4, 1.4]}
        intensity={0.28}
        color="#d7e0e8"
      />
      <directionalLight
        position={[1.6, 1.2, -0.6]}
        intensity={0.22}
        color="#ffe7c4"
      />
      <directionalLight
        position={[-0.4, 2.4, 0.2]}
        intensity={0.38}
        color="#fff6e8"
      />
    </>
  )
}
