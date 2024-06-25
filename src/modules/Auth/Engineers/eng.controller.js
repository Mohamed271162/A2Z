
import { EngineerModel } from '../../../../DB/Models/Engineer.model.js'
import { UserModel } from '../../../../DB/Models/user.model.js'
import { sendEmailService } from '../../../services/sendEmailService.js'
import cloudinary from '../../../utils/coludinaryConfigrations.js'
import { emailTemplate } from '../../../utils/emailTemplate.js'
import { generateToken, verifyToken } from '../../../utils/tokenFunctions.js'
import pkg from 'bcrypt'
import { customAlphabet } from "nanoid"
const nanoid = customAlphabet('12345_abcdjfh', 5)

//======================================== SignUp ===========================
export const signUp = async (req, res, next) => {
    const {
        userName,
        email,
        password,
        age,
        gender,
        phoneNumber,
        address,

    } = req.body

    if (!req.file) {
        return next(new Error('plz upload identifier pic', { cause: 400 }))
    }
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
    const customId = nanoid()
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: `${process.env.PROJECT_FOLDER}/Engineer/ID/${customId}`,
        resource_type: 'image'
    })
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
        licencePicture: {
            secure_url,
            public_id,
        },
        customId,
    })
    const saveEngineer = await engineer.save()
    res.status(201).json({ message: 'Done', saveEngineer })
}
// =============================== confirm email ===============================

export const confirmEmail = async (req, res, next) => {
    const { token } = req.params
    const decode = verifyToken({
        token,
        signature: process.env.CONFIRMATION_EMAIL_TOKEN,
    })
    const engineer = await EngineerModel.findOneAndUpdate(
        { email: decode?.email, isConfirmed: false },
        { isConfirmed: true },
        { new: true },
    )
    if (!engineer) {
        return next(new Error('already confirmed', { cause: 400 }))
    }
    res.status(200).json({ messge: 'Confirmed done, please try to login' })
}

//=============================== Log In ===============================
export const logIn = async (req, res, next) => {
    const { email, password } = req.body
    const eng = await EngineerModel.findOne({ email })
    // const engineer = await EngineerModel.findOne({ email })
    if (!eng) {
        return next(new Error('invalid login credentials', { cause: 400 }))
    }
    const isPassMatch = pkg.compareSync(password, eng.password)
    if (!isPassMatch) {
        return next(new Error('invalid login credentials pass', { cause: 400 }))
    }

    if (eng.isConfirmed == false) {
        return next(new Error(' Please Verified your Account', { cause: 400 }))
    }

    const token = generateToken({
        payload: {
            email,
            id: eng._id,
        },
        signature: process.env.SIGN_IN_TOKEN_SECRET,
    })

    const engineerUpdated = await EngineerModel.findOneAndUpdate(
        { email },
        {
            token,
            status: 'Online',
        },
        {
            new: true,
        },
    )
    res.status(200).json({ messge: 'Login done', engineerUpdated })
}




export const communityPage = async (req, res, next) => {

    const { id } = req.authUser
    if (!req.files) {
        return next(new Error('please upload pictures', { cause: 400 }))
    }
    const engineer = await EngineerModel.findById(id);
    if (!engineer) {
        return res.status(404).json({ error: 'engineer not found' });
    }

    const Images = []
    const publicIds = []
    for (const file of req.files) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
            file.path,
            {
                folder: `${process.env.PROJECT_FOLDER}/Engineer/communityPage/${engineer.customId}`,
            },

        )
        Images.push({ secure_url, public_id })
        publicIds.push(public_id)
    }

    const engNew = await EngineerModel.findByIdAndUpdate(
        id,
        {
            Gallery: Images,
        },
        {
            new: true,
        },
    )
    res.status(200).json({ message: 'Done', engNew })
}


export const updateGallery = async (req, res, next) => {
    const { id } = req.authUser;
    const engineer = await EngineerModel.findById(id);
    if (!engineer) {
        return res.status(404).json({ error: 'engineer not found' });
    }

    if (req.files?.length) {

        let ImageArr = []
        for (const file of req.files) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(
                file.path,
                {
                    folder: `${process.env.PROJECT_FOLDER}/Engineer/communityPage/${engineer.customId}`,
                },
            )
            ImageArr.push({ secure_url, public_id })
        }
        let public_ids = []
        for (const image of engineer.Gallery) {
            public_ids.push(image.public_id)
        }
        await cloudinary.api.delete_resources(public_ids)
        engineer.Gallery = ImageArr

    }
    await engineer.save()
    return res.status(400).json({ message: "UpdateDone", engineer });
}


export const getEngAccount = async (req, res, next) => {

    const { id } = req.authUser
    const user = await EngineerModel.findById(id)
    if (user) {
        return res.status(200).json({ message: 'done', user })
    }
    res.status(404).json({ message: 'in-valid Id' })
}


export const profilePic = async (req, res, next) => {
    const { id } = req.authUser

    if (!req.file) {
        return next(new Error('please upload pictures', { cause: 400 }))
    }

    const customId = nanoid()
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: `${process.env.PROJECT_FOLDER}/Engineer/ProfilePic/${customId}`,
        resource_type: 'image'
    })
    const engineer = await EngineerModel.findByIdAndUpdate(id, {
        profilePic: {
            secure_url,
            public_id,
        },
        new: true,

    },
    )
    if (engineer) {
        return res.status(200).json({ messege: 'Done', engineer });
    }

}

export const deleteGallery = async (req, res, next) => {
    const { id } = req.authUser

    const engineer = await EngineerModel.findById(id
    )
    let public_ids = []
    let ImageArr = []
    for (const image of engineer.Gallery) {
        public_ids.push(image.public_id)
    }

    if (!(public_ids.length)) {
        return next(new Error('Not pic Found', { cause: 400 }))
    }

    const deleteCloud = await cloudinary.api.delete_all_resources(public_ids)
    if (deleteCloud) {
        engineer.Gallery = ImageArr
    }

    await cloudinary.api.delete_folder(
        `${process.env.PROJECT_FOLDER}/Engineer/communityPage/${engineer.customId}`
    )

    await engineer.save()
    res.status(200).json({ messsage: 'Deleted Done', engineer })
}



export const logOut = async (req, res, next) => {
    const { id } = req.authUser
    const { userid } = req.query

    const userExcest = await EngineerModel.findById(userid)
    if (!userExcest) {
        return res.json({ message: 'invaled user id' })
    }
    if (userExcest._id.toString() !== id.toString()) {
        return res.json({ message: 'can not take this action' })
    }
    await EngineerModel.findByIdAndUpdate(id, {
        status: 'Offline'
    })

    await EngineerModel.findByIdAndDelete(id, {
        token,
    })
    res.json({ message: "log out done" })
}

//Get All Posts  

export const getAllPosts = async (req, res, next) => {
    const { id } = req.authUser
    if (!await EngineerModel.findById(id)) {
        return next(
            new Error('invaild id ', { cause: 400 }),
        )
    }
    const posts = await EngineerModel.find({}, { Gallery: 1 })

    res.status(200).json({ message: 'Done', posts })
}

// update Engineer

export const updateProfile = async (req, res, next) => {
    const { id } = req.authUser
    const { userid } = req.params
    const { userName, phoneNumber, address } = req.body

    if (!await EngineerModel.findById(id)) {
        return next(
            new Error('invaild id ', { cause: 400 }),
        )
    }


    const eng = await EngineerModel.findById(userid)
    if (!eng) {
        return next(new Error('invalud ENg Id', { cause: 400 }))
    }

    {
       if(address){ // different from old name
        if (eng.address == address) {
            return next(
                new Error('please enter different name from the old engineer address', {
                    cause: 400,
                }),
            )
        }}
        else if(userName){
            if (eng.userName == userName) {
                return next(
                    new Error('please enter different name from the old engineer name', {
                        cause: 400,
                    }),
                )
            }
        }
       else {
        if (eng.phoneNumber == phoneNumber) {
            return next(
                new Error('please enter different name from the old engineer phoneNumber', {
                    cause: 400,
                }),
            )
        }
    }

        eng.phoneNumber = phoneNumber
        eng.userName = userName
        eng.address = address
        eng.UpdatedBy = id
    }



    await eng.save()
    res.status(200).json({ message: 'Updated Done', eng })
}

//get User by Eng

export const getuserBy = async (req, res, next) => {
    const { id } = req.authUser
    const { userid } = req.params
    const eng = await EngineerModel.findById(id);
    if (!eng) {
      return res.status(404).json({ error: 'eng not found' });
    }
    const user = await UserModel.findById(userid);
    if (!user) {
      return res.status(404).json({ error: 'user not found' });
    }
    res.status(200).json({ message: 'Done', user })
  }