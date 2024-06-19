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
router.get('/getproductinfo/:productId', isAuthUser(),asyncHandler(uc.getProductInfo))
router.get('/productfilter',isAuthUser(), asyncHandler(uc.getProductsByTitle))
router.get('/productbycategory',isAuthUser(), asyncHandler(uc.getProductsBycategory))




router.post('/addcart',
    isAuthUser(),
    asyncHandler(uc.addToCart))

router.delete('/deletecart',
    isAuthUser(),
    asyncHandler(uc.deleteFromCart))


router.post('/contactmsg',isAuthUser(),asyncHandler(uc.contactUs))    
export default router