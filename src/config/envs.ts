const environmentVariables = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  LOG_SQL: process.env.LOG_SQL,
  PORT: process.env.PORT ?? 8057,
  DATABASE_URL: process.env.DATABASE_URL,

  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION,
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME ?? 'patient-notes-files',

  JWT_SECRET: process.env.JWT_SECRET ?? 'your-secret-key-change-in-production',
}

export default environmentVariables
