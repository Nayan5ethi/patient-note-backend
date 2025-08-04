import { Router } from 'express'
import notesRouter from './notes.route'
import authRouter from './auth.route'
import patientsRouter from './patients.route'

const router = Router()

router.use('/auth', authRouter)
router.use('/notes', notesRouter)
router.use('/patients', patientsRouter)

export const routes = router
