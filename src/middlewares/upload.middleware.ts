import { CustomError } from 'errors'
import { Request } from 'express'
import multer from 'multer'
import logger from 'utils/logger'

export const fileParserMiddleware = ({
  fileSize,
  acceptFileTypes,
}: {
  fileSize: number
  acceptFileTypes?: string[]
}) =>
  multer({
    fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      if (!acceptFileTypes) {
        return cb(null, true)
      }
      if (!acceptFileTypes.includes(file.mimetype)) {
        logger.error(`[fileParserMiddleware]: Invalid file type: ${file.mimetype}`)
        return cb(new CustomError(`Invalid file type ${file.originalname}`, 400, 'INVALID_FILE_TYPE'))
      }
      return cb(null, true)
    },
    limits: {
      fileSize,
    },
  }).single('file')
