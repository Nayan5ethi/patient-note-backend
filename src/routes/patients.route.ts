import { Router } from 'express'
import { getPatients, getPatientById } from '../controllers/patients.controller'
import { authenticateToken } from '../middlewares/auth.middleware'
import { validateGetPatients, validatePatientId } from '../middlewares/validator/patients.validator'

const router = Router()

router.use(authenticateToken)

router.get('/', validateGetPatients, getPatients)
router.get('/:id', validatePatientId, getPatientById)

export default router
