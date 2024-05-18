import { isAuthAdmin } from '../../../middlewares/auth.admin.js';
import { multerCloudFunction } from '../../../services/multerCloud.js';
import { allowedExtensions } from '../../../utils/allowedExtensions.js';
import { asyncHandler } from '../../../utils/errorhandling.js';
import * as ac from './admin.controller.js'
import { Router } from "express";
const router = Router()


router.post('/', asyncHandler(ac.SignUp))
router.post('/phonenumber', asyncHandler(ac.signInP))
router.post('/OTP', asyncHandler(ac.signInO))
router.put('/', isAuthAdmin(), multerCloudFunction(allowedExtensions.Image).single('image'), asyncHandler(ac.updateProfile))
router.post('/addengineer',isAuthAdmin(),asyncHandler(ac.addEngineer))
router.get('/getengby', asyncHandler(ac.getEngBy))
router.put('/:engId', isAuthAdmin(), multerCloudFunction(allowedExtensions.Image).single('image'), asyncHandler(ac.updateEng))
router.delete('/:engId', isAuthAdmin(), asyncHandler(ac.deleteEng))
router.get('/logOut', isAuthAdmin(), asyncHandler(ac.logOut))
router.post(
  '/addproduct',
  multerCloudFunction(allowedExtensions.Image).array('image', 10),
  // validationCoreFunction(validators.addProductSchema),
  asyncHandler(ac.addProduct),
)
router.put(
  '/updateproduct',
  multerCloudFunction(allowedExtensions.Image).array('image', 10),
  // validationCoreFunction(validators.updateProductSchema),
  asyncHandler(ac.updateProduct),
)
router.delete('/deleteproduct', asyncHandler(ac.deleteProduct))

router.post(
  '/addcategory',
  // isAuthAdmin(),
  multerCloudFunction(allowedExtensions.Image).single('image'),
  asyncHandler(ac.addCategory),
)







export default router;