import { UserModel } from "../../../../DB/Models/user.model.js"
import pkg from 'bcrypt'
import { generateToken } from "../../../utils/tokenFunctions.js"

export const SignUp = async (req, res, next) => {
    const { userName,
        email,
        password,
        Repass,
    } = req.body



    const isEmailDuplicate = await UserModel.findOne({ email})
    if (isEmailDuplicate) {
        return next(new Error('email is already exist', { cause: 400 }))
    }

    if (password!==Repass){
        return next(new Error('password and repass not identical', { cause: 400 }))
    }


    const objUser = new UserModel({
    
        
        userName,
        email,
        password,
        Repass,

    })
    const saveUser= await objUser.save()
    res.status(201).json({ message: 'Done', saveUser })
}

export const logIn = async (req, res, next) => {
    const { email, password } = req.body
    const user = await UserModel.findOne( {email} )
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