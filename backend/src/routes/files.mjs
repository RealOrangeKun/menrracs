import { Router } from 'express';
import { deleteFiles, getFile, multerMiddleWareMultiple, multerMiddleWareSingle, updateFile, uploadFiles } from '../controllers/files.controller.mjs';

const router = Router();

// Route for handling file uploads
router.post('/', multerMiddleWareMultiple, uploadFiles);

// Route for retrieving files
router.get('/', getFile);

// Route for deleting files
router.delete('/', deleteFiles);

// Route for updating files
router.put('/', multerMiddleWareSingle, updateFile);


export default router;
