import express from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import requisitionRoutes from '../modules/requisition/requisition.routes.js';
import userRoutes from '../modules/users/user.routes.js';
import vehicleRecordsRoutes from '../modules/vehicle-records/vehicle-records.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/requisition', requisitionRoutes);
router.use('/user', userRoutes);
router.use('/vehicle-records', vehicleRecordsRoutes)

export default router;