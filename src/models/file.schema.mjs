import { Schema } from "mongoose";

const fileSchema = new Schema({
    fileName: {
        type: String,
        required: [true, 'File name is required']
    },
    fileType: {
        type: String,
        required: [true, "File type is required"]
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    updatedAt: {
        type: Date,
        default: new Date()
    }
})

export { fileSchema }