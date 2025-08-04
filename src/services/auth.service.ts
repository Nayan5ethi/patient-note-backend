import { Doctor } from '@prisma/client'
import { prisma } from 'utils/prisma/client'
import bcrypt from 'bcryptjs'
import { generateToken, TokenData } from 'utils/jwt'
import logger from 'utils/logger'

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  doctor: Omit<Doctor, 'password'>
  token: TokenData
}

export interface AuthenticatedDoctor {
  id: string
  firstName: string
  lastName: string
  email: string
}

/**
 * Authenticate a doctor with email and password
 * @param credentials - Login credentials (email and password)
 * @returns Doctor information and JWT token if authentication successful
 */
export const loginDoctor = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const { email, password } = credentials

  try {
    // Find doctor by email
    const doctor = await prisma.doctor.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!doctor) {
      throw new Error('Invalid email or password')
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, doctor.password)
    if (!isPasswordValid) {
      throw new Error('Invalid email or password')
    }

    // Generate JWT token
    const tokenData = generateToken(doctor.id, doctor.email)

    // Return doctor info without password
    const { password: _, ...doctorWithoutPassword } = doctor

    logger.info(`Doctor ${doctor.email} logged in successfully`)

    return {
      doctor: doctorWithoutPassword,
      token: tokenData,
    }
  } catch (error) {
    logger.error('Login error:', error)
    throw error
  }
}

/**
 * Get doctor by ID for authentication purposes
 * @param doctorId - The doctor's ID
 * @returns Doctor information without password
 */
export const getDoctorById = async (doctorId: string): Promise<AuthenticatedDoctor | null> => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    })

    return doctor
  } catch (error) {
    logger.error('Error fetching doctor:', error)
    return null
  }
}

/**
 * Verify if a doctor exists and is valid
 * @param doctorId - The doctor's ID
 * @returns True if doctor exists, false otherwise
 */
export const verifyDoctorExists = async (doctorId: string): Promise<boolean> => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { id: true },
    })

    return !!doctor
  } catch (error) {
    logger.error('Error verifying doctor existence:', error)
    return false
  }
}

export const authService = {
  loginDoctor,
  getDoctorById,
  verifyDoctorExists,
}
