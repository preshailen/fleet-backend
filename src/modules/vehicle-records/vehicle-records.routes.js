import express from 'express';
import * as controller from './vehicle-records.controller.js';
import multer from 'multer';

const upload = multer({ 
    storage: multer.diskStorage({ destination: './uploads', filename: (req, file, cb) => cb(null, file.originalname) }), 
    limits: { fileSize: 25 * 1024 * 1024 }
});
const router = express.Router();

router.post('/upload-records', upload.single('file'), controller.uploadRecords);
router.get('/get-records', controller.getRecords);

export default router;