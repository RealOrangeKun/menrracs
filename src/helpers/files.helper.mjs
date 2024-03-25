import fs from 'fs';
import path from 'path';
import User from '../models/user.schema.mjs';


/**
 * 
 * @param {File} file 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const updateFileHelper = async (file, req, res) => {
    // Checking if the user added their username in the query or not
    const originalName = file.originalname;
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
    return res.status(200).json({ success: true, message: "File updated successfully" });
}

export const deleteFilesHelper = async (files, req, res) => {
    // Array to store deletion results
    const deletionResults = [];
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
    return res.status(200).json({ success: true, deletionResults });
}

export const uploadFilesHelper = async (uploadedFiles, req, res) => {
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
            await fs.unlink(file.path, (unlinkErr) => { console.error("Couldn't delete binary file"); });
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
                await fs.unlink(file.path, (unlinkErr) => { console.error("Couldn't delete binary file"); });
            }
        });

        // Storing processed file name
        processedFiles.push(newFileName);
    }

    // Responding based on the processing outcome
    if (processedFiles.length === 0) {
        return res.status(400).json({ success: false, error: "Files already in directory" });
    } else if (processedFiles.length <= uploadedFiles.length) {
        return res.status(201).json({ success: true, message: "New files processed and saved successfully" });
    }
}