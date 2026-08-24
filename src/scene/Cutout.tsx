import { useLayoutEffect } from "react"
import { useTexture } from "@react-three/drei"
import { SRGBColorSpace } from "three"
import { textureUrl } from "../lib/assets"

type CutoutProps = {
  url: string
  width: number
  height: number
}

export function Cutout({
  url,
  width,
  height,
}: CutoutProps) {
  const texture = useTexture(textureUrl(url))

  useLayoutEffect(() => {
    texture.colorSpace = SRGBColorSpace
    texture.needsUpdate = true
  }, [texture])

  return (
    <mesh>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        transparent
        alphaTest={0.12}
        depthWrite
        toneMapped={false}
      />
    </mesh>
  )
}
