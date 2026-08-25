import { useTexture } from "@react-three/drei"
import { paperJourneys } from "../data/paperJourney"
import { sketchPanels } from "../data/panels"
import { textureUrl } from "../lib/assets"
import { CubeCore } from "./CubeCore"
import { SketchPanel } from "./SketchPanel"

export function SketchWall() {
  useTexture([
    ...sketchPanels.map((panel) => textureUrl(panel.texture)),
    textureUrl("/textures/sketches/gen-04-doors.png"),
  ])

  return (
    <group>
      <CubeCore />
      {paperJourneys.map((journey) => (
        <SketchPanel key={journey.id} journey={journey} />
      ))}
    </group>
  )
}
