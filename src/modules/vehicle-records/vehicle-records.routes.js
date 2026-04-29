import express from "express";
import * as controller from "./vehicle-records.controller.js";

const router = express.Router();

router.post("/upload-records", controller.uploadRecords);
router.get("/get-records", controller.getRecords);

export default router;