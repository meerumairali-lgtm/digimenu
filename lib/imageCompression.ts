'use client'

/**
 * Compresses and resizes an image in the browser, converting it to WebP.
 * Runs entirely client-side — no server cost, works before upload.
 *
 * @param file - Original image file selected by the user
 * @param maxDimension - Max width or height in pixels (scales down only, never up)
 * @param quality - WebP quality from 0 to 1 (0.8 is a good balance)
 */
export async function compressImage(
  file: File,
  maxDimension: number = 1200,
  quality: number = 0.8
): Promise<File> {
  try {
    const imageBitmap = await createImageBitmap(file)

    let { width, height } = imageBitmap
    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height / width) * maxDimension)
        width = maxDimension
      } else {
        width = Math.round((width / height) * maxDimension)
        height = maxDimension
      }
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file // fallback: upload original if canvas fails

    ctx.drawImage(imageBitmap, 0, 0, width, height)

    const blob: Blob | null = await new Promise(resolve =>
      canvas.toBlob(resolve, 'image/webp', quality)
    )

    if (!blob) return file // fallback: upload original if compression fails

    const newName = file.name.replace(/\.[^/.]+$/, '') + '.webp'
    return new File([blob], newName, { type: 'image/webp' })
  } catch (err) {
    console.error('Image compression failed, using original file:', err)
    return file
  }
}