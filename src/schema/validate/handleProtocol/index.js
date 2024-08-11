import computeVersions from './computeVersions.js'

export default async ({ protocol }) => {
  return computeVersions({ protocol })
}
