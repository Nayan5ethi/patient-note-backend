import { Request, Response, NextFunction } from 'express'
import { notesService, GetNotesFilter } from '../services/notes.service'
import { NoteSource } from '@prisma/client'
import logger from 'utils/logger'

export const createManualNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, content, patientId } = req.body
    const doctorId = req.doctor?.id

    if (!doctorId) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Doctor ID not found in request',
      })
      return
    }

    const note = await notesService.createManualNote({
      title,
      content,
      doctorId,
      patientId,
    })

    res.status(201).json({
      success: true,
      data: note,
      message: 'Manual note created successfully',
    })
  } catch (error) {
    logger.error('Error creating manual note:', error)
    next(error)
  }
}

export const createFileNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, patientId } = req.body
    const file = req.file as Express.Multer.File
    const doctorId = req.doctor?.id

    if (!doctorId) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Doctor ID not found in request',
      })
      return
    }

    const result = await notesService.createFileNote({
      title,
      file,
      doctorId,
      patientId,
    })

    res.status(201).json({
      success: true,
      data: result,
      message: 'File uploaded successfully. OCR processing will be completed shortly.',
    })
  } catch (error) {
    logger.error('Error creating file note:', error)
    next(error)
  }
}

export const getNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { doctorId, patientId, source } = req.query

    const filter: GetNotesFilter = {}

    if (doctorId) {
      filter.doctorId = doctorId as string
    }

    if (patientId) {
      filter.patientId = patientId as string
    }

    if (source) {
      filter.source = source as NoteSource
    }

    const notes = await notesService.getNotes(filter)

    res.status(200).json({
      success: true,
      data: notes,
      count: notes.length,
    })
  } catch (error) {
    logger.error('Error fetching notes:', error)
    next(error)
  }
}

export const getNoteById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params

    const note = await notesService.getNoteById(id)

    if (!note) {
      res.status(404).json({
        error: 'Note not found',
      })
      return
    }

    res.status(200).json({
      success: true,
      data: note,
    })
  } catch (error) {
    logger.error('Error fetching note:', error)
    next(error)
  }
}

export const deleteNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params

    const deleted = await notesService.deleteNote(id)

    if (!deleted) {
      res.status(404).json({
        error: 'Note not found',
      })
      return
    }

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    })
  } catch (error) {
    logger.error('Error deleting note:', error)
    next(error)
  }
}

export const notesController = {
  createManualNote,
  createFileNote,
  getNotes,
  getNoteById,
  deleteNote,
}
