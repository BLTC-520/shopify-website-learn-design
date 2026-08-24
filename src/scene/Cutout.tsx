import { useLayoutEffect } from "react"
import { useTexture } from "@react-three/drei"
import { SRGBColorSpace } from "three"

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
  const texture = useTexture(url)

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
