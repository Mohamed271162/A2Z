import { Schema, model } from 'mongoose'
import mongoose from "mongoose";


const EngineerSchema = new Schema(
    {
        userName: {
            type: String,
            default:'hamody',

        },
        email: {
            type: String,
            unique: true,
            required: true,
        },
        OTP: {
            type: String,
            required: true,
            unique: true,
        },
        isVerify: {
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
            unique: true,
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
        
        phone:{
            type:String,
            default:'+20100000000'
        },

        age: Number,
        token: String,

        customId: String,
    },
    { timestamps: true },
)

export const AdminModel = model('Admin', EngineerSchema)




