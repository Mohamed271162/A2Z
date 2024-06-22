import { UserModel } from "../../DB/Models/user.model.js"
import { generateToken, verifyToken } from "../utils/tokenFunctions.js"

export const isAuthUser = () => {
    return async (req, res, next) => {
      try {
        const { authorization } = req.headers
        if (!authorization) {
          return next(new Error('Please login first', { cause: 400 }))
        }
  
        if (!authorization.startsWith('A2Z')) {
          return next(new Error('invalid token prefix', { cause: 400 }))
        }
  
        const splitedToken = authorization.split(' ')[1]
        
        try {
          const decodedData = verifyToken({
            token: splitedToken,
            signature: process.env.SIGN_IN_TOKEN_SECRET,
          })
  
          const findUser = await UserModel.findById(
            decodedData.id,
            'email username',
          )
          if (!findUser) {
            return next(new Error('Please SignUp', { cause: 400 }))
          }
          req.authClient = findUser
          next()
        } catch (error) {
          // token  => search in db
          if (error == 'TokenExpiredError: jwt expired') {
            // refresh token
            const user = await UserModel.findOne({ token: splitedToken })
            if (!user) {
              return next(new Error('Wrong token', { cause: 400 }))
            }
            // generate new token
            const UserToken = generateToken({
              payload: {
                email: user.email,
                id: user._id,
              },
              signature: process.env.SIGN_IN_TOKEN_SECRET,
              
            })
  
            if (!UserToken) {
              return next(
                new Error('token generation fail, payload canot be empty', {
                  cause: 400,
                }),
              )
            }
  
            user.token = UserToken
            await user.save()
            return res.status(200).json({ message: 'Token refreshed', UserToken })
          }
          return next(new Error('invalid token', { cause: 500 }))
        }
      } catch (error) {
        console.log(error)
        next(new Error('catch error in auth', { cause: 500 }))
      }
    }
  }