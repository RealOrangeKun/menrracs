// Multer module to handle the file uploads
import multer from 'multer';
// Storage object to access the google cloud storage
import { Storage } from '@google-cloud/storage';


// Setup GCS to store files
const storage = new Storage({
    projectId: process.env.PROJECT_ID,
    keyFilename: process.env.PATH_GC

})
// Set up multer middleware for single file upload
export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 200
    }
}).single('file');
// Set up the bucket for storing the files
export const bucket = storage.bucket('menracs-storage-1')
// Set up multer middleware for multiple file upload
export const uploads = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 200
    }
}).array('files');