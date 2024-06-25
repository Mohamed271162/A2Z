import { Router } from 'express'
const router = Router()
import * as ec from '../../../../src/modules/Auth/Engineers/eng.controller.js'
import { asyncHandler } from '../../../../src/utils/errorhandling.js'
import { multerCloudFunction } from '../../../services/multerCloud.js'
import { allowedExtensions } from '../../../utils/allowedExtensions.js'
import { isAuth } from '../../../middlewares/auth.eng.js'
import { validationCoreFunction } from '../../../middlewares/validation.js'
//Eng Crud
router.post('/signup',multerCloudFunction(allowedExtensions.Image).single('image'), asyncHandler(ec.signUp))
router.get('/confirm/:token', asyncHandler(ec.confirmEmail))
router.post('/login', asyncHandler(ec.logIn)) 
router.get('/logOut',isAuth(),asyncHandler(ec.logOut))
//Eng PostS
router.post('/addpost',isAuth(),multerCloudFunction(allowedExtensions.Image).array('image',10),asyncHandler(ec.communityPage))
router.put('/updatepost',isAuth(),multerCloudFunction(allowedExtensions.Image).array('image',10),asyncHandler(ec.updateGallery))
router.delete('/deletepost',isAuth(),asyncHandler(ec.deleteGallery))

router.post('/Profile',isAuth(),multerCloudFunction(allowedExtensions.Image).single('image'), asyncHandler(ec.profilePic))
router.get('/getUser',isAuth(),asyncHandler(ec.getEngAccount))
router.get('/getallposts',isAuth(),asyncHandler(ec.getAllPosts))
router.put('/updatprofile/:userid', isAuth(), asyncHandler(ec.updateProfile))
router.get('/getengbyid/:engId',isAuth(), asyncHandler(ec.getuserBy))


export default router