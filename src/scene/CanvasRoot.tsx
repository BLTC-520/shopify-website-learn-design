import { Suspense, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { PerspectiveCamera } from "three"
import { easeInOutCubic, lerp, smoothstep } from "../lib/math"
import { attachPointer } from "../lib/pointer"
import { readScrollTarget, scroll, view } from "../lib/scroll"
import {
  PHASE,
  assembleP,
  deepP,
  introBodyP,
  introHeadP,
  introScrimP,
  settleP,
} from "../lib/timeline"
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
      const root = document.documentElement.style
      root.setProperty("--hero-opacity", "1")
      root.setProperty("--hero-y", "0px")
      root.setProperty("--intro-scrim", "1")
      root.setProperty("--intro-h", "1")
      root.setProperty("--intro-hy", "0px")
      root.setProperty("--intro-p", "1")
      root.setProperty("--intro-py", "0px")
      return
    }
    scroll.target = readScrollTarget()
    const k = 1 - Math.exp(-7.5 * delta)
    scroll.current += (scroll.target - scroll.current) * k
    const p = scroll.current
    const fade = 1 - smoothstep(0.04, 0.22, assembleP(p))
    const head = introHeadP(p)
    const body = introBodyP(p)
    const scrim = introScrimP(p)
    const root = document.documentElement.style
    root.setProperty("--hero-opacity", fade.toFixed(4))
    root.setProperty("--hero-y", `${(1 - fade) * 42}px`)
    root.setProperty("--intro-scrim", scrim.toFixed(4))
    root.setProperty("--intro-h", head.toFixed(4))
    root.setProperty("--intro-hy", `${(1 - head) * 18}px`)
    root.setProperty("--intro-p", body.toFixed(4))
    root.setProperty("--intro-py", `${(1 - body) * 18}px`)
  })

  return null
}

function CameraDolly() {
  const camera = useThree((s) => s.camera)
  const reducedMotion = useExperience((s) => s.reducedMotion)

  useFrame((_, delta) => {
    if (reducedMotion || !(camera instanceof PerspectiveCamera)) return
    const p = scroll.current
    const a = assembleP(p)
    const diverge = smoothstep(0.05, 0.4, a)
    const converge = smoothstep(0.5, 0.9, a)
    const settle = settleP(p)
    const deep = easeInOutCubic(deepP(p))

    let z = view.narrow
      ? 4.35 + diverge * 0.75 + converge * 0.85
      : 4.15 + diverge * 1.05 - converge * 0.55
    let x = view.narrow ? lerp(-0.18, 0.02, converge) : lerp(-0.18, 0, converge)
    let y = view.narrow ? lerp(0.04, -0.18, converge) : lerp(0.04, 0.02, converge)
    let fov = view.narrow
      ? 36 + diverge * 4 - converge * 2
      : 34 + diverge * 6 - converge * 4

    const peel = easeInOutCubic(smoothstep(PHASE.settle, 0.6, p))
    const dive = easeInOutCubic(smoothstep(0.58, PHASE.enter, p))

    z -= settle * (view.narrow ? 0.08 : 0.12)
    z = lerp(z, view.narrow ? 3.15 : 3.35, peel)
    x = lerp(x, 0, peel)
    y = lerp(y, view.narrow ? -0.04 : 0.02, peel)
    fov = lerp(fov, view.narrow ? 34 : 30, peel)

    z = lerp(z, view.narrow ? 2.28 : 2.18, dive)
    x = lerp(x, 0, dive)
    y = lerp(y, view.narrow ? 0.02 : 0.04, dive)
    fov = lerp(fov, view.narrow ? 32 : 28, dive)

    z = lerp(z, view.narrow ? 1.72 : 1.58, deep)
    x = lerp(x, 0, deep)
    y = lerp(y, view.narrow ? 0.05 : 0.08, deep)
    fov = lerp(fov, view.narrow ? 31 : 26, deep)
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
