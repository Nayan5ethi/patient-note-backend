import { S3Client } from '@aws-sdk/client-s3'
import config from 'config'

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION: region } = config

export class S3ClientSingleton {
  private static instance: S3ClientSingleton
  private readonly client: S3Client

  private constructor() {
    this.client = new S3Client({
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID ?? '',
        secretAccessKey: AWS_SECRET_ACCESS_KEY ?? '',
      },
      region,
    })
  }

  public static getInstance(): S3ClientSingleton {
    if (!S3ClientSingleton.instance) {
      S3ClientSingleton.instance = new S3ClientSingleton()
    }
    return S3ClientSingleton.instance
  }

  public getClient(): S3Client {
    return this.client
  }
}

export const getS3Client = (): S3Client => {
  return S3ClientSingleton.getInstance().getClient()
}
