import { Router } from 'express'
import {
  createManualNote,
  createFileNote,
  getNotes,
  getNoteById,
  deleteNote,
} from '../controllers/notes.controller'
import { fileParserMiddleware } from '../middlewares/upload.middleware'
import { authenticateToken } from '../middlewares/auth.middleware'
import {
  validateCreateManualNote,
  validateCreateFileNote,
  validateGetNotes,
  validateNoteId,
} from '../middlewares/validator/notes.validator'

const router = Router()

router.use(authenticateToken)

router.post('/manual', validateCreateManualNote, createManualNote)
router.post(
  '/upload',
  fileParserMiddleware({
    fileSize: 5 * 1024 * 1024,
    acceptFileTypes: ['image/jpeg', 'image/png'],
  }),
  validateCreateFileNote,
  createFileNote,
)
router.get('/', validateGetNotes, getNotes)
router.get('/:id', validateNoteId, getNoteById)
router.delete('/:id', validateNoteId, deleteNote)

export default router
