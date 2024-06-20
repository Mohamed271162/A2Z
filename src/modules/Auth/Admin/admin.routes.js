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
router.get('/get', isAuthAdmin(),asyncHandler(ac.getAllCategories))
router.post(
  '/addproduct',isAuthAdmin(),
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
router.get('/getallproduct', isAuthAdmin(),asyncHandler(ac.getAllProduct))
router.get('/getalluser',isAuthAdmin(), asyncHandler(ac.getAllUser))
router.get('/getusermsg',isAuthAdmin(),asyncHandler(ac.getUserMessages))
router.get('/getalladmin',isAuthAdmin(), asyncHandler(ac.getAllAdmin))
router.get('/getuserscount', isAuthAdmin(), asyncHandler(ac.getUserCount))
router.get('/getengcount', isAuthAdmin(), asyncHandler(ac.getEngCount))
router.get('/getallorder',isAuthAdmin(), asyncHandler(ac.getAllOrder))
router.get('/getsomeeng',isAuthAdmin(), asyncHandler(ac.getEngVerified))





router.delete('/deleteproduct/:productId',isAuthAdmin(), asyncHandler(ac.deleteProduct))
router.delete('/deleteuser/:userId',isAuthAdmin(), asyncHandler(ac.deleteUser))








export default router;