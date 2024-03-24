import { Router } from 'express';
import multer from 'multer';
import { convertFile, deleteFiles, getFile, updateFile, uploadFiles } from '../controllers/files.controller.mjs';

const upload = multer({ dest: 'uploads/' })
const router = Router()


router.post('/', upload.array('files'), uploadFiles);

router.get('/', getFile)

router.delete('/', deleteFiles)

router.put('/', upload.single('file'), updateFile)

router.post('/convert', upload.single('file'), convertFile)

export default router;