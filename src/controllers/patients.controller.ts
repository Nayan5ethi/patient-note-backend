import { Request, Response, NextFunction } from 'express'
import {
  getPatients as getPatientsService,
  getPatientById as getPatientByIdService,
  GetPatientsFilter,
} from '../services/patients.service'
import logger from 'utils/logger'

export const getPatients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, limit, offset } = req.query

    const filter: GetPatientsFilter = {
      search: search as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    }

    const result = await getPatientsService(filter)

    res.status(200).json({
      success: true,
      data: result.patients,
      pagination: result.pagination,
      message: 'Patients retrieved successfully',
    })
  } catch (error) {
    logger.error('Error getting patients:', error)
    next(error)
  }
}

export const getPatientById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params

    const patient = await getPatientByIdService(id)

    if (!patient) {
      res.status(404).json({
        success: false,
        error: 'Patient not found',
        message: `Patient with ID ${id} does not exist`,
      })
      return
    }

    res.status(200).json({
      success: true,
      data: patient,
      message: 'Patient details retrieved successfully',
    })
  } catch (error) {
    logger.error('Error getting patient by ID:', error)
    next(error)
  }
}
