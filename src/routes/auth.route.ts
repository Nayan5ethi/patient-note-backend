import { Router } from 'express'
import { authController } from 'controllers/auth.controller'
import { validateLogin } from 'middlewares/validator/auth.validator'

const router = Router()

router.post('/login', validateLogin, authController.login)

export default router
