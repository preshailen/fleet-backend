import express from 'express';
import controller from './email.controller.js';

const router = express.Router();

router.post("/send-email", controller.sendemail);

export default router;