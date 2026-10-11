import express from "express";
import * as controller from "./reporting.controller.js";

const router = express.Router();


router.get('/get-totals', controller.getTotals);
router.get('/get-cumulative-totals', controller.getCumulativeTotals);
router.get('/get-cumulative-drilldown/:field/:group', controller.getCumulativeDrilldown);


export default router;