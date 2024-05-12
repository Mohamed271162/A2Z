import { Schema, model } from 'mongoose'


const userSchema = new Schema(
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
        Repass: {
            type: String,
        },

        status: {
            type: String,
            default: 'Offline',
            enum: ['Online', 'Offline'],
        },

        isConfirmed: {
            type: Boolean,
            default: false,
        },

        token:String,
        customId:String,


    },
    { timestamps: true },
)

export const UserModel = model('User', userSchema)
