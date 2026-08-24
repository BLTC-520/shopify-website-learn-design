export function PaperGround() {
  return (
    <mesh position={[0, 0, -2.4]} scale={[12, 8, 1]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <meshBasicMaterial color="#dcdcd0" />
    </mesh>
  )
}
