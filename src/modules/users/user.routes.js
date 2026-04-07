import express from 'express';
import * as controller from './user.controller.js';

const router = express.Router();

router.get("/getSuppliers", controller.getSuppliers);

export default router;