import path from 'path';
import User from '../models/user.schema.mjs';
import fs from 'fs';

/**
 * @description 
 * 
 * 
 * 
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
const getFile = (req, res) => {
    const { query: { name } } = req
    if (name) {
        const filePath = path.join(process.cwd(), 'processed', name);
        if (fs.existsSync(filePath)) {
            return res.download(filePath, (err) => {
            })
        }
        else {
            return res.status(404).json({ success: false, error: "File not found" })
        }
    }
    else {
        fs.readdir(path.join(process.cwd(), 'processed').toString(), (err, files) => {
            if (err) {
                res.status(500).json({ success: false, error: 'Failed to read directory' });
            } else {
                const userFiles = files.filter(file => file.startsWith(req.user.username.toLocaleLowerCase()));
                res.status(200).json({ success: true, message: "No name query provided", files: userFiles });
            }
        });
    }
}
/**
 * @description 
 * 
 * 
 * 
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
const uploadFiles = async (req, res) => {
    const uploadedFiles = req.files;
    if (uploadedFiles && uploadedFiles.length > 0) {
        const processedFiles = [];
        for (const file of uploadedFiles) {
            const originalName = file.originalname;
            const fileExtension = path.extname(originalName).toLowerCase();
            const newFileName = req.user.username.toLowerCase() + '-' + originalName;
            const newPath = 'processed/' + newFileName;
            if (fs.existsSync(newPath)) {
                await fs.unlink(file.path, (unlinkErr) => { });
                continue;
            }
            await fs.rename(file.path, newPath, async (err) => {
                if (err) {
                    return res.status(500).json({ error: 'File processing failed' });
                } else {
                    const user = await User.findById(req.user.id);
                    user.files.push({ fileName: originalName, fileType: fileExtension, createdAt: new Date() });
                    await user.save();
                    await fs.unlink(file.path, (unlinkErr) => { });
                }
            });
            processedFiles.push(newFileName);
        }
        if (processedFiles.length === 0) {
            res.status(400).json({ success: false, error: "Files already in directory" });
        } else if (processedFiles.length <= uploadedFiles.length) {
            res.status(201).json({ success: true, message: "New files processed and saved successfully" });
        }
    } else {
        res.status(400).json({ success: false, error: "No file/files provided in the form body" });
    }
}

/**
 * @description 
 * 
 * 
 * 
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
const deleteFiles = async (req, res) => {
    const { files } = req.query;
    if (!files) {
        return res.status(400).json({ success: false, error: "No files provided or invalid format" });
    }
    const deletionResults = [];
    try {
        if (!Array.isArray(files)) {
            const fileName = files;
            const name = files.split('-');
            const filePath = path.join(process.cwd(), 'processed', fileName),
                filePath2 = path.join(process.cwd(), 'processed', `${req.user.username.toLocaleLowerCase()}-${name[0]}`);
            if (fs.existsSync(filePath)) {
                if (name[0] !== req.user.username) deletionResults.push({ fileName, success: false, error: "Failed to delete file" });
                else {
                    await fs.unlink(filePath, async (err) => {
                        if (err) {
                            deletionResults.push({ fileName, success: false, error: "Failed to delete file" });
                        } else {
                            const user = await User.findById(req.user.id);
                            user.files = user.files.filter(file => file.fileName !== fileName)
                            await user.save();
                            deletionResults.push({ fileName, success: true, message: "File deleted successfully" });
                        }
                    });
                }
            } else if (fs.existsSync(filePath2)) {
                await fs.unlink(filePath2, async (err) => {
                    if (err) {
                        deletionResults.push({ fileName, success: false, error: "Failed to delete file" });
                    }
                });
                const user = await User.findById(req.user.id);
                user.files = user.files.filter(file => file.fileName !== fileName)
                await user.save();
                deletionResults.push({ fileName, success: true, message: "File deleted successfully" });
            }
            else {
                deletionResults.push({ fileName, success: false, error: "File not found" });
            }
        }
        else {
            for (const fileName of files) {
                const name = fileName.split('-');
                const filePath = path.join(process.cwd(), 'processed', fileName),
                    filePath2 = path.join(process.cwd(), 'processed', `${req.user.username.toLocaleLowerCase()}-${name[0]}`);
                if (fs.existsSync(filePath)) {
                    if (name[0] !== req.user.username) continue;
                    await fs.unlink(filePath, async (err) => {
                        if (err) {
                            deletionResults.push({ fileName, success: false, error: "Failed to delete file" });
                        } else {
                            const user = await User.findById(req.user.id);
                            user.files = user.files.filter(file => file.fileName !== fileName)
                            await user.save();
                            deletionResults.push({ fileName, success: true, message: "File deleted successfully" });
                        }
                    });
                } else if (fs.existsSync(filePath2)) {
                    await fs.unlink(filePath2, async (err) => {
                        if (err) {
                            deletionResults.push({ fileName, success: false, error: "Failed to delete file" });
                        }
                    });
                    const user = await User.findById(req.user.id);
                    user.files = user.files.filter(file => file.fileName !== fileName)
                    await user.save();
                    deletionResults.push({ fileName, success: true, message: "File deleted successfully" });
                }
                else {
                    deletionResults.push({ fileName, success: false, error: "File not found" });
                }
            }
        }
        res.status(200).json({ success: true, deletionResults });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to delete files" })
    }
}
/**
 * @description 
 * 
 * 
 * 
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
const updateFile = async (req, res) => {
    const { file } = req;
    const { name } = req.query;
    if (!name || !file) {
        return res.status(400).json({ success: false, error: "No files provided or invalid format" });
    }
    try {
        const parts = name.split('-')
        const filePath = path.join(process.cwd(), 'processed', parts[0] === req.user.username ? name : `${req.user.username}-${name}`)
        const originalName = file.originalname;
        const fileExtension = path.extname(originalName).toLowerCase();
        const newFileName = req.user.username.toLowerCase() + '-' + originalName;
        const newPath = 'processed/' + newFileName;
        if (!fs.existsSync(newPath)) {
            return res.status(404).json({ success: false, error: "File not found" })
        }
        await fs.rename(file.path, newPath, async (err) => {
            if (err) {
                return res.status(500).json({ error: 'File processing failed' });
            } else {
                const user = await User.findById(req.user.id);
                const fileData = user.files.find(f => f.fileName === file.originalname)
                fileData.updatedAt = new Date();
                await user.save();
                await fs.unlink(file.path, (unlinkErr) => { });
            }
        });
        res.status(200).json({ success: true, message: "File updated successfully" })
    } catch (error) {
        res.status(500).json({ success: false, error: "File updating failed" })
    }

}

export { getFile, uploadFiles, deleteFiles, updateFile }