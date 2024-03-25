import path from 'path';
import fs from 'fs';
import { conversions } from '../constants/supportedConversions.mjs';
import { deleteFilesHelper, updateFileHelper, uploadFilesHelper } from '../helpers/files.helper.mjs';
import { convertFromCSVToJson, convertFromPdfToDocx, convertUsingFFMPEG } from '../helpers/convertFiles.helper.mjs';
import { upload } from '../routes/files.mjs';

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
    // Extracting 'name' parameter from request query
    const { query: { name } } = req;

    // If 'name' parameter is provided
    if (name) {
        // Constructing file path
        const filePath = path.join(process.cwd(), 'processed', name);

        // Checking if file exists
        if (fs.existsSync(filePath)) {
            // Downloading file
            return res.download(filePath, (err) => {
                // Handling potential errors during download
            });
        }
        else {
            // Returning 404 if file not found
            return res.status(404).json({ success: false, error: "File not found" });
        }
    }
    else {
        // If 'name' parameter is not provided, list all files belonging to the user
        await fs.readdir(path.join(process.cwd(), 'processed').toString(), (err, files) => {
            if (err) {
                // Handling directory read error
                return res.status(500).json({ success: false, error: 'Failed to read directory' });
            } else {
                // Filtering user's files based on username
                const userFiles = files.filter(file => file.startsWith(req.user.username.toLocaleLowerCase()));

                // Returning list of user's files
                return res.status(200).json({ success: true, message: "No name query provided", files: userFiles });
            }
        });
    }
}

/**
 * @description 
 * Function to handle the uploading of files. 
 * 
 * Processes the uploaded files, renames them, saves metadata to the user's document,
 * 
 * and moves them to a designated directory ('processed').
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
 * Deletes files from the `'processed'` directory and removes corresponding metadata from the user's document.
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
 * @description 
 * 
 * 
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */
const convertFile = async (req, res) => {
    const { file, query: { from, to } } = req;
    const uploadedExtension = path.extname(file.originalname).toLowerCase();
    if (!file) return res.status(400).json({ success: false, error: "No file provided" });
    if (!from || !to) return res.status(400).json({ success: false, error: "From and To params are required" });
    if (!conversions.has(from.toLowerCase()) || !conversions.get(from.toLowerCase())) return res.status(400).json({ success: false, error: "Unsupported conversion: " + from + " to " + to });
    if (uploadedExtension !== `.${from.toLowerCase()}`) {
        return res.status(400).json({ success: false, error: "Uploaded file does not match the specified 'from' format" });
    }
    const originalName = file.originalname;
    const pathOriginal = file.path;
    switch (conversions.get(from.toLowerCase())) {
        case 'docx':
            return await convertFromPdfToDocx(file, originalName, pathOriginal, res);
        case 'mp3':
            return await convertUsingFFMPEG(pathOriginal, originalName, file, res, 'mp3');
        case 'wav':
            return await convertUsingFFMPEG(pathOriginal, originalName, file, res, 'wav');
        case 'mp4':
            return await convertUsingFFMPEG(pathOriginal, originalName, file, res, 'mp4');
        case 'json':
            return await convertFromCSVToJson(pathOriginal, originalName, file, res);
        default:
            await fs.unlink(file.path, (unlinkErr) => { });
            return res.status(400).json({ success: false, error: `Unsupported conversion: ${from} to ${to}` });
    }

}

const multerMiddleWare = (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
        next();
    })
}


export { getFile, uploadFiles, deleteFiles, updateFile, convertFile, multerMiddleWare }