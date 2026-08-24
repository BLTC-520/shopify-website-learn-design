import { useLayoutEffect, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useTexture } from "@react-three/drei"
import { Quaternion, SRGBColorSpace, Vector3, type Group } from "three"
import type { PaperJourney } from "../data/paperJourney"
import { easeInOutCubic, easeOutBack, lerp, smoothstep } from "../lib/math"
import { scroll, view } from "../lib/scroll"
import { useExperience } from "../store/experience"

const Y_AXIS = new Vector3(0, 1, 0)

function createPose(journey: PaperJourney) {
  return {
    restPos: new Vector3().fromArray(journey.rest.position),
    scatterPos: new Vector3().fromArray(journey.scatter.position),
    cubePos: new Vector3().fromArray(journey.cube.position),
    restQ: new Quaternion().fromArray(journey.rest.quaternion),
    scatterQ: new Quaternion().fromArray(journey.scatter.quaternion),
    cubeQ: new Quaternion().fromArray(journey.cube.quaternion),
    q: new Quaternion(),
    spinQ: new Quaternion(),
    cubeWorldQ: new Quaternion(),
    cubeWorldPos: new Vector3(),
    pos: new Vector3(),
  }
}

export function SketchPanel({ journey }: { journey: PaperJourney }) {
  const { config } = journey
  const texture = useTexture(config.texture)
  const [w, h] = config.size
  const root = useRef<Group>(null)
  const floater = useRef<Group>(null)
  const pose = useRef(createPose(journey))
  const reducedMotion = useExperience((s) => s.reducedMotion)

  useLayoutEffect(() => {
    texture.colorSpace = SRGBColorSpace
    texture.anisotropy = 4
    texture.needsUpdate = true
  }, [texture])

  useFrame(({ clock }) => {
    const group = root.current
    const floatGroup = floater.current
    if (!group || !floatGroup) return

    if (reducedMotion) {
      group.position.copy(pose.current.restPos)
      group.quaternion.copy(pose.current.restQ)
      group.scale.set(1, 1, 1)
      floatGroup.position.y = 0
      floatGroup.rotation.z = 0
      return
    }

    const p = scroll.current
    const delay = journey.delay
    const diverge = smoothstep(0.05 + delay, 0.38 + delay, p)
    const orient = smoothstep(0.46 + delay * 0.4, 0.66 + delay * 0.4, p)
    const converge = smoothstep(0.54 + delay * 0.45, 0.9 + delay * 0.4, p)
    const divergeE = easeOutBack(diverge)
    const convergeE = easeInOutCubic(converge)
    const orientE = easeInOutCubic(Math.max(orient, converge))
    const spin = smoothstep(0.7, 1, p) * Math.PI * 1.18
    const scratch = pose.current

    scratch.spinQ.setFromAxisAngle(Y_AXIS, spin)
    scratch.cubeWorldPos
      .copy(scratch.cubePos)
      .multiplyScalar(view.cubeFit)
      .applyQuaternion(scratch.spinQ)
    scratch.cubeWorldQ.multiplyQuaternions(scratch.spinQ, scratch.cubeQ)

    const scatterFit = view.scatterFit
    scratch.pos.set(
      lerp(scratch.restPos.x, scratch.scatterPos.x * scatterFit, divergeE),
      lerp(scratch.restPos.y, scratch.scatterPos.y * scatterFit, divergeE),
      lerp(scratch.restPos.z, scratch.scatterPos.z * (scatterFit * 0.7 + 0.3), divergeE),
    )
    scratch.pos.lerp(scratch.cubeWorldPos, convergeE)
    scratch.pos.y += Math.sin(convergeE * Math.PI) * (view.narrow ? 0.16 : 0.32)

    scratch.q.slerpQuaternions(scratch.restQ, scratch.scatterQ, Math.min(diverge, 1))
    scratch.q.slerp(scratch.cubeWorldQ, orientE)

    const sx = lerp(
      lerp(1, journey.scatter.scale[0], diverge),
      journey.cube.scale[0] * view.cubeFit,
      convergeE,
    )
    const sy = lerp(
      lerp(1, journey.scatter.scale[1], diverge),
      journey.cube.scale[1] * view.cubeFit,
      convergeE,
    )

    group.position.copy(scratch.pos)
    group.quaternion.copy(scratch.q)
    group.scale.set(sx, sy, 1)

    const floatMul = 1 - diverge
    const t = clock.elapsedTime * config.floatSpeed + config.floatPhase
    floatGroup.position.y = Math.sin(t) * config.floatAmp * floatMul
    floatGroup.rotation.z = Math.sin(t * 0.65) * config.floatAmp * 0.35 * floatMul
  })

  return (
    <group
      ref={root}
      position={journey.rest.position}
      quaternion={journey.rest.quaternion}
    >
      <group ref={floater}>
        <mesh>
          <boxGeometry args={[w, h, config.thickness]} />
          <meshStandardMaterial color="#c9c4b0" roughness={0.92} metalness={0} />
        </mesh>
        <mesh position={[0, 0, config.thickness * 0.5 + 0.001]}>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial
            map={texture}
            roughness={0.86}
            metalness={0}
            color="#f4efe4"
          />
        </mesh>
        <mesh
          position={[0, 0, -config.thickness * 0.5 - 0.001]}
          rotation={[0, Math.PI, 0]}
        >
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial
            map={texture}
            roughness={0.9}
            metalness={0}
            color="#e6dcc8"
          />
        </mesh>
      </group>
    </group>
  )
}
