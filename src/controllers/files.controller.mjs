import path from 'path';
import User from '../models/user.schema.mjs';
import fs from 'fs';

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
        const processedFiles = [];

        // Iterating through uploaded files
        for (const file of uploadedFiles) {
            // Extracting file details
            const originalName = file.originalname;
            const fileExtension = path.extname(originalName).toLowerCase();
            const newFileName = req.user.username.toLowerCase() + '-' + originalName;
            const newPath = 'processed/' + newFileName;

            // Checking if file with the same name already exists
            if (fs.existsSync(newPath)) {
                // Deleting duplicate file
                await fs.unlink(file.path, (unlinkErr) => { });
                continue;
            }

            // Renaming and moving the file
            await fs.rename(file.path, newPath, async (err) => {
                if (err) {
                    // Handling file processing error
                    return res.status(500).json({ error: 'File processing failed' });
                } else {
                    // Saving file metadata to user's document
                    const user = await User.findById(req.user.id);
                    user.files.push({ fileName: originalName, fileType: fileExtension, createdAt: new Date() });
                    await user.save();

                    // Deleting temporary file after processing
                    await fs.unlink(file.path, (unlinkErr) => { });
                }
            });

            // Storing processed file name
            processedFiles.push(newFileName);
        }

        // Responding based on the processing outcome
        if (processedFiles.length === 0) {
            res.status(400).json({ success: false, error: "Files already in directory" });
        } else if (processedFiles.length <= uploadedFiles.length) {
            res.status(201).json({ success: true, message: "New files processed and saved successfully" });
        }
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

    // Array to store deletion results
    const deletionResults = [];

    try {
        // If 'files' parameter is not an array
        if (!Array.isArray(files)) {
            const fileName = files;
            const name = files.split('-');
            // If user didn't provide username in query then it will be added in filepath2
            const filePath = path.join(process.cwd(), 'processed', fileName),
                filePath2 = path.join(process.cwd(), 'processed', `${req.user.username.toLocaleLowerCase()}-${name[0]}`);

            // If file exists at first potential location
            if (fs.existsSync(filePath)) {
                // If file is owned by current user
                if (name[0] !== req.user.username) {
                    deletionResults.push({ fileName, success: false, error: "Failed to delete file" });
                } else {
                    // Deleting file
                    await fs.unlink(filePath, async (err) => {
                        if (err) {
                            // Push the error
                            deletionResults.push({ fileName, success: false, error: "Failed to delete file" });
                        } else {
                            // Removing file metadata from user's document
                            const user = await User.findById(req.user.id);
                            user.files = user.files.filter(file => file.fileName !== fileName);
                            await user.save();
                            deletionResults.push({ fileName, success: true, message: "File deleted successfully" });
                        }
                    });
                }
            }
            // Using second path if username isn't provided
            else if (fs.existsSync(filePath2)) {
                // Deleting file
                await fs.unlink(filePath2, async (err) => {
                    if (err) {
                        deletionResults.push({ fileName, success: false, error: "Failed to delete file" });
                    }
                });

                // Removing file metadata from user's document
                const user = await User.findById(req.user.id);
                user.files = user.files.filter(file => file.fileName !== fileName);
                await user.save();
                deletionResults.push({ fileName, success: true, message: "File deleted successfully" });
            }
            // If file not found
            else {
                deletionResults.push({ fileName, success: false, error: "File not found" });
            }
        }
        // If 'files' parameter is an array
        else {
            for (const fileName of files) {
                const name = fileName.split('-');
                const filePath = path.join(process.cwd(), 'processed', fileName),
                    filePath2 = path.join(process.cwd(), 'processed', `${req.user.username.toLocaleLowerCase()}-${name[0]}`);

                // If file exists at first potential location
                if (fs.existsSync(filePath)) {
                    // If file is owned by current user
                    if (name[0] !== req.user.username) {
                        continue;
                    }
                    // Deleting file
                    await fs.unlink(filePath, async (err) => {
                        if (err) {
                            deletionResults.push({ fileName, success: false, error: "Failed to delete file" });
                        } else {
                            // Removing file metadata from user's document
                            const user = await User.findById(req.user.id);
                            user.files = user.files.filter(file => file.fileName !== fileName);
                            await user.save();
                            deletionResults.push({ fileName, success: true, message: "File deleted successfully" });
                        }
                    });
                }
                // If file exists at second potential location
                else if (fs.existsSync(filePath2)) {
                    // Deleting file
                    await fs.unlink(filePath2, async (err) => {
                        if (err) {
                            deletionResults.push({ fileName, success: false, error: "Failed to delete file" });
                        }
                    });

                    // Removing file metadata from user's document
                    const user = await User.findById(req.user.id);
                    user.files = user.files.filter(file => file.fileName !== fileName);
                    await user.save();
                    deletionResults.push({ fileName, success: true, message: "File deleted successfully" });
                }
                // If file not found
                else {
                    deletionResults.push({ fileName, success: false, error: "File not found" });
                }
            }
        }

        // Sending deletion results
        res.status(200).json({ success: true, deletionResults });
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
    const { name } = req.query;

    // Handling case where 'name' or 'file' parameters are not provided
    if (!name || !file) {
        return res.status(400).json({ success: false, error: "No files provided or invalid format" });
    }

    try {
        // Splitting 'name' parameter to extract file details
        const parts = name.split('-');
        // Checking if the user added their username in the query or not
        const filePath = path.join(process.cwd(), 'processed', parts[0] === req.user.username ? name : `${req.user.username}-${name}`);
        const originalName = file.originalname;
        const fileExtension = path.extname(originalName).toLowerCase();
        const newFileName = req.user.username.toLowerCase() + '-' + originalName;
        const newPath = 'processed/' + newFileName;

        // If file does not exist
        if (!fs.existsSync(newPath)) {
            return res.status(404).json({ success: false, error: "File not found" });
        }

        // Renaming and updating file
        await fs.rename(file.path, newPath, async (err) => {
            if (err) {
                return res.status(500).json({ error: 'File processing failed' });
            } else {
                // Updating file metadata in user's document
                const user = await User.findById(req.user.id);
                const fileData = user.files.find(f => f.fileName === file.originalname);
                fileData.updatedAt = new Date();
                await user.save();

                // Deleting temporary file after processing
                await fs.unlink(file.path, (unlinkErr) => { });
            }
        });

        // Sending success response
        res.status(200).json({ success: true, message: "File updated successfully" });
    } catch (error) {
        // Handling file updating error
        res.status(500).json({ success: false, error: "File updating failed" });
    }
}


export { getFile, uploadFiles, deleteFiles, updateFile }