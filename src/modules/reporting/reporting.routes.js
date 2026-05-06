import express from "express";
import * as controller from "./reporting.controller.js";

const router = express.Router();


router.get('/get-totals/:period', controller.getTotals);

export default router;