// ay kalam 
// // Send OTP endpoint 


// export const SendOTP = async (req, res, next) => {
//     const { phonenumber } = req.body;
//     // const OTP = customAlphabet('123456',6)

//     const result = await admin.auth().createUser({
//         phoneNumber: phonenumber,

//     });
//     console.log(result);
//     // const user = await EngineerModel.create({
//     //   _id:uid, 
//     //  })
//     res.status(200).json({ message: 'OTP sent successfully',result });
// //     if (!uid)
// //         next(new Error('Error sending OTP:', { cause: 400 }))

// };

// export const VerifyOTP = async (req, res, next) => {
//     const { uid } = req.body;

//     // Verify the provided OTP
//     const user = await admin.auth().getUserByProviderUid(uid);
//     const credential = admin.auth.PhoneAuthProvider.credential(user.uid);
//     await admin.auth().signInWithCredential(credential);
//   console.log(user);
//     res.json({ success: true, message: 'User authenticated successfully' });
//     // if (!credential)
//     //     next(new Error('Error sending OTP:', { cause: 400 }))

// }
// import { EngineerModel } from '../../../../DB/Models/Engineer.model.js';
// import admin from '../../../../src/config/firebase-config.js'
// import { customAlphabet } from 'nanoid'
// // export const SignUp = async (req, res, next) => {
// //     const { phone, OTP } = req.body
// //     const userResponse = admin.auth().createUser({
// //         phoneNumber: phone,
// //         disabled: false,
// //     })
// //     res.status(200).json({messege:'DoneCreated',userResponse})
// // }

import { AdminModel } from "../../../../DB/Models/Admin.model.js"
import { EngineerModel } from "../../../../DB/Models/Engineer.model.js"
import { sendEmailService } from "../../../services/sendEmailService.js"
import cloudinary from "../../../utils/coludinaryConfigrations.js"
import { emailTemplate } from "../../../utils/emailTemplate.js"
import pkg from 'bcrypt'
import { generateToken } from "../../../utils/tokenFunctions.js"
import { customAlphabet } from "nanoid"
import { paginationFunction } from "../../../utils/pagination.js"
import { categoryModel } from "../../../../DB/Models/Category.model.js"
import { productModel } from "../../../../DB/Models/Product.model.js"
import slugify from "slugify"
import { UserModel } from "../../../../DB/Models/user.model.js"
import { contactModel } from "../../../../DB/Models/contact.model.js"
import { orderModel } from "../../../../DB/Models/order.model.js"

const nanoid = customAlphabet('1234567890', 6)

export const SignUp = async (req, res, next) => {
  const {
    phoneNumber,
    OTP,
    userName,
    email,
    age,
    gender,
  } = req.body

  // phone check
  const isPhoneDuplicate = await AdminModel.findOne({ phoneNumber })
  if (isPhoneDuplicate) {
    return next(new Error('phone is already exist', { cause: 400 }))
  }

  const isEmailDuplicate = await AdminModel.findOne({ email })
  if (isEmailDuplicate) {
    return next(new Error('email is already exist', { cause: 400 }))
  }


  const isOTPDuplicate = await AdminModel.findOne({ OTP })
  if (isOTPDuplicate) {
    return next(new Error('OTP Duplicated', { cause: 400 }))
  }
  // const token = generateToken({
  //     payload: {
  //         OTP,


  //     },
  //     signature: process.env.SIGN_IN_TOKEN_SECRET,
  //     // expiresIn: '1h',
  // })

  const objAdmin = new AdminModel({
    phoneNumber,
    OTP,
    userName,
    email,
    age,
    gender,

  })
  const saveAdmin = await objAdmin.save()
  res.status(201).json({ message: 'Done', saveAdmin })
}


export const signInP = async (req, res, next) => {

  const {

    phoneNumber

  } = req.body


  //phoneNum Check
  const isExisted = await AdminModel.findOne({ phoneNumber })
  if (!isExisted) {
    return next(new Error(' Not  Found', { cause: 400 }))
  }

  // if (isExisted.isVerify == false) {
  //     return next(new Error(' isVerify  make it true', { cause: 400 }))
  // }
  // const OTPcode = nanoid()
  // const isEmailSent = sendEmailService({
  //     to: isExisted.email,
  //     subject: 'Confirmation OTP',
  //     // message: <a href=${conirmationlink}>Click here to confirm </a>,
  //     message: `${OTPcode}`
  // })
  // if (!isEmailSent) {
  //     return next(new Error('fail to sent confirmation email', { cause: 400 }))
  // }
  // const adminOtpUpdate = await AdminModel.findOneAndUpdate(
  //     {
  //         phoneNumber
  //     },
  //     {
  //         OTP: OTPcode
  //     },
  //     {
  //         new: true,
  //     },)
  // if (!adminOtpUpdate) {
  //     return next(new Error('Failed Update OTP', { cause: 400 }))
  // }


  res.status(200).json({ message: 'OTP sended' })
}

export const signInO = async (req, res, next) => {
  const { OTP, phoneNumber } = req.body

  const admin = await AdminModel.findOne({
    phoneNumber
  })
  if (!admin) {
    return next(
      new Error('Admin Not Found , try again', {
        cause: 400,
      }),
    )
  }
  //OTP Check

  if (admin.OTP.toString() !== OTP.toString()) {
    return next(new Error(' In-valid OTP', { cause: 400 }))
  }

  if (admin.isVerify == false) {
    return next(new Error(' Please Verified your Account', { cause: 400 }))
  }
  const token = generateToken({
    payload: {
      OTP,
      id: admin._id,
    },
    signature: process.env.SIGN_IN_TOKEN_SECRET,
  })



  const adminUpdated = await AdminModel.findOneAndUpdate(
    { phoneNumber },
    {
      token,
      status: 'Online',
    },
    {
      new: true,
    },
  )

  res.status(200).json({ message: 'loggin Done', adminUpdated })
}

export const updateProfile = async (req, res, next) => {
  const {

    email,
    userName,
    age,
    gender,
    // phone,


  } = req.body
  const { id } = req.authAdmin

  if (!req.file) {
    return next(new Error('please upload a Admin pic', { cause: 400 }))
  }

  const customId = nanoid()
  const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
    folder: `${process.env.PROJECT_FOLDER}/Admin/ProfilePic/${customId}`,
    resource_type: 'image'
  })
  const admin = await AdminModel.findByIdAndUpdate(id, {
    profilePic: {
      secure_url,
      public_id,
    },

    email,
    userName,
    age,
    gender,
    // phone,
  },
    {
      new: true,
    },)
  if (admin) {
    return res.status(200).json({ messege: 'Done', admin });
  }

}


export const getadminaccount = async (req, res, next) => {

  const { id } = req.authAdmin

  const user = await AdminModel.findById(id)
  if (user) {
    return res.status(200).json({ message: 'done', user })
  }
  res.status(404).json({ message: 'in-valid Id' })
}

export const addEngineer = async (req, res, next) => {
  const {
    userName,
    email,
    password,
    age,
    gender,
    phoneNumber,
    address,
    spicalAt
  } = req.body

  const { id } = req.authAdmin

  // email check
  const isEmailDuplicate = await EngineerModel.findOne({ email })
  if (isEmailDuplicate) {
    return next(new Error('email is already exist', { cause: 400 }))
  }

  const token = generateToken({
    payload: {
      email,
    },
    signature: process.env.CONFIRMATION_EMAIL_TOKEN,
    // expiresIn: '1h',
  })
  // To Do replace email => phone 
  const conirmationlink = `${req.protocol}://${req.headers.host}/Engineer/confirm/${token}`
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

  // hash password => from hooks
  const hashedPassword = pkg.hashSync(password, +process.env.SALT_ROUND)

  const engineer = new EngineerModel({
    userName,
    email,
    password: hashedPassword,
    age,
    gender,
    phoneNumber,
    address,
    spicalAt,
    addedBy: id,

  })
  const saveEngineer = await engineer.save()
  res.status(201).json({ message: 'Done', saveEngineer })
}


export const getAll = async (req, res, next) => {
  // const { page, size } = req.query
  // const { limit, skip } = paginationFunction({ page, size })
  const { id } = req.authAdmin
  const admin = await AdminModel.findById(id);
  if (!admin) {
    return res.status(404).json({ error: 'admin not found' });
  }
  const Engs = await EngineerModel.find()
  // .limit(limit).skip(skip)
  res.status(200).json({ message: 'Done', Engs })
}

export const getEngBy = async (req, res, next) => {
  const { id } = req.authAdmin
  const { engid } = req.query
  const admin = await AdminModel.findById(id);
  if (!admin) {
    return res.status(404).json({ error: 'admin not found' });
  }
  const eng = await EngineerModel.findById(engid);
  if (!eng) {
    return res.status(404).json({ error: 'eng not found' });
  }
  // const { searchKey, page, size } = req.query

  // const { limit, skip } = paginationFunction({ page, size })

  // const Engineer = await EngineerModel
  //     .find(
  //       // {
  //         // $or: [
  //         //     { userName: { $regex: searchKey, $options: 'i' } },
  //         //     { phoneNumber: { $regex: searchKey, $options: 'i' } },
  //         // ],
  //     // }
  //   )
  //     // .limit(limit)
  //     // .skip(skip)
  res.status(200).json({ message: 'Done', eng })
}


export const updateEng = async (req, res, next) => {
  const { id } = req.authAdmin
  const { engId } = req.params

  const {
    userName,
    age,
    gender,
    phoneNumber,
    address,
    password
  } = req.body

  const Eng = await EngineerModel.findById(engId)
  if (!Eng) {
    return next(new Error('Not Found', { cause: 400 }))
  }

  // if(!userName){
  //   Eng.userName = userName

  // }

  Eng.userName = userName
  Eng.password = password
  Eng.age = age
  Eng.gender = gender
  Eng.phoneNumber = phoneNumber
  Eng.address = address
  Eng.UpdatedBy = id

  if (req.file) {
    await cloudinary.uploader.destroy(Eng.profilePic.public_id)   //delete old image

    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
      folder: `${process.env.PROJECT_FOLDER}/Engineer/ProfilePic/${Eng.customId}`, //new image
    })

    Eng.profilePic = public_id
    Eng.profilePic = secure_url

  }
  await Eng.save()
  res.status(200).json({ messege: 'Done updated', Eng })
}

export const deleteEng = async (req, res, next) => {
  const { engId } = req.params
  const { id } = req.authAdmin

  // check engineer id
  const engExists = await EngineerModel.findById(engId)
  if (!engExists) {
    return next(new Error('invalid engineerId', { cause: 400 }))
  }
  await EngineerModel.deleteOne({ engExists },{new:true})
  engExists.deletedBy = id
  // //Cloudinary
  // await cloudinary.api.delete_all_resources(
  //     `${process.env.PROJECT_FOLDER}/Engineer/ProfilePic/${engExists.customId}`,
  // )

  // await cloudinary.api.delete_folder(
  //     `${process.env.PROJECT_FOLDER}/Engineer/ProfilePic/${engExists.customId}`,
  // )
  await engExists.save()
  res.status(200).json({ messsage: 'Deleted Done' })
}
// when admin logout i want make it offline and delete token cant doing any things when delte token 

export const logOut = async (req, res, next) => {
  const { id } = req.authAdmin
  const { userid } = req.params

  const userExist = await AdminModel.findById(userid)
  if (!userExist) {
    return res.json({ message: 'invaled admin id' })
  }
  if (userExist._id.toString() !== id.toString()) {
    return next(new Error('can not take this action', { cause: 400 }))
  }
  await AdminModel.findByIdAndUpdate(id, {
    status: 'Offline'
  })
  res.json({ message: "log out done" })
}



export const addCategory = async (req, res, next) => {
  const { id } = req.authAdmin
  const { name } = req.body



  if (!await AdminModel.findById(id)) {
    return next(
      new Error('invaild id ', { cause: 400 }),
    )
  }
  if (await categoryModel.findOne({ name })) {
    return next(
      new Error('please enter different category name', { cause: 400 }),
    )
  }

  // if (!req.file) {
  //   return next(new Error('please upload a category image', { cause: 400 }))
  // }

  // const customId = nanoid()
  // const { secure_url, public_id } = await cloudinary.uploader.upload(
  //   req.file.path,
  //   {
  //     folder: `${process.env.PROJECT_FOLDER}/Categories/${customId}`,
  //   },
  // )

  const categoryObject = {
    name,

    // Image: {
    //   secure_url,
    //   public_id,
    // },
    // customId,
    createdBy: id,
  }

  const category = await categoryModel.create(categoryObject)
  if (!category) {
    await cloudinary.uploader.destroy(public_id)
    return next(
      new Error('try again later , fail to add your category', { cause: 400 }),
    )
  }
  res.status(200).json({ message: 'Added Done', category })
}


export const updateCategory = async (req, res, next) => {
  const { id } = req.authAdmin
  const { categoryId } = req.params
  const { name } = req.body

  if (!await AdminModel.findById(id)) {
    return next(
      new Error('invaild id ', { cause: 400 }),
    )
  }
  // get category by id

  const category = await categoryModel.findById(categoryId)
  if (!category) {
    return next(new Error('invalud category Id', { cause: 400 }))
  }

  if (name) {
    // different from old name
    if (category.name == name.toLowerCase()) {
      return next(
        new Error('please enter different name from the old category name', {
          cause: 400,
        }),
      )
    }
    // unique name
    if (await categoryModel.findOne({ name })) {
      return next(
        new Error('please enter different category name , duplicate name', {
          cause: 400,
        }),
      )
    }

    category.name = name
    category.slug = slugify(name, '_')
    category.updatedBy = id
  }

  if (req.file) {
    // delete the old category image
    await cloudinary.uploader.destroy(category.Image.public_id)

    // upload the new category image
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.PROJECT_FOLDER}/Categories/${category.customId}`,
      },
    )
    // db
    category.Image = { secure_url, public_id }
  }

  await category.save()
  res.status(200).json({ message: 'Updated Done', category })
}


export const getAllCategories = async (req, res, next) => {
  const { id } = req.authAdmin
  if (!await AdminModel.findById(id)) {
    return next(
      new Error('invaild id ', { cause: 400 }),
    )
  }
  const Categories = await categoryModel.find()

  res.status(200).json({ message: 'Done', Categories })
}

export const getAllUser = async (req, res, next) => {

  const { id } = req.authAdmin

  if (!await AdminModel.findById(id)) {
    return next(
      new Error('invaild id ', { cause: 400 }),
    )
  }
  const user = await UserModel.find()
  if (user) {
    return res.status(200).json({ message: 'done', user })
  }
  res.status(404).json({ message: 'in-valid Id' })
}


// add product , update , delete 

export const addProduct = async (req, res, next) => {
  const { title, desc, price, appliedDiscount, colors, sizes, stock, name } = req.body
  const { id } = req.authAdmin
  // const { categoryId } = req.params
  // check Ids
  const categoryExists = await categoryModel.findOne({ name })

  if (!categoryExists) {
    return next(new Error('invalid categories', { cause: 400 }))
  }

  const slug = slugify(title, {
    replacement: '_',
  })
  //   if (appliedDiscount) {
  //   const priceAfterDiscount = price - price * ((appliedDiscount || 0) / 100)
  const priceAfterDiscount = price * (1 - (appliedDiscount || 0) / 100)
  //   }

  if (!req.files) {
    return next(new Error('please upload pictures', { cause: 400 }))
  }
  const customId = nanoid()

  let Images = []
  let ImageCover

  for (const file in req.files) {
      if (file == "Images") {
          for (let index = 0; index < req.files[file].length; index++) {
              const { path } = req.files[file][index]
              const { secure_url, public_id } = await cloudinary.uploader.upload(path,
                  {
                      folder: `${process.env.PROJECT_FOLDER}/Categories/Product/Images/${customId}`
                  }
              )
              Images.push({ secure_url, public_id })
          }
      }
      if (file == "imageCover") {
          for (let index = 0; index < req.files[file].length; index++) {
              const { path } = req.files[file][index]
              const { secure_url, public_id } = await cloudinary.uploader.upload(path,
                  {
                     folder: `${process.env.PROJECT_FOLDER}/Categories/Product/ImageCover/${customId}`
                  }
              )
              ImageCover = { secure_url, public_id }
          }
      }
  }



  const productObject = {
    title,
    desc,
    price,
    appliedDiscount,
    priceAfterDiscount,
    colors,
    sizes,
    stock,
    name,
    Images,
    customId,
    createdBy: id,
    slug,
    ImageCover
      ,
  }

  const product = await productModel.create(productObject)
  if (!product) {
    await cloudinary.api.delete_resources(publicIds)
    return next(new Error('trye again later', { cause: 400 }))
  }
  res.status(200).json({ message: 'Done', product })
}

export const updateProduct = async (req, res, next) => {
  const { id } = req.authAdmin
  const { productId, categoryId } = req.body


  const { title, desc, price, appliedDiscount, colors, sizes, stock } = req.body

  if (!await AdminModel.findById(id)) {
    return next(
      new Error('invaild id ', { cause: 400 }),
    )
  }
  // check productId

  const product = await productModel.findById(productId)
  if (!product) {
    return next(new Error('invalid product id', { cause: 400 }))
  }


  const categoryExists = await categoryModel.findById(
    categoryId || product.categoryId,
  )
  if (categoryId) {
    if (!categoryExists) {
      return next(new Error('invalid categories', { cause: 400 }))
    }
    product.categoryId = categoryId
  }



  if (appliedDiscount && price) {
    const priceAfterDiscount = price * (1 - (appliedDiscount || 0) / 100)
    product.priceAfterDiscount = priceAfterDiscount
    product.price = price
    product.appliedDiscount = appliedDiscount
  } else if (price) {
    const priceAfterDiscount =
      price * (1 - (product.appliedDiscount || 0) / 100)
    product.priceAfterDiscount = priceAfterDiscount
    product.price = price
  } else if (appliedDiscount) {
    const priceAfterDiscount =
      product.price * (1 - (appliedDiscount || 0) / 100)
    product.priceAfterDiscount = priceAfterDiscount
    product.appliedDiscount = appliedDiscount
  }

  if (req.files?.length) {
    let ImageArr = []
    for (const file of req.files) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        {
          folder: `${process.env.PROJECT_FOLDER}/Categories/${categoryExists.customId}/Products/${product.customId}`,
        },
      )
      ImageArr.push({ secure_url, public_id })
    }
    let public_ids = []
    for (const image of product.Images) {
      public_ids.push(image.public_id)
    }
    await cloudinary.api.delete_resources(public_ids)
    product.Images = ImageArr
  }

  if (title) {
    product.title = title
    product.slug = slugify(title, '-')
  }
  if (desc) product.desc = desc
  if (colors) product.colors = colors
  if (sizes) product.sizes = sizes
  if (stock) product.stock = stock

  await product.save()
  res.status(200).json({ message: 'Done', product })
}


export const deleteProduct = async (req, res, next) => {
  const { productId } = req.params
  const { id } = req.authAdmin

  if (!await AdminModel.findById(id)) {
    return next(
      new Error('invaild id ', { cause: 400 }),
    )
  }
  // check productId
  const product = await productModel.findByIdAndDelete(productId)
  if (!product) {
    return next(new Error('invalid product id', { cause: 400 }))
  }
  res.status(200).json({ message: 'Done', product })
}

export const getAllProduct = async (req, res, next) => {
  const { id } = req.authAdmin
  if (!await AdminModel.findById(id)) {
    return next(
      new Error('invaild id ', { cause: 400 }),
    )
  }
  const Products = await productModel.find()

  res.status(200).json({ message: 'Done', Products })
}

export const deleteUser = async (req, res, next) => {
  const { userId } = req.params
  const { id } = req.authAdmin


  const userExists = await UserModel.findById(userId)
  if (!userExists) {
    return next(new Error('invalid userId', { cause: 400 }))
  }
  await UserModel.deleteOne({ userExists })
  userExists.deletedBy = id

  await userExists.save()
  res.status(200).json({ messsage: 'Deleted Done' })
}


export const getUserMessages = async (req, res, next) => {

  const messages = await contactModel.find()
  if (messages.length) {
    return res.status(200).json({ messsage: 'Done', messages })
  }
  res.status(200).json({ messsage: 'empty inbox' })
}


export const getAllAdmin = async (req, res, next) => {

  const admin = await AdminModel.find()
  if (!admin) {
    return next(new Error('admin not Found', { cause: 400 }))
  }

  res.status(200).json({ message: 'Done', admin })
}




export const getUserCount = async (req, res, next) => {
  const user = await UserModel.find()
  const count = user.length
  if (user) {
    return res.status(200).json({ message: 'done', count })
  }
  res.status(404).json({ message: 'in-valid Id' })
}

export const getEngCount = async (req, res, next) => {
  const Eng = await EngineerModel.find()
  const count = Eng.length
  if (Eng) {
    return res.status(200).json({ message: 'done', count })
  }
  res.status(404).json({ message: 'in-valid Id' })
}


export const getAllOrder = async (req, res, next) => {

  const order = await orderModel.find()
  if (!order) {
    return next(new Error('Not Found', { cause: 400 }))
  }

  res.status(200).json({ message: 'Done', order })
}

export const getEngVerified = async (req, res, next) => {

  const unverifiedEngineers = await EngineerModel.find({ isConfirmed: false });

  res.status(200).json({ message: 'Done', unverifiedEngineers })
}

export const updateEngVerify = async (req, res, next) => {
  const { engId } = req.params
  const { Verify } = req.body

  const Engineer = await EngineerModel.findByIdAndUpdate(
    engId,
    {
      isConfirmed: Verify,
    },
    {
      new: true,
    },
  )
  if (!Engineer) {
    return next(
      new Error('Fail Update', { cause: 400 }),)
  }
  res.status(200).json({ message: 'Done', Engineer })

}


export const getOrdersSubTotal = async (req, res, next) => {
  const order = await orderModel.find()
  let subtotals = 0
  for (const sub of order) {
    subtotals += sub.subTotal

  }
  if (order) {
    return res.status(200).json({ message: 'done', subtotals })
  }
  res.status(404).json({ message: 'in-valid Id' })
}




