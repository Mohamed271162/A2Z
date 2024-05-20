import { isAuthAdmin } from '../../../middlewares/auth.admin.js';
import { multerCloudFunction } from '../../../services/multerCloud.js';
import { allowedExtensions } from '../../../utils/allowedExtensions.js';
import { asyncHandler } from '../../../utils/errorhandling.js';
import * as ac from './admin.controller.js'
import { Router } from "express";
const router = Router()


router.post('/signup', asyncHandler(ac.SignUp))
router.post('/phonenumber', asyncHandler(ac.signInP))
router.post('/OTP', asyncHandler(ac.signInO))
router.put('/updateadminprofile', multerCloudFunction(allowedExtensions.Image).single('image'), isAuthAdmin(), asyncHandler(ac.updateProfile))
router.post('/addengineer',isAuthAdmin(),asyncHandler(ac.addEngineer))

router.get('/getengbyid',isAuthAdmin(), asyncHandler(ac.getEngBy))
router.get('/getadmininfo',isAuthAdmin(), asyncHandler(ac.getadminaccount))

router.get('/getalleng',isAuthAdmin(), asyncHandler(ac.getAll))

router.put('/:engId', isAuthAdmin(), multerCloudFunction(allowedExtensions.Image).single('image'), asyncHandler(ac.updateEng))
router.delete('/delete/:engId', isAuthAdmin(), asyncHandler(ac.deleteEng))
router.get('/logout/:userid', isAuthAdmin(), asyncHandler(ac.logOut))

router.post(
  '/addcategory',
  isAuthAdmin(),
  multerCloudFunction(allowedExtensions.Image).single('image'),
  asyncHandler(ac.addCategory),
)

router.put(
  '/updatecategory/:categoryId',

  multerCloudFunction(allowedExtensions.Image).single('image'),
  asyncHandler(ac.updateCategory),
)

router.post(
  '/addproduct/:categoryId',isAuthAdmin(),
  multerCloudFunction(allowedExtensions.Image).array('image', 10),
  // validationCoreFunction(validators.addProductSchema),
  asyncHandler(ac.addProduct),
)
router.put(
  '/updateproduct',
  isAuthAdmin(),
  multerCloudFunction(allowedExtensions.Image).array('image', 10),
  // validationCoreFunction(validators.updateProductSchema),
  asyncHandler(ac.updateProduct),
)
router.delete('/deleteproduct', asyncHandler(ac.deleteProduct))








export default router;