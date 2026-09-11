import importJSONAsync from "../../../lib/importJSONAsync.js"


export default async ({ path, cache, cacheKey }) => {
  // importJSONAsync returns null (no throw) when the file simply doesn't exist - so anything
  // that reaches this catch is a file that DOES exist but failed to read/parse (e.g. invalid
  // JSON - a real incident: activitable's schema.json had a trailing comma that had silently
  // never parsed successfully in production, see .docs/technical/unischema-plan.md). Swallowing
  // that to `null` here made it indistinguishable from "this protocol has no schema.json at
  // all" to every caller (schemaRaw() et al.) - a broken schema.json silently produced a build
  // with that protocol's classes/fields/indexes just missing, no error anywhere but a buried
  // console line. Rethrow with the path instead, so `schema build`/`plan`/`apply` fails loudly
  // and names the exact file.
  try {
    return await importJSONAsync(path)
  } catch (e) {
    throw new Error(`Failed to parse ${path}: ${e.message}`)
  }
}
