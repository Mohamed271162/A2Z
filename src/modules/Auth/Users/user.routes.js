import { Router } from 'express'
const router = Router()
import * as uc from '../../../../src/modules/Auth/Users/user.controller.js'
import { asyncHandler } from '../../../utils/errorhandling.js'
import { isAuthUser } from '../../../middlewares/auth.user.js'


router.post('/', asyncHandler(uc.SignUp))
router.get('/confirm/:token', asyncHandler(uc.confirmEmail))

router.post('/login', asyncHandler(uc.logIn))
router.get('/getUser', asyncHandler(uc.getAllUser))
router.get('/getUserAccount', isAuthUser(), asyncHandler(uc.getUserAccount))
router.get('/getallproduct', asyncHandler(uc.getAllProduct))


router.post('/addcart',
    isAuthUser(),
    asyncHandler(uc.addToCart))

router.delete('/deletecart',
    isAuthUser(),
    asyncHandler(uc.deleteFromCart))

export default router