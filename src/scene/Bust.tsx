import { useControls } from "leva"
import { Cutout } from "./Cutout"
import { FloatGroup } from "./FloatGroup"
import { ScrollFade } from "./ScrollFade"

export function Bust() {
  const { x, y, z, scale } = useControls("bust", {
    x: { value: 1.48, min: 0.4, max: 2.4, step: 0.01 },
    y: { value: -0.08, min: -0.8, max: 0.9, step: 0.01 },
    z: { value: 0.32, min: -0.4, max: 1.2, step: 0.01 },
    scale: { value: 2.55, min: 0.8, max: 3.4, step: 0.01 },
  })

  return (
    <FloatGroup amp={0.01} speed={0.18} phase={0.4}>
      <ScrollFade>
        <group position={[x, y, z]} scale={scale}>
          <Cutout url="/textures/bust.png" width={0.78} height={1.04} />
        </group>
      </ScrollFade>
    </FloatGroup>
  )
}
