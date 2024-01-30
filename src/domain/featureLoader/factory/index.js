import getModule from "./getModule.js"

export const getByPathAndVersion = async ({ path, version }) => {
  const module = await getModule({ path, version })
  if (!module) {
    return null
  }
  return new module({ path, version })
}
