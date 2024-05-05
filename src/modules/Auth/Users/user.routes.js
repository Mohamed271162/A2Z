import { Router } from 'express'
const router = Router()
import * as uc from '../../../../src/modules/Auth/Users/user.controller.js'
import { asyncHandler } from '../../../utils/errorhandling.js'


router.post('/',asyncHandler(uc.SignUp))
router.post('/login',asyncHandler(uc.logIn))

export default router