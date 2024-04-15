import { deleteFilesHelper, updateFileHelper, uploadFilesHelper } from '../helpers/files.helper.mjs';
import { bucket, upload, uploads } from '../constants/filesConstants.mjs';
import { redisClient } from '../constants/redisClient.mjs'
import fs from 'fs'
import path from 'path';
import mime from 'mime-types'

/**
 * @description 
 * Function to get user's file or list user's files if no file name is provided.
 * 
 * If a file name is provided in the query, the function attempts to locate and download the file.
 * 
 * If no file name is provided, it lists all files belonging to the requesting user.
 * 
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */

const getFile = async (req, res) => {
    try {
        // Extracting 'file' parameter from request query
        const { query: { file } } = req;

        // If 'name' parameter is provided
        if (file) {
            // Constructing file path in the bucket
            const filePath = `${req.user.username.toLowerCase()}/${file}`;

            // Check if the file exists in the bucket
            const [exists] = await bucket.file(filePath).exists();

            if (exists) {
                // Set response headers
                res.setHeader('Content-Type', mime.contentType(file));
                res.setHeader('Content-disposition', `attachment; filename=${file}`);

                // Get the file data from Google cloud
                const [fileData] = await bucket.file(filePath).download();

                // Define the path for the file
                const tempPath = path.join(process.cwd(), 'temp', file);

                // Write the file in the temp folder
                fs.writeFileSync(tempPath, fileData, (err) => {
                    if (err)
                        throw err;
                });

                // Get the file size to set the response header
                fs.statSync(tempPath, (err, stats) => {
                    if (err) throw err;
                    res.setHeader('Content-Length', stats.size)
                })

                // Download the file from the temp folder then delete it from the folder
                return res.download(tempPath, async (err) => {
                    fs.unlinkSync(tempPath, (err) => { if (err) console.log(err); })
                    if (err)
                        throw err;
                });
            } else {
                // Return 404 if file not found
                return res.status(404).json({ success: false, error: "File not found" });
            }
        } else {
            // If 'name' parameter is not provided, list all files belonging to the user
            const [files] = await bucket.getFiles({ prefix: `${req.user.username.toLowerCase()}/` });
            const userFiles = files.map(file => file.name.split('/').pop());
            const response = { success: true, message: "No name query provided", files: userFiles };
            redisClient.setEx(`${req.user.id}:${req.method}:${req.baseUrl}`, 60, JSON.stringify(response));


            // Return list of user's files
            return res.status(200).json(response);
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
}

/**
 * @description 
 * Function to handle the uploading of files. 
 * 
 * Processes the uploaded files, renames them, saves metadata to the user's document,
 * 
 * and moves them to a designated directory (<username>/<filename>).
 * 
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */
const uploadFiles = async (req, res) => {
    // Retrieving uploaded files from request
    const uploadedFiles = req.files;

    // Checking if files were provided
    if (uploadedFiles && uploadedFiles.length > 0) {
        // Array to store names of processed files
        return await uploadFilesHelper(uploadedFiles, req, res);
    } else {
        // Handling case where no files were provided
        res.status(400).json({ success: false, error: "No file/files provided in the form body" });
    }
}


/**
 * @description 
 * Function to delete one or more files. 
 * 
 * Deletes files from the `<username>/` directory and removes corresponding metadata from the user's document.
 * 
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */
const deleteFiles = async (req, res) => {
    // Extracting 'files' parameter from request query
    const { files } = req.query;

    // Handling case where no 'files' parameter is provided
    if (!files) {
        return res.status(400).json({ success: false, error: "No files provided or invalid format" });
    }
    try {
        return await deleteFilesHelper(files, req, res);
    } catch (error) {
        // Handling deletion error
        res.status(500).json({ success: false, error: "Failed to delete files" })
    }
}

/**
 * @description 
 * Function to update a file. 
 * 
 * Renames the file and updates its metadata in the user's document.
 * 
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */
const updateFile = async (req, res) => {
    // Retrieving 'file' and 'name' parameters from request
    const { file } = req;

    // Handling case where 'name' or 'file' parameters are not provided
    if (!file) {
        return res.status(400).json({ success: false, error: "No files provided or invalid format" });
    }

    try {
        return await updateFileHelper(file, req, res);
    } catch (error) {
        // Handling file updating error
        return res.status(500).json({ success: false, error: "File updating failed" });
    }
}


/**
 * @description Middleware for handling file uploads using Multer.
 * 
 * This middleware function wraps around Multer's upload function to handle file uploads.
 * It checks for any errors that occur during the upload process and sends an appropriate
 * response if an error is encountered.
 * 
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 */
const multerMiddleWareSingle = (req, res, next) => {
    // Invoking Multer's upload function to handle file uploads
    upload(req, res, (err) => {
        // Handling errors during file upload
        if (err) {
            console.error(err);
            // Sending an error response if an error occurs
            return res.status(500).json({ success: false, error: err.message });
        }
        // Proceeding to the next middleware function if no error occurs
        next();
    });

}
/**
 * @description Middleware for handling file uploads using Multer.
 * 
 * This middleware function wraps around Multer's upload function to handle file uploads.
 * It checks for any errors that occur during the upload process and sends an appropriate
 * response if an error is encountered.
 * 
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 */
const multerMiddleWareMultiple = (req, res, next) => {
    uploads(req, res, (err) => {
        // Handling errors during file upload
        if (err) {
            // Sending an error response if an error occurs
            return res.status(500).json({ success: false, error: err.message });
        }
        // Proceeding to the next middleware function if no error occurs
        next();
    });
}


export { getFile, uploadFiles, deleteFiles, updateFile, multerMiddleWareSingle, multerMiddleWareMultiple }