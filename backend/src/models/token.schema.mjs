import { Schema, SchemaTypes, model } from "mongoose";
import { tokenTypes } from "../constants/tokenConstants.mjs";

const tokenSchema = new Schema({
    token: {
        type: String,
        required: true,
        index: true
    },
    user: {
        type: SchemaTypes.ObjectId,
        ref: 'User',
        required: true
    },
    expires: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        enum: Object.values(tokenTypes)
    },
}, { timestamps: true })

const Token = model('Token', tokenSchema);
export default Token;