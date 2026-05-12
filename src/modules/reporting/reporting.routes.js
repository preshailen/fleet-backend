import express from "express";
import * as controller from "./reporting.controller.js";

const router = express.Router();


router.get('/get-totals', controller.getTotals);
router.get('/get-cumulative-totals', controller.getCumulativeTotals);

export default router;