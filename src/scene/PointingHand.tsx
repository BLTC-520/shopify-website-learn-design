import { useControls } from "leva"
import { Cutout } from "./Cutout"
import { FloatGroup } from "./FloatGroup"
import { ScrollFade } from "./ScrollFade"

export function PointingHand() {
  const { x, y, z, scale } = useControls("hand", {
    x: { value: -1.38, min: -2.2, max: -0.2, step: 0.01 },
    y: { value: -0.78, min: -1.6, max: 0.2, step: 0.01 },
    z: { value: 0.72, min: 0.1, max: 1.5, step: 0.01 },
    scale: { value: 1.18, min: 0.5, max: 1.8, step: 0.01 },
  })

  return (
    <FloatGroup amp={0.008} speed={0.2} phase={2.2}>
      <ScrollFade>
        <group position={[x, y, z]} scale={scale}>
          <Cutout url="/textures/hand.png" width={1.12} height={0.84} />
        </group>
      </ScrollFade>
    </FloatGroup>
  )
}
