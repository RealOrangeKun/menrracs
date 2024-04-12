// Import the schema from mongoose
import { Schema } from "mongoose";

// Define the file schema
const fileSchema = new Schema({
    // The name of the filw
    fileName: {
        type: String,
        required: [true, 'File name is required']
    },
    // The type of the file
    fileType: {
        type: String,
        required: [true, "File type is required"]
    },
    // The date the file was created at
    createdAt: {
        type: Date,
        default: new Date()
    },
    // The date the file was last updated at
    updatedAt: {
        type: Date,
        default: new Date()
    }
})

export { fileSchema }