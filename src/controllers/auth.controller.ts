import { Request, Response } from 'express'
import { authService, LoginCredentials } from 'services/auth.service'
import logger from 'utils/logger'

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const credentials: LoginCredentials = req.body

    const result = await authService.loginDoctor(credentials)

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        doctor: result.doctor,
        token: result.token.token,
        expiresIn: result.token.expiresIn,
        expiresAt: new Date(Date.now() + result.token.expiresIn * 1000),
      },
    })
  } catch (error) {
    logger.error('Login controller error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Login failed'

    if (errorMessage.includes('Invalid email or password')) {
      res.status(401).json({
        error: 'Authentication failed',
        message: errorMessage,
      })
      return
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Login failed due to server error',
    })
  }
}

export const authController = {
  login,
}
