import { Router } from 'express';
import multer from 'multer';
import fs from 'fs'
import path from 'path';

const upload = multer({ dest: 'uploads/' })
const router = Router()


router.post('/upload', upload.array('files'), async (req, res) => {
    const uploadedFiles = req.files;
    if (uploadedFiles && uploadedFiles.length > 0) {
        const processedFiles = [];
        for (const file of uploadedFiles) {
            const originalName = file.originalname;
            const parts = new Date().toDateString().split(' ');
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
                    await fs.unlink(file.path, (unlinkErr) => { });
                }
            });
            processedFiles.push(newFileName);
        }
        if (processedFiles.length == 0) {
            res.status(400).json({ success: false, error: "Files already in directory" })
        }
        else if (processedFiles.length <= uploadedFiles.length) {
            res.status(201).json({ success: true, message: "New files processed and saved successfully" });
        }
    } else {
        res.status(400).json({ success: false, error: "No file/files provided in the form body" });
    }
});


router.get('/', (req, res) => {
    const { query: { name } } = req
    if (name) {
        const filePath = path.join(process.cwd(), 'processed', name);
        if (fs.existsSync(filePath)) {
            res.download(filePath, (err) => {
                if (err) res.status(500).json({ success: false, error: error.message })
                else res.status(200).json({ success: true, message: "File downloaded sucessfully" })
            })
        }
        else {
            res.status(404).json({ success: false, error: "File not found" })
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
})
export default router;