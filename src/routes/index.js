import express from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import emailRoutes from '../modules/email/email.routes.js';
import requisitionRoutes from '../modules/requisition/requisition.routes.js';
import userRoutes from '../modules/users/user.routes.js';


const router = express.Router();

router.use('/auth', authRoutes);
router.use('/email', emailRoutes);
router.use('/requisition', requisitionRoutes);
router.use('/user', userRoutes);

export default router;