import { Jimp } from 'jimp'

/**
 * @description Transforms a local image file into a data payload using Jimp
 * @param props {Object} - Configuration
 * @param props.path {string} - Path to file (used if `input` not given)
 * @param props.input {Buffer|string} - Buffer or path
 * @param props.width {number}
 * @param props.height {number}
 * @param props.maxWidth {number}
 * @param props.maxHeight {number}
 * @param props.quality {number}
 * @param props.mimeType {string}
 */
export default async (props) => {
  const {
    path,
    input,
    width = 600,
    height = 200,
    maxWidth = 2048,
    maxHeight = 1024,
    quality = 90,
    mimeType = Jimp.MIME_PNG
  } = props

  try {
    return null //#TODO
    const image = await Jimp.read(input || path)

    // Resize while preserving aspect ratio (fit: 'inside')
    const { width: origW, height: origH } = image.bitmap

    const ratio = Math.min(maxWidth / origW, maxHeight / origH)
    const newWidth = Math.round(origW * ratio)
    const newHeight = Math.round(origH * ratio)

    image.resize(newWidth, newHeight)

    // Apply quality (JPEG or WEBP only)
    if (mimeType === Jimp.MIME_JPEG || mimeType === Jimp.MIME_WEBP) {
      image.quality(quality)
    }

    // Get base64
    const base64 = await image.getBase64Async(mimeType)

    return { base64 }
  } catch (e) {
    console.error(e)
    return null
  }
}



// import sharp from 'sharp'

// /**
// * @description Transforms a local image file into a data payload
// * @param path Path to file
// */
// export default async (props) => {
//   const {
//     path,
//     input,
//     width = 600,
//     height = 200,
//     maxWidth = 2048,
//     maxHeight = 1024,
//     quality = 90,
//     mimeType
//   } = props

//   try {
//     const buffer = await sharp(input ? input : path)
//       // .resize(width, height, {
//       .resize(maxWidth, maxHeight, {
//         fit: 'inside',
//       })
//       .webp({ quality })
//       .toBuffer({ resolveWithObject: true })

//     if (!buffer || !buffer.data) {
//       return null
//     }

//     const data = { base64: `${buildPrefix(mimeType)},${buffer.data.toString("base64")}` }
//     return data
//   } catch (e) {
//     console.error(e)
//   }
//   return null
// }

// const buildPrefix = mimeType => {
//   return `data:${mimeType};base64`
// }

