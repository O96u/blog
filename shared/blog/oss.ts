import { createHmac } from 'node:crypto'

export interface OssConfig {
  accessKeyId: string
  accessKeySecret: string
  bucket: string
  region: string
  publicBase: string
}

export function readOssConfig(env: NodeJS.ProcessEnv = process.env): OssConfig {
  const read = (key: string) => (env as Record<string, string | undefined>)[key] || ''
  const accessKeyId = read('IMAGE_OSS_ACCESS_KEY_ID')
  const accessKeySecret = read('IMAGE_OSS_ACCESS_KEY_SECRET')
  const bucket = read('IMAGE_OSS_BUCKET')
  const region = read('IMAGE_OSS_REGION')
  const publicBase = read('IMAGE_OSS_PUBLIC_BASE')
  const missing = [
    ['IMAGE_OSS_ACCESS_KEY_ID', accessKeyId],
    ['IMAGE_OSS_ACCESS_KEY_SECRET', accessKeySecret],
    ['IMAGE_OSS_BUCKET', bucket],
    ['IMAGE_OSS_REGION', region],
    ['IMAGE_OSS_PUBLIC_BASE', publicBase],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key)
  if (missing.length > 0) {
    throw new Error(`缺少图床配置：${missing.join(', ')}`)
  }
  if (!publicBase.startsWith('https://')) {
    throw new Error('IMAGE_OSS_PUBLIC_BASE 必须是 https 地址')
  }
  return { accessKeyId, accessKeySecret, bucket, region, publicBase: publicBase.replace(/\/$/, '') }
}

export function ossStringToSign(
  method: string,
  contentType: string,
  date: string,
  bucket: string,
  objectKey: string,
) {
  return [method, '', contentType, date, `/${bucket}/${objectKey}`].join('\n')
}

export function ossAuthorization(
  config: OssConfig,
  method: string,
  contentType: string,
  date: string,
  objectKey: string,
) {
  const signature = createHmac('sha1', config.accessKeySecret)
    .update(ossStringToSign(method, contentType, date, config.bucket, objectKey))
    .digest('base64')
  return `OSS ${config.accessKeyId}:${signature}`
}

export async function uploadToOss(
  config: OssConfig,
  objectKey: string,
  body: Uint8Array,
  contentType: string,
) {
  const date = new Date().toUTCString()
  const endpoint = `https://${config.bucket}.${config.region}.aliyuncs.com/${objectKey}`
  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      Date: date,
      'Content-Type': contentType,
      Authorization: ossAuthorization(config, 'PUT', contentType, date, objectKey),
    },
    body: body.slice(),
  })
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`OSS 上传失败 ${response.status}: ${detail.slice(0, 300)}`)
  }
  return `${config.publicBase}/${objectKey}`
}
