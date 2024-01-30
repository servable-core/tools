import importJSONAsync from "../../../lib/importJSONAsync.js"


export default async ({ path, cache, cacheKey }) => {
  try {
    // console.log("[Servable]", `importJSONDefault for path ${path}`)
    const data = await importJSONAsync(path)
    // console.log("[Servable]", `importJSONDefault for path ${path} successful`)
    return data
  } catch (e) {
    console.error("[Servable]", `importJSONDefault for path ${path}:`, e)
  }
  return null
}
