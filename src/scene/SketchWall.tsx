import { useTexture } from "@react-three/drei"
import { paperJourneys } from "../data/paperJourney"
import { sketchPanels } from "../data/panels"
import { CubeCore } from "./CubeCore"
import { SketchPanel } from "./SketchPanel"

export function SketchWall() {
  useTexture(sketchPanels.map((panel) => panel.texture))

  return (
    <group>
      <CubeCore />
      {paperJourneys.map((journey) => (
        <SketchPanel key={journey.id} journey={journey} />
      ))}
    </group>
  )
}
