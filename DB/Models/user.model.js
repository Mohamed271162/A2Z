import { Schema, model } from 'mongoose'
import mongoose from "mongoose";


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
            required: true,
        },

        status: {
            type: String,
            default: 'Offline',
            enum: ['Online', 'Offline'],
        },


    },
    { timestamps: true },
)

export const UserModel = model('User', userSchema)
