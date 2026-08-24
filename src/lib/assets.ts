const GH_PUBLIC =
  "https://raw.githubusercontent.com/BLTC-520/shopify-website-learn-design/main/public"

export function textureUrl(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`
  if (!import.meta.env.PROD) return p
  return `${GH_PUBLIC}${p}`
}
