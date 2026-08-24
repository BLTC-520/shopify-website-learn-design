import { useControls } from "leva"
import { Cutout } from "./Cutout"
import { FloatGroup } from "./FloatGroup"
import { ScrollFade } from "./ScrollFade"

export function Engine() {
  const { x, y, z, scale } = useControls("engine", {
    x: { value: -0.08, min: -1.4, max: 0.8, step: 0.01 },
    y: { value: 0.22, min: -1.0, max: 0.8, step: 0.01 },
    z: { value: 0.58, min: 0.1, max: 1.4, step: 0.01 },
    scale: { value: 1.02, min: 0.5, max: 2.0, step: 0.01 },
  })

  return (
    <FloatGroup amp={0.012} speed={0.23} phase={1.6}>
      <ScrollFade>
        <group position={[x, y, z]} scale={scale}>
          <Cutout url="/textures/engine.png" width={0.72} height={0.96} />
        </group>
      </ScrollFade>
    </FloatGroup>
  )
}
