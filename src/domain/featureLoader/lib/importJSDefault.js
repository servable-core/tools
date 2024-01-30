

export default async ({ path, cache, cacheKey }) => {
  try {
    // console.log("[Servable]", `importJSDefault for path ${path}`)
    return (await import(path)).default
    // console.log("[Servable]", `importJSDefault for path ${path} successful`)
  } catch (e) {
    console.error("[Servable]", `importJSDefault for path ${path}:`, e)
  }
  return null
}
