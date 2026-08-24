import { Suspense, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { PerspectiveCamera } from "three"
import { lerp, smoothstep } from "../lib/math"
import { attachPointer } from "../lib/pointer"
import { readScrollTarget, scroll, view } from "../lib/scroll"
import { useExperience } from "../store/experience"
import { Bust } from "./Bust"
import { CameraRig } from "./CameraRig"
import { Engine } from "./Engine"
import { Lights } from "./Lights"
import { PaperGround } from "./PaperGround"
import { PointingHand } from "./PointingHand"
import { SketchWall } from "./SketchWall"

export function CanvasRoot() {
  return (
    <div className="canvas-root">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        camera={{ position: [-0.18, 0.04, 4.15], fov: 34, near: 0.1, far: 40 }}
        onCreated={({ gl }) => {
          gl.setClearColor("#dcdcd0", 1)
        }}
      >
        <PointerBinder />
        <ScrollSampler />
        <CameraDolly />
        <Suspense fallback={null}>
          <Lights />
          <CameraRig>
            <PaperGround />
            <SketchWall />
            <Engine />
            <Bust />
            <PointingHand />
          </CameraRig>
        </Suspense>
      </Canvas>
    </div>
  )
}

function PointerBinder() {
  const gl = useThree((state) => state.gl)

  useEffect(() => attachPointer(gl.domElement), [gl])

  return null
}

function ScrollSampler() {
  const reducedMotion = useExperience((s) => s.reducedMotion)
  const width = useThree((s) => s.size.width)

  useFrame((_, delta) => {
    view.narrow = width < 700
    view.cubeFit = view.narrow ? 0.54 : 1
    view.scatterFit = view.narrow ? 0.58 : 1
    if (reducedMotion) {
      scroll.target = 0
      scroll.current = 0
      document.documentElement.style.setProperty("--hero-opacity", "1")
      document.documentElement.style.setProperty("--hero-y", "0px")
      return
    }
    scroll.target = readScrollTarget()
    const k = 1 - Math.exp(-7.5 * delta)
    scroll.current += (scroll.target - scroll.current) * k
    const fade = 1 - smoothstep(0.04, 0.22, scroll.current)
    document.documentElement.style.setProperty("--hero-opacity", fade.toFixed(4))
    document.documentElement.style.setProperty("--hero-y", `${(1 - fade) * 42}px`)
  })

  return null
}

function CameraDolly() {
  const camera = useThree((s) => s.camera)
  const reducedMotion = useExperience((s) => s.reducedMotion)

  useFrame((_, delta) => {
    if (reducedMotion || !(camera instanceof PerspectiveCamera)) return
    const p = scroll.current
    const diverge = smoothstep(0.05, 0.4, p)
    const converge = smoothstep(0.5, 0.9, p)
    const z = view.narrow
      ? 4.35 + diverge * 0.75 + converge * 0.85
      : 4.15 + diverge * 1.05 - converge * 0.55
    const x = view.narrow ? lerp(-0.18, 0.02, converge) : lerp(-0.18, 0, converge)
    const y = view.narrow ? lerp(0.04, -0.18, converge) : lerp(0.04, 0.02, converge)
    const fov = view.narrow
      ? 36 + diverge * 4 - converge * 2
      : 34 + diverge * 6 - converge * 4
    const k = 1 - Math.exp(-3.2 * delta)
    camera.position.x += (x - camera.position.x) * k
    camera.position.y += (y - camera.position.y) * k
    camera.position.z += (z - camera.position.z) * k
    const nextFov = camera.fov + (fov - camera.fov) * k
    if (Math.abs(nextFov - camera.fov) > 0.01) {
      camera.fov = nextFov
      camera.updateProjectionMatrix()
    }
  })

  return null
}
