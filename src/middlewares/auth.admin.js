import { AdminModel } from '../../DB/Models/Admin.model.js'
import admin from '../config/firebase-config.js'
import { generateToken, verifyToken } from '../utils/tokenFunctions.js'

export const isAuthAdmin = () => {
  return async (req, res, next) => {
    try {
      const { authorization } = req.headers
      if (!authorization) {
        return next(new Error('Please login first', { cause: 400 }))
      }

      if (!authorization.startsWith('a2z')) {
        return next(new Error('invalid token prefix', { cause: 400 }))
      }

      const splitedToken = authorization.split(' ')[1]

      try {
        const decodedData = verifyToken({
          token: splitedToken,
          signature: process.env.SIGN_IN_TOKEN_SECRET,
        })
        
        const findAdmin = await AdminModel.findById(
          decodedData.id,
        )
        if (!findAdmin) {
          return next(new Error('Please SignUp', { cause: 400 }))
        }
        req.authAdmin = findAdmin
        next()
      } catch (error) {
        // token  => search in db
        if (error == 'TokenExpiredError: jwt expired') {
          // refresh token
          const Admin = await AdminModel.findOne({ token: splitedToken })
          if (!Admin) {
            return next(new Error('Wrong token', { cause: 400 }))
          }
          // generate new token
          const adminToken = generateToken({
            payload: {
              OTP: Admin.OTP,
              id: Admin._id,
            },
            signature: process.env.SIGN_IN_TOKEN_SECRET,
            
          })

          if (!adminToken) {
            return next(
              new Error('token generation fail, payload canot be empty', {
                cause: 400,
              }),
            )
          }

          Admin.token = adminToken
          await Admin.save()
          return res.status(200).json({ message: 'Token refreshed', adminToken })
        }
        console.log(error);
        return next(new Error('invalid token', { cause: 500 }))
      }
    } catch (error) {
      console.log(error)
      next(new Error('catch error in auth', { cause: 500 }))
    }
  }
}