import express from 'express';
import * as controller from './auth.controller.js';
import { authenticate, authorize } from './auth.middleware.js';

const router = express.Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/refresh", controller.refresh);
router.post("/logout", authenticate, controller.logout);

router.get("/me", authenticate, controller.me);

export default router;