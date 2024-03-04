import { Schema, model } from 'mongoose'
import mongoose from "mongoose";


const EngineerSchema = new Schema(
    {
        userName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        isConfirmed: {
            type: Boolean,
            default: false,
        },


        isOnline: {
            type: Boolean,
            default: true,
        },


        phoneNumber: {
            type: String,
            required: true,
        },
        address: [
            {
                type: String,
                required: true,
            },
        ],
        // role: {
        //     type: String,
        //     default: 'User',
        //     enum: ['User', 'Admin', 'Engineer','Store'],
        //   },
        Gallery: [{
            secure_url: String,
            public_id: String,
            desc: String,
        }],

        licencePicture: {                //شهادة اثبات هويه 
            secure_url: String,
            public_id: String,
        },

        profilePic: {
            secure_url: String,
            public_id: String,
        },


        status: {
            type: String,
            default: 'Offline',
            enum: ['Online', 'Offline'],
        },
        gender: {
            type: String,
            default: 'Not specified',
            enum: ['male', 'female', 'Not specified'],
        },

        addedBy: {
            type: Schema.Types.ObjectId,
            ref: 'Admin',

        },

        UpdatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'Admin',

        },

        deletedBy: {
            type: Schema.Types.ObjectId,
            ref: 'Admin',

        },

        age: Number,
        token: String,
        forgetCode: String,
        customId: String,
    },
    { timestamps: true },
)

export const EngineerModel = model('Engineer', EngineerSchema)


// EngineerSchema.pre('save', function (next, hash) {
//     //   console.log(this.password)
//     this.password = pkg.hashSync(this.password, +process.env.SALT_ROUNDS)
//     //   console.log(this.password)
//     next()
// })

