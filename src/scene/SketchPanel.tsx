import { useLayoutEffect, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useTexture } from "@react-three/drei"
import {
  Mesh,
  Quaternion,
  SRGBColorSpace,
  Vector3,
  type Group,
  type MeshStandardMaterial,
} from "three"
import { PALAZZO_DOOR, type PaperJourney } from "../data/paperJourney"
import { textureUrl } from "../lib/assets"
import { easeInOutCubic, easeOutBack, lerp, smoothstep } from "../lib/math"
import { scroll, view } from "../lib/scroll"
import { assembleP, cubeSpinY, deepP, enterP } from "../lib/timeline"
import { useExperience } from "../store/experience"

const Y_AXIS = new Vector3(0, 1, 0)

function createPose(journey: PaperJourney) {
  return {
    restPos: new Vector3().fromArray(journey.rest.position),
    scatterPos: new Vector3().fromArray(journey.scatter.position),
    cubePos: new Vector3().fromArray(journey.cube.position),
    folioPos: new Vector3().fromArray(journey.folio.position),
    restQ: new Quaternion().fromArray(journey.rest.quaternion),
    scatterQ: new Quaternion().fromArray(journey.scatter.quaternion),
    cubeQ: new Quaternion().fromArray(journey.cube.quaternion),
    folioQ: new Quaternion().fromArray(journey.folio.quaternion),
    q: new Quaternion(),
    spinQ: new Quaternion(),
    cubeWorldQ: new Quaternion(),
    cubeWorldPos: new Vector3(),
    folioWorld: new Vector3(),
    pos: new Vector3(),
  }
}

function applyOpacity(group: Group, opacity: number) {
  const transparent = opacity < 0.985
  group.traverse((obj) => {
    if (!(obj instanceof Mesh) || obj.userData.portal) return
    const mat = obj.material as MeshStandardMaterial
    if (!mat || Array.isArray(mat)) return
    if (mat.transparent !== transparent) {
      mat.transparent = transparent
      mat.needsUpdate = true
    }
    mat.opacity = opacity
    mat.depthWrite = opacity > 0.35
  })
}

export function SketchPanel({ journey }: { journey: PaperJourney }) {
  const { config } = journey
  const texture = useTexture(textureUrl(config.texture))
  const doorMask = useTexture(textureUrl("/textures/sketches/gen-04-doors.png"))
  const [w, h] = config.size
  const root = useRef<Group>(null)
  const floater = useRef<Group>(null)
  const edge = useRef<Mesh>(null)
  const front = useRef<Mesh>(null)
  const back = useRef<Mesh>(null)
  const pose = useRef(createPose(journey))
  const holesOn = useRef(false)
  const reducedMotion = useExperience((s) => s.reducedMotion)

  useLayoutEffect(() => {
    texture.colorSpace = SRGBColorSpace
    texture.anisotropy = 8
    texture.needsUpdate = true
    doorMask.colorSpace = SRGBColorSpace
    doorMask.anisotropy = 4
    doorMask.needsUpdate = true
  }, [texture, doorMask])

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

    const raw = scroll.current
    const p = assembleP(raw)
    const delay = journey.delay
    const role = journey.folioRole
    const diverge = smoothstep(0.05 + delay, 0.38 + delay, p)
    const orient = smoothstep(0.46 + delay * 0.4, 0.66 + delay * 0.4, p)
    const converge = smoothstep(0.54 + delay * 0.45, 0.9 + delay * 0.4, p)
    const divergeE = easeOutBack(diverge)
    const convergeE = easeInOutCubic(converge)
    const orientE = easeInOutCubic(Math.max(orient, converge))
    const enter = enterP(raw)
    const enterE = easeInOutCubic(enter)
    const deep = deepP(raw)
    const deepE = easeInOutCubic(deep)
    const spin = cubeSpinY(raw)
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

    let sx = lerp(
      lerp(1, journey.scatter.scale[0], diverge),
      journey.cube.scale[0] * view.cubeFit,
      convergeE,
    )
    let sy = lerp(
      lerp(1, journey.scatter.scale[1], diverge),
      journey.cube.scale[1] * view.cubeFit,
      convergeE,
    )

    if (enterE > 0) {
      const mainFit = view.narrow ? 1.55 : 1.18
      scratch.folioWorld.copy(scratch.folioPos)
      if (role === "main") {
        scratch.folioWorld.z -= deepE * 0.08
      } else {
        scratch.folioWorld.multiplyScalar(view.cubeFit)
      }

      const zoomMul = role === "main" ? 1 + deepE * (view.narrow ? 1.65 : 2.1) : 1
      const fit = role === "main" ? mainFit : view.cubeFit
      sx = lerp(sx, journey.folio.scale[0] * fit * zoomMul, enterE)
      sy = lerp(sy, journey.folio.scale[1] * fit * zoomMul, enterE)

      if (role === "main") {
        const lookV = lerp(0.42, PALAZZO_DOOR.vFromTop, Math.min(1, enterE * 0.25 + deepE))
        const lookLocalY = (1 - lookV - 0.5) * h
        scratch.folioWorld.y = -lookLocalY * sy
        scratch.folioWorld.x = 0
      }

      scratch.pos.lerp(scratch.folioWorld, enterE)
      scratch.q.slerp(scratch.folioQ, enterE)
    }

    group.position.copy(scratch.pos)
    group.quaternion.copy(scratch.q)
    group.scale.set(sx, sy, 1)

    let opacity = 1
    if (role === "fade") {
      const slow = journey.id === "p01" || journey.id === "p07"
      opacity = 1 - easeInOutCubic(smoothstep(slow ? 0.12 : 0, slow ? 0.62 : 0.22, enter))
    } else if (role === "main") {
      opacity = 1
    }
    group.visible = opacity > 0.02
    applyOpacity(group, opacity)
    if (edge.current) edge.current.visible = !(role === "main" && enter > 0.1)
    if (back.current) back.current.visible = !(role === "main" && enter > 0.1)

    if (role === "main" && front.current) {
      const frontMat = front.current.material as MeshStandardMaterial
      const open = smoothstep(0.18, 0.48, enter) > 0.5
      if (open !== holesOn.current) {
        holesOn.current = open
        frontMat.alphaMap = open ? doorMask : null
        frontMat.alphaTest = open ? 0.4 : 0
        frontMat.needsUpdate = true
      }
    }

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
      renderOrder={journey.folioRole === "main" ? 2 : 0}
    >
      <group ref={floater}>
        <mesh ref={edge}>
          <boxGeometry args={[w, h, config.thickness]} />
          <meshStandardMaterial color="#c9c4b0" roughness={0.92} metalness={0} />
        </mesh>
        <mesh ref={front} position={[0, 0, config.thickness * 0.5 + 0.001]}>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial
            map={texture}
            roughness={0.86}
            metalness={0}
            color="#f4efe4"
          />
        </mesh>
        <mesh
          ref={back}
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
        {journey.folioRole === "main" ? (
          <>
            <mesh
              userData={{ portal: true }}
              position={[0, 0, -1.15]}
              renderOrder={-1}
            >
              <planeGeometry args={[w, h]} />
              <meshStandardMaterial
                map={texture}
                alphaMap={doorMask}
                alphaTest={0.4}
                roughness={0.9}
                metalness={0}
                color="#eadcc8"
              />
            </mesh>
            <mesh
              userData={{ portal: true }}
              position={[0, 0, -2.15]}
              renderOrder={-2}
            >
              <planeGeometry args={[w, h]} />
              <meshStandardMaterial
                map={texture}
                roughness={0.92}
                metalness={0}
                color="#d8cbb8"
              />
            </mesh>
          </>
        ) : null}
      </group>
    </group>
  )
}
