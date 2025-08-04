import { body, param, query } from 'express-validator'
import { NoteSource } from '@prisma/client'
import { commonValidator } from './common'

export const validateCreateManualNote = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .withMessage('Title must be a string')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters')
    .trim(),

  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isString()
    .withMessage('Content must be a string')
    .isLength({ min: 1, max: 10000 })
    .withMessage('Content must be between 1 and 10000 characters')
    .trim(),

  body('patientId')
    .notEmpty()
    .withMessage('Patient ID is required')
    .isString()
    .withMessage('Patient ID must be a string')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Patient ID must be a valid identifier'),

  commonValidator,
]

export const validateCreateFileNote = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .withMessage('Title must be a string')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters')
    .trim(),

  body('patientId')
    .notEmpty()
    .withMessage('Patient ID is required')
    .isString()
    .withMessage('Patient ID must be a string')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Patient ID must be a valid identifier'),

  commonValidator,
]

export const validateGetNotes = [
  query('doctorId')
    .optional()
    .isString()
    .withMessage('Doctor ID must be a string')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Doctor ID must be a valid identifier'),

  query('patientId')
    .optional()
    .isString()
    .withMessage('Patient ID must be a string')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Patient ID must be a valid identifier'),

  query('source')
    .optional()
    .isIn(Object.values(NoteSource))
    .withMessage(`Source must be one of: ${Object.values(NoteSource).join(', ')}`),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100'),

  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer'),

  commonValidator,
]

export const validateNoteId = [
  param('id')
    .notEmpty()
    .withMessage('Note ID is required')
    .isString()
    .withMessage('Note ID must be a string')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Note ID must be a valid identifier'),

  commonValidator,
]

export const validateFileId = [
  param('fileId')
    .notEmpty()
    .withMessage('File ID is required')
    .isString()
    .withMessage('File ID must be a string')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('File ID must be a valid identifier'),

  commonValidator,
]

export const validatePatientId = [
  param('patientId')
    .notEmpty()
    .withMessage('Patient ID is required')
    .isString()
    .withMessage('Patient ID must be a string')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Patient ID must be a valid identifier'),

  commonValidator,
]
