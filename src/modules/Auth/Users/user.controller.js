import { UserModel } from "../../../../DB/Models/user.model.js"
import pkg from 'bcrypt'
import { generateToken, verifyToken } from "../../../utils/tokenFunctions.js"
import { sendEmailService } from "../../../services/sendEmailService.js"
import { emailTemplate } from "../../../utils/emailTemplate.js"
import { productModel } from "../../../../DB/Models/Product.model.js"
// import { cartModel } from "../../../../DB/Models/cart.model.js"

export const SignUp = async (req, res, next) => {
    const { userName,
        email,
        password,
        Repass,
    } = req.body



    const isEmailDuplicate = await UserModel.findOne({ email })
    if (isEmailDuplicate) {
        return next(new Error('email is already exist', { cause: 400 }))
    }

    if (password !== Repass) {
        return next(new Error('password and repass not identical', { cause: 400 }))
    }
    const token = generateToken({
        payload: {
            email,
        },
        signature: process.env.CONFIRMATION_EMAIL_TOKEN,
        // expiresIn: '1h',
    })
    const conirmationlink = `${req.protocol}://${req.headers.host}/User/confirm/${token}`
    const isEmailSent = sendEmailService({
        to: email,
        subject: 'Confirmation Email',
        // message: `<a href=${conirmationlink}>Click here to confirm </a>`,
        message: emailTemplate({
            link: conirmationlink,
            linkData: 'Click here to confirm',
            subject: 'Confirmation Email',
        }),
    })


    if (!isEmailSent) {
        return next(new Error('fail to sent confirmation email', { cause: 400 }))
    }
    const hashedPassword = pkg.hashSync(password, +process.env.SALT_ROUND)


    const objUser = new UserModel({


        userName,
        email,
        password: hashedPassword,
    })
    const saveUser = await objUser.save()
    res.status(201).json({ message: 'Done', saveUser })
}

export const confirmEmail = async (req, res, next) => {
    const { token } = req.params
    const decode = verifyToken({
        token,
        signature: process.env.CONFIRMATION_EMAIL_TOKEN,
    })
    const user = await UserModel.findOneAndUpdate(
        { email: decode?.email, isConfirmed: false },
        { isConfirmed: true },
        { new: true },
    )
    if (!user) {
        return next(new Error('already confirmed', { cause: 400 }))
    }
    res.status(200).json({ messge: 'Confirmed done, please try to login' })
}


export const logIn = async (req, res, next) => {
    const { email, password } = req.body
    const user = await UserModel.findOne({ email })
    if (!user) {
        return next(new Error('invalid login credentials', { cause: 400 }))
    }
    // const isPassMatch = pkg.compareSync(password, user.password)
    // if (!isPassMatch) {
    //     return next(new Error('invalid login credentials', { cause: 400 }))
    // }

    const token = generateToken({
        payload: {
            email,
            id: user._id,
        },
        signature: process.env.SIGN_IN_TOKEN_SECRET,
    })

    const userUpdated = await UserModel.findOneAndUpdate(
        { email },
        {
            token,
            status: 'Online',
        },
        {
            new: true,
        },
    )
    res.status(200).json({ messge: 'Login done', userUpdated })
}

export const getAllUser = async (req, res, next) => {

    // const { id } = req.query
    const user = await UserModel.find()
    if (user) {
        return res.status(200).json({ message: 'done', user })
    }
    res.status(404).json({ message: 'in-valid Id' })
}

export const getUserAccount = async (req, res, next) => {

    const { id } = req.authClient
    const user = await UserModel.findById(id)
    if (user) {
        return res.status(200).json({ message: 'done', user })
    }
    res.status(404).json({ message: 'in-valid Id' })
}

export const getAllProduct = async (req, res, next) => {
    const { id } = req.authClient
    if (!await AdminModel.findById(id)) {
      return next(
        new Error('invaild id ', { cause: 400 }),
      ) 
    }
    const Products = await productModel.find()
    
    res.status(200).json({ message: 'Done', Products })
  }



export const addToCart = async (req, res, next) => {
    const userId = req.authClient
    const { productId, quantity } = req.body
  
    // ================== product check ==============
    const productCheck = await productModel.findOne({
      _id: productId,
      stock: { $gte: quantity },
    })
    if (!productCheck) {
      return next(
        new Error('inavlid product please check the quantity', { cause: 400 }),
      )
    }
  
    const userCart = await cartModel.findOne({ userId }).lean()

    if (userCart) {
      // update quantity
      let productExists = false
      for (const product of userCart.products) {
        if (productId == product.productId) {
          productExists = true
          product.quantity = quantity
        }
      }
      // push new product
      if (!productExists) {
        userCart.products.push({ productId, quantity })
      }
  
      // subTotal
      let subTotal = 0
      for (const product of userCart.products) {
        const productExists = await productModel.findById(product.productId)
        subTotal += productExists.priceAfterDiscount * product.quantity || 0
      }
      const newCart = await cartModel.findOneAndUpdate(
        { userId },
        {
          subTotal,
          products: userCart.products,
        },
        {
          new: true,
        },
      )
      return res.status(200).json({ message: 'Done', newCart })
    }
  
    const cartObject = {
      userId,
      products: [{ productId, quantity }],
      subTotal: productCheck.priceAfterDiscount * quantity,
    }
    const cartDB = await cartModel.create(cartObject)
    res.status(201).json({ message: 'Done', cartDB })
  }
  

//   export const deleteFromCart = async (req, res, next) => {
//     const userId = req.authClient
//     const { productId } = req.body
  
//     // ================== product check ==============
//     const productCheck = await productModel.findOne({
//       _id: productId,
//     })
//     if (!productCheck) {
//       return next(new Error('inavlid product id', { cause: 400 }))
//     }
  
//     const userCart = await cartModel.findOne({
//       userId,
//       'products.productId': productId,
//     })
//     if (!userCart) {
//       return next(new Error('no productId in cart '))
//     }
//     userCart.products.forEach((ele) => {
//       if (ele.productId == productId) {
//         userCart.products.splice(userCart.products.indexOf(ele), 1)
//       }
//     })
//     await userCart.save()
//     res.status(200).json({ message: 'Done', userCart })
//   }





