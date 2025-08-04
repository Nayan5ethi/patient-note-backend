import { CaseNote, File, FileStatus, NoteSource, Prisma } from '@prisma/client'
import { prisma } from 'utils/prisma/client'
import { createWorker } from 'tesseract.js'
import { upload, download } from 'utils/aws/services'
import config from 'config'
import { v4 as uuidv4 } from 'uuid'
import logger from 'utils/logger'

export interface CreateManualNoteData {
  title: string
  content: string
  doctorId: string
  patientId: string
}

export interface CreateFileNoteData {
  title: string
  file: Express.Multer.File
  doctorId: string
  patientId: string
}

export interface GetNotesFilter {
  doctorId?: string
  patientId?: string
  source?: NoteSource
}

const streamToBuffer = async (stream: NodeJS.ReadableStream): Promise<Buffer> => {
  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

const processFileWithOCR = async (
  fileId: string,
  title: string,
  doctorId: string,
  patientId: string,
): Promise<void> => {
  try {
    let extractedText = ''

    const fileRecord = await prisma.file.findUnique({
      where: { id: fileId },
    })

    if (!fileRecord) {
      throw new Error('File record not found')
    }

    const { s3Key } = fileRecord

    if (!s3Key) {
      throw new Error('File S3 information not found')
    }

    const s3Object = await download({
      bucketName: config.AWS_S3_BUCKET_NAME,
      key: s3Key,
    })

    if (!s3Object.Body) {
      throw new Error('Failed to download file from S3')
    }

    const fileBuffer = await streamToBuffer(s3Object.Body as NodeJS.ReadableStream)
  
    const worker = await createWorker('eng')
    const {
      data: { text },
    } = await worker.recognize(fileBuffer)
    extractedText = text.trim()
    await worker.terminate()

    await prisma.file.update({
      where: { id: fileId },
      data: {
        scannedText: extractedText,
        status: FileStatus.SUCCESS,
      },
    })

    await prisma.caseNote.create({
      data: {
        title,
        content: extractedText,
        source: NoteSource.FILE_UPLOAD,
        doctorId,
        patientId,
        fileId,
      },
    })

    logger.info(`Successfully processed file ${fileId} and created note`)
  } catch (error) {
    logger.error('Error in OCR processing:', error)
    throw error
  }
}

export const createManualNote = async (data: CreateManualNoteData): Promise<CaseNote> => {
  const note = await prisma.caseNote.create({
    data: {
      title: data.title,
      content: data.content,
      source: NoteSource.MANUAL,
      doctorId: data.doctorId,
      patientId: data.patientId,
    },
    include: {
      doctor: true,
      patient: true,
    },
  })

  return note
}

export const createFileNote = async (data: CreateFileNoteData): Promise<{ file: File }> => {
  const originalName = data.file.originalname
  const fileExtension = originalName.substring(originalName.lastIndexOf('.'))
  const filename = `${uuidv4()}${fileExtension}`

  const s3Key = `patients/${data.patientId}/files/${filename}`

  const uploadResult = await upload({
    bucketName: config.AWS_S3_BUCKET_NAME,
    key: s3Key,
    body: data.file.buffer,
    contentType: data.file.mimetype,
  })

  const file = await prisma.file.create({
    data: {
      filename,
      originalName: data.file.originalname,
      s3Key: uploadResult.key,
      mimeType: data.file.mimetype,
      size: data.file.size,
      doctorId: data.doctorId,
      patientId: data.patientId,
    },
  })

  processFileWithOCR(file.id, data.title, data.doctorId, data.patientId).catch(async (error) => {
    await prisma.file.update({
      where: { id: file.id },
      data: { status: FileStatus.FAILED },
    })
    console.error('Error processing file:', error)
  })

  return { file }
}

export const getNotes = async (filter: GetNotesFilter = {}): Promise<CaseNote[]> => {
  const where: Prisma.CaseNoteWhereInput = {}

  if (filter.doctorId) {
    where.doctorId = filter.doctorId
  }

  if (filter.patientId) {
    where.patientId = filter.patientId
  }

  if (filter.source) {
    where.source = filter.source
  }

  const notes = await prisma.caseNote.findMany({
    where,
    include: {
      doctor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          nhs: true,
        },
      },
      file: {
        select: {
          id: true,
          originalName: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return notes
}

export const getNoteById = async (id: string): Promise<CaseNote | null> => {
  const note = await prisma.caseNote.findUnique({
    where: { id },
    include: {
      doctor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          nhs: true,
        },
      },
      file: {
        select: {
          id: true,
          originalName: true,
          scannedText: true,
          createdAt: true,
        },
      },
    },
  })

  return note
}

export const deleteNote = async (id: string): Promise<boolean> => {
  try {
    const note = await prisma.caseNote.findUnique({
      where: { id },
      include: { file: true },
    })

    if (!note) {
      return false
    }

    if (note.file) {
      await prisma.file.delete({
        where: { id: note.file.id },
      })
    }

    await prisma.caseNote.delete({
      where: { id },
    })

    return true
  } catch (error) {
    console.error('Error deleting note:', error)
    return false
  }
}

export const notesService = {
  createManualNote,
  createFileNote,
  getNotes,
  getNoteById,
  deleteNote,
}
