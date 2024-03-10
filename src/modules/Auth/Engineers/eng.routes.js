import { Router } from 'express'
const router = Router()
import * as ec from '../../../../src/modules/Auth/Engineers/eng.controller.js'
import { asyncHandler } from '../../../../src/utils/errorhandling.js'
import { multerCloudFunction } from '../../../services/multerCloud.js'
import { allowedExtensions } from '../../../utils/allowedExtensions.js'
import { isAuth } from '../../../middlewares/auth.eng.js'
import { validationCoreFunction } from '../../../middlewares/validation.js'
import { SignInSchema } from './eng.validationSchema.js'

router.post('/',multerCloudFunction(allowedExtensions.Image).single('image'), asyncHandler(ec.signUp))
router.get('/confirm/:token', asyncHandler(ec.confirmEmail))
router.post('/login', asyncHandler(ec.logIn)) 
router.post('/gallery',isAuth(),multerCloudFunction(allowedExtensions.Image).array('image',10),asyncHandler(ec.communityPage))
router.put('/updategallery',isAuth(),multerCloudFunction(allowedExtensions.Image).array('image',10),asyncHandler(ec.updateGallery))
router.get('/getUser',isAuth(),asyncHandler(ec.getEngAccount))
router.post('/Profile',isAuth(),multerCloudFunction(allowedExtensions.Image).single('image'), asyncHandler(ec.profilePic))
router.delete('/deleteGallery',isAuth(),asyncHandler(ec.deleteGallery))
router.get('/logOut',isAuth(),asyncHandler(ec.logOut))

export default router