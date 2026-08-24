export const pointer = {
  x: 0,
  y: 0,
  tx: 0,
  ty: 0,
}

export function attachPointer(target: HTMLElement): () => void {
  const onMove = (event: PointerEvent) => {
    const rect = target.getBoundingClientRect()
    const nx = (event.clientX - rect.left) / Math.max(rect.width, 1)
    const ny = (event.clientY - rect.top) / Math.max(rect.height, 1)
    pointer.tx = nx * 2 - 1
    pointer.ty = -(ny * 2 - 1)
  }

  const onLeave = () => {
    pointer.tx = 0
    pointer.ty = 0
  }

  target.addEventListener("pointermove", onMove)
  target.addEventListener("pointerleave", onLeave)
  return () => {
    target.removeEventListener("pointermove", onMove)
    target.removeEventListener("pointerleave", onLeave)
  }
}

export function dampPointer(delta: number) {
  const k = 1 - Math.exp(-4.2 * delta)
  pointer.x += (pointer.tx - pointer.x) * k
  pointer.y += (pointer.ty - pointer.y) * k
}
