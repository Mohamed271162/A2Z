//mama @ar3a
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
const nanoid = customAlphabet('1234567890', 6)

export const SignUp = async (req, res, next) => {
    const { phoneNumber,
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

    const isEmailDuplicate = await AdminModel.findOne({ email})
    if (isEmailDuplicate) {
        return next(new Error('email is already exist', { cause: 400 }))
    }
    // const token = generateToken({
    //     payload: {
    //         phoneNumber,
    //     },
    //     signature: process.env.CONFIRMATION_NUMBER_TOKEN,
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
    const OTPcode = nanoid()
    const isEmailSent = sendEmailService({
        to: isExisted.email,
        subject: 'Confirmation OTP',
        // message: <a href=${conirmationlink}>Click here to confirm </a>,
        message: `${OTPcode}`
    })
    if (!isEmailSent) {
        return next(new Error('fail to sent confirmation email', { cause: 400 }))
    }
    const adminOtpUpdate = await AdminModel.findOneAndUpdate(
        {
            phoneNumber
        },
        {
            OTP: OTPcode
        },
        {
            new: true,
        },)
    if (!adminOtpUpdate) {
        return next(new Error('Failed Update OTP', { cause: 400 }))
    }


    res.status(200).json({ message: 'OTP sended', adminOtpUpdate })
}

export const signInO = async (req, res, next) => {
    const { OTP , phoneNumber } = req.body

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
    // const token = generateToken({
    //     payload: {
    //         OTP,
    //         id: isExisted._id,
    //     },
    //     signature: process.env.SIGN_IN_TOKEN_SECRET,
    // })

    res.status(200).json({ message: 'loggin Done' })
}

export const updateProfile = async (req, res, next) => {
    const { userName,
        age,
        gender,
        phone,

    } = req.body

    const { id } = req.authAdmin
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
        userName,
        age,
        gender,
        phone,
    },
        {
            new: true,
        },)
    if (admin) {
        return res.status(200).json({ messege: 'Done', admin });
    }

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
        addedBy: id,

    })
    const saveEngineer = await engineer.save()
    res.status(201).json({ message: 'Done', saveEngineer })
}


export const getAll = async (req, res, next) => {
    const { page, size } = req.query
    const { limit, skip } = paginationFunction({ page, size })

    const productsc = await productModel.find().limit(limit).skip(skip)
    res.status(200).json({ message: 'Done', productsc })
}

export const getEngBy = async (req, res, next) => {
    const { searchKey, page, size } = req.query

    const { limit, skip } = paginationFunction({ page, size })

    const Engineer = await EngineerModel
        .find({
            $or: [
                { userName: { $regex: searchKey, $options: 'i' } },
                { phoneNumber: { $regex: searchKey, $options: 'i' } },
            ],
        })
        .limit(limit)
        .skip(skip)
    res.status(200).json({ message: 'Done', Engineer })
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
    } = req.body

    const Eng = await EngineerModel.findById(engId)
    if (!Eng) {
        return next(new Error('Not Found', { cause: 400 }))
    }

    Eng.userName = userName

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
        Eng.profilePic = { secure_url, public_id }

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
    await EngineerModel.deleteOne({ engExists })
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

export const logOut = async (req, res, next) => {
    const { id } = req.authAdmin
    const { userid } = req.query

    const userExist = await AdminModel.findById(userid)
    if (!userExist) {
        return res.json({ message: 'invaled admin id' })
    }
    if (userExist._id.toString() !== id.toString()) {
        return next(new Error('can not take this action', { cause: 400 }))
    }
    await EngineerModel.findByIdAndUpdate(id, {
        status: 'Offline'
    })
    res.json({ message: "log out done" })
}

