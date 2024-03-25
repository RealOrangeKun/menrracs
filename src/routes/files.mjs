import { Router } from 'express';
import multer from 'multer';
import { convertFile, deleteFiles, getFile, multerMiddleWare, updateFile, uploadFiles } from '../controllers/files.controller.mjs';

export const upload = multer({ dest: 'uploads/' }).single('file')
const router = Router()
const uploads = multer({ dest: 'uploads/' })

router.post('/', uploads.array('files'), uploadFiles);

router.get('/', getFile)

router.delete('/', deleteFiles)

router.put('/', multerMiddleWare, updateFile)

router.post('/convert', multerMiddleWare, convertFile)

export default router;
