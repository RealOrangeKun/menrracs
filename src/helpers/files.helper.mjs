import User from '../models/user.schema.mjs';
import { bucket } from '../constants/filesConstants.mjs';


/**
 * Updates a file and its metadata.
 * 
 * @description Renames the file and updates its metadata in the user's document.
 * 
 * @param {File} file - The file object representing the original file.
 * @param {import('express').Request} req - The Express request object containing user information.
 * @param {import('express').Response} res - The Express response object used to send the response.
 * 
 * @returns {Promise<void>} A promise that resolves after the file is updated and the response is sent.
 */
export const updateFileHelper = async (file, req, res) => {
    try {
        // Generate a new file name and construct the file path in the bucket
        const originalName = file.originalname;
        const newPath = `${req.user.username.toLowerCase()}/${originalName}`;

        const [exists] = await bucket.file(newPath).exists();

        if (!exists) {
            return res.status(404).json({ success: false, error: "File not found" });
        }

        await bucket.file(newPath).move(newPath);

        const user = await User.findById(req.user.id);
        const fileData = user.files.find(f => f.fileName === originalName);
        if (fileData) {
            fileData.fileName = newFileName;
            fileData.updatedAt = new Date();
            await user.save();
        }

        return res.status(200).json({ success: true, message: "File updated successfully" });
    } catch (error) {
        console.error('Error updating file:', error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
}


/**
 * Deletes files and updates metadata for the deleted files.
 * 
 * @description Deletes the specified files from the file system and updates the metadata
 *              for the deleted files in the user's document.
 * 
 * @param {String[]|String} files - The name(s) of the file(s) to be deleted, or an array of file names.
 * @param {import('express').Request} req - The Express request object containing user information.
 * @param {import('express').Response} res - The Express response object used to send the response.
 * 
 * @returns {Promise<void>} A promise that resolves after the files are deleted and the response is sent.
 */
export const deleteFilesHelper = async (files, req, res) => {
    const user = await User.findById(req.user.id);
    const deletionResults = [];

    try {
        // If 'files' parameter is not an array, convert it to an array
        if (!Array.isArray(files)) {
            files = [files];
        }

        // Iterating through files to delete
        for (const fileName of files) {
            const filePath = `${req.user.username.toLowerCase()}/${fileName}`; // Construct the file path in the bucket

            // Check if the file exists in the bucket
            const [exists] = await bucket.file(filePath).exists();

            if (exists) {
                // If the file exists, delete it
                await bucket.file(filePath).delete();
                user.files = user.files.filter(f => f.fileName !== fileName);
                await user.save()
                deletionResults.push({ fileName, success: true, message: "File deleted successfully" });
            } else {
                // If the file doesn't exist, add an entry to deletionResults
                deletionResults.push({ fileName, success: false, error: "File not found" });
            }
        }

        // Respond with the deletion results
        return res.status(200).json({ success: true, deletionResults });
    } catch (error) {
        console.error('Error deleting files:', error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
}


/**
 * Handles the upload of files, processing them and saving metadata.
 * 
 * @description Iterates through the uploaded files, renames them, moves them to the user's cloud storage folder,
 *              saves metadata to the user's document, and deletes temporary files after processing.
 * 
 * @param {File[]} uploadedFiles - An array of file objects representing the uploaded files.
 * @param {import('express').Request} req - The Express request object containing user information.
 * @param {import('express').Response} res - The Express response object used to send the response.
 * 
 * @returns {Promise<void>} A promise that resolves after the files are processed and the response is sent.
 */
export const uploadFilesHelper = async (uploadedFiles, req, res) => {
    const user = await User.findById(req.user.id);
    const processedFiles = [];
    const uploadResults = [];

    // Iterating through uploaded files
    for (const file of uploadedFiles) {
        try {
            // Extracting file details
            const originalName = file.originalname;
            const newPath = `${req.user.username.toLowerCase()}/${originalName}`;
            const blob = bucket.file(newPath);
            const [exists] = await blob.exists();
            if (exists) {
                uploadResults.push({ fileName: originalName, success: false, error: "File already exists" })
                continue;
            }
            const blobStream = blob.createWriteStream();

            await new Promise((resolve, reject) => {
                blobStream.on('error', (err) => {
                    uploadResults.push({ fileName: originalName, success: false, error: err.message })
                    reject(err);
                });

                blobStream.on('finish', async () => {
                    processedFiles.push(originalName);
                    uploadResults.push({ fileName: originalName, success: true, error: "File uploaded successfully" });
                    user.files.push({ fileName: originalName, fileType: originalName.split('.').pop() });
                    await user.save();
                    resolve();
                });
                blobStream.end(file.buffer);
            });
        } catch (error) {
            console.error('Error uploading file:', error);
            return res.status(500).json({ success: false, error: "Couldn't upload file" });
        }
    }
    // Responding based on the processing outcome after all files are processed
    if (processedFiles.length === 0) {
        return res.status(400).json({ success: false, uploadResults });
    } else {
        return res.status(201).json({ success: true, message: "New files processed and saved successfully", uploadResults });
    }
}