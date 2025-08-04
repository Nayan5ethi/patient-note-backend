import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import logger from 'utils/logger'
import config from 'config'
import { getS3Client } from './client'

interface UploadParams {
  bucketName: string
  key: string
  body: Buffer | string
  contentType?: string
}

interface UploadResult {
  bucketName: string
  key: string
  url: string
}

export async function upload({ bucketName, key, body, contentType }: UploadParams): Promise<UploadResult> {
  try {
    const s3Client = getS3Client()
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
    await s3Client.send(command)

    // Generate S3 URL
    const url = `https://${bucketName}.s3.${config.AWS_REGION}.amazonaws.com/${key}`

    return {
      bucketName,
      key,
      url,
    }
  } catch (error) {
    logger.error('Error uploading to S3:', error)
    throw new Error('ERROR_UPLOADING_TO_S3')
  }
}

export async function download({ bucketName, key }: { bucketName: string; key: string }) {
  try {
    const s3Client = getS3Client()
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
    return await s3Client.send(command)
  } catch (error) {
    logger.error('Error downloading from S3:', error)
    throw new Error('ERROR_DOWNLOADING_FROM_S3')
  }
}
