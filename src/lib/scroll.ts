export const scroll = {
  target: 0,
  current: 0,
}

export const view = {
  narrow: false,
  cubeFit: 1,
  scatterFit: 1,
}

export function readScrollTarget() {
  const max = document.documentElement.scrollHeight - window.innerHeight
  return max > 0 ? window.scrollY / max : 0
}
