import { body } from 'express-validator'
import { commonValidator } from './common'

export const validateLogin = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isString()
    .withMessage('Password must be a string')
    .isLength({ min: 1 })
    .withMessage('Password cannot be empty'),

  commonValidator,
]

export const authValidator = {
  validateLogin,
}
