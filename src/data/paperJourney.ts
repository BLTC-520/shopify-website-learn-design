import { Euler, Quaternion, Vector3 } from "three"
import { sketchPanels, type SketchPanelConfig } from "./panels"

export const CUBE_EDGE = 1.34
export const CUBE_HALF = CUBE_EDGE * 0.5
export const PALAZZO_ID = "p13"
export const PALAZZO_DOOR = { u: 0.5, vFromTop: 0.642 }
const WALL: [number, number, number] = [-0.28, 0.18, 0]

const FACE_ROT: [number, number, number][] = [
  [0, 0, 0],
  [0, Math.PI, 0],
  [0, Math.PI / 2, 0],
  [0, -Math.PI / 2, 0],
  [-Math.PI / 2, 0, 0],
  [Math.PI / 2, 0, 0],
]

const FACE_DIR: [number, number, number][] = [
  [0, 0, 1],
  [0, 0, -1],
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
]

export type PaperPose = {
  position: [number, number, number]
  quaternion: [number, number, number, number]
  scale: [number, number, number]
}

export type FolioRole = "main" | "leaf" | "fade"

export type PaperJourney = {
  id: string
  config: SketchPanelConfig
  rest: PaperPose
  scatter: PaperPose
  cube: PaperPose
  folio: PaperPose
  folioRole: FolioRole
  delay: number
}

const _euler = new Euler()
const _twist = new Quaternion()
const _z = new Vector3(0, 0, 1)

function quatFromEuler(
  rot: [number, number, number],
  twist = 0,
): [number, number, number, number] {
  _euler.set(rot[0], rot[1], rot[2], "XYZ")
  const q = new Quaternion().setFromEuler(_euler)
  if (twist !== 0) {
    _twist.setFromAxisAngle(_z, twist)
    q.multiply(_twist)
  }
  return [q.x, q.y, q.z, q.w]
}

function hash(n: number) {
  const s = Math.sin(n * 45.7182) * 43758.5453
  return s - Math.floor(s)
}

export const paperJourneys: PaperJourney[] = sketchPanels.map((config, i) => {
  const restPos: [number, number, number] = [
    config.position[0] + WALL[0],
    config.position[1] + WALL[1],
    config.position[2] + WALL[2],
  ]

  const h1 = hash(i + 1.7)
  const h2 = hash(i + 4.2)
  const h3 = hash(i + 8.9)
  const h4 = hash(i + 13.3)
  const h5 = hash(i + 21.8)

  const centroid = [-0.55, 0.22, -0.18]
  let dx = restPos[0] - centroid[0]
  let dy = restPos[1] - centroid[1]
  let dz = restPos[2] - centroid[2]
  const len = Math.hypot(dx, dy, dz) || 1
  dx /= len
  dy /= len
  dz /= len

  const dist = 1.32 + h1 * 1.18
  const sx = Math.min(2.55, Math.max(-2.55, restPos[0] + dx * dist + (h2 - 0.5) * 0.95))
  const sy = Math.min(1.65, Math.max(-1.65, restPos[1] + dy * dist + (h3 - 0.5) * 1.05))
  const sz = Math.min(1.15, Math.max(-1.55, restPos[2] + dz * dist + (h4 - 0.5) * 1.35))

  const scatterRot: [number, number, number] = [
    config.rotation[0] + (h2 - 0.5) * 2.5,
    config.rotation[1] + (h3 - 0.5) * 3.2,
    config.rotation[2] + (h4 - 0.5) * 1.9,
  ]

  const face = i % 6
  const layer = Math.floor(i / 6)
  const dir = FACE_DIR[face]
  const layerGap = layer === 0 ? 0 : layer === 1 ? 0.034 : 0.052
  const cubePos: [number, number, number] = [
    dir[0] * (CUBE_HALF + layerGap),
    dir[1] * (CUBE_HALF + layerGap),
    dir[2] * (CUBE_HALF + layerGap),
  ]
  const twist = layer === 0 ? 0 : (h5 - 0.5) * (layer === 1 ? 0.12 : 0.26)

  const [w, h] = config.size
  let cubeScale: [number, number, number]
  if (layer === 0) {
    cubeScale = [CUBE_EDGE / w, CUBE_EDGE / h, 1]
  } else {
    const decal = layer === 1 ? 0.78 : 0.52
    const s = (CUBE_EDGE * decal) / Math.max(w, h)
    cubeScale = [s, s, 1]
  }

  let folioRole: FolioRole
  let folioPos: [number, number, number]
  let folioRot: [number, number, number]
  let folioScale: [number, number, number]
  if (config.id === "p13") {
    folioRole = "main"
    folioPos = [0, 0.05, CUBE_HALF + 0.02]
    folioRot = [0, 0, 0]
    const s = (CUBE_EDGE * 1.42) / Math.max(w, h)
    folioScale = [s, s, 1]
  } else {
    folioRole = "fade"
    folioPos = [cubePos[0] * 2.35, cubePos[1] * 2.35, cubePos[2] * 2.2 - 0.5]
    folioRot = FACE_ROT[face]
    folioScale = [cubeScale[0] * 0.38, cubeScale[1] * 0.38, 1]
  }

  return {
    id: config.id,
    config,
    rest: {
      position: restPos,
      quaternion: quatFromEuler(config.rotation),
      scale: [1, 1, 1],
    },
    scatter: {
      position: [sx, sy, sz],
      quaternion: quatFromEuler(scatterRot),
      scale: [0.9, 0.9, 1],
    },
    cube: {
      position: cubePos,
      quaternion: quatFromEuler(FACE_ROT[face], twist),
      scale: cubeScale,
    },
    folio: {
      position: folioPos,
      quaternion: quatFromEuler(folioRot),
      scale: folioScale,
    },
    folioRole,
    delay: i * 0.01,
  }
})
