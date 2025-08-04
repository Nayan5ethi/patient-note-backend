import { param, query } from 'express-validator'
import { commonValidator } from './common'

export const validateGetPatients = [
  query('search')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),

  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer'),

  commonValidator,
]

export const validatePatientId = [
  param('id').isString().trim().notEmpty().withMessage('Patient ID is required'),

  commonValidator,
]
