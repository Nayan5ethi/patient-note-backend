import { Request, Response, NextFunction } from 'express'
import { verifyToken, extractTokenFromHeader } from 'utils/jwt'
import { getDoctorById } from 'services/auth.service'
import logger from 'utils/logger'
import { UnauthorizedError } from 'errors/common'

export const authenticateToken = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      throw new Error('Authorization header is missing')
    }

    const token = extractTokenFromHeader(authHeader)
    const decoded = verifyToken(token)

    const doctor = await getDoctorById(decoded.doctorId)
    if (!doctor) {
      throw new Error('Doctor account not found')
    }

    req.doctor = doctor

    next()
  } catch (error) {
    logger.error('Authentication middleware error:', error)
    next(UnauthorizedError(error instanceof Error ? error.message : 'Authentication failed'))
  }
}
