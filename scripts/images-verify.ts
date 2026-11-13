import { verifyImages } from '../shared/blog/image-store.ts'

const result = verifyImages(process.cwd())
console.log(`image verify passed: ${result.count} images, mode ${result.mode}`)
