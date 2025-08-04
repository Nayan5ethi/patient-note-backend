import jwt from 'jsonwebtoken'
import config from 'config'
import logger from './logger'

export interface JwtPayload {
  doctorId: string
  email: string
  iat?: number
  exp?: number
}

export interface TokenData {
  token: string
  expiresIn: number
}

export const generateToken = (doctorId: string, email: string): TokenData => {
  try {
    const expiresIn = 7 * 24 * 60 * 60
    const payload: JwtPayload = {
      doctorId,
      email,
    }

    const token = jwt.sign(payload, config.JWT_SECRET, {
      expiresIn,
    })

    return {
      token,
      expiresIn,
    }
  } catch (error) {
    logger.error('Error generating JWT token:', error)
    throw new Error('Failed to generate token')
  }
}

export const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload
    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired')
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token')
    } else {
      logger.error('Error verifying JWT token:', error)
      throw new Error('Token verification failed')
    }
  }
}

export const extractTokenFromHeader = (authHeader: string): string => {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Invalid authorization header format')
  }
  return authHeader.substring(7)
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as JwtPayload
    if (!decoded?.exp) {
      return true
    }
    return Date.now() >= decoded.exp * 1000
  } catch (error) {
    logger.error('Error checking token expiration:', error)
    return true
  }
}

export const getTokenExpirationDate = (token: string): Date | null => {
  try {
    const decoded = jwt.decode(token) as JwtPayload
    if (!decoded?.exp) {
      return null
    }
    return new Date(decoded.exp * 1000)
  } catch (error) {
    logger.error('Error getting token expiration date:', error)
    return null
  }
}

export const jwtUtils = {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  isTokenExpired,
  getTokenExpirationDate,
}
