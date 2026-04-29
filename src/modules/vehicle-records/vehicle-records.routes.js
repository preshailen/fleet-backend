import express from "express";
import * as controller from "./vehicle-records.controller.js";
import multer from "multer";
import path from "path";
import crypto from "crypto";

const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    const unique = crypto.randomUUID();
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only .xlsx files are allowed"), false);
  }
};

const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 }, fileFilter });

const router = express.Router();

router.post("/upload-records",upload.single("file"),controller.uploadRecords);
router.get("/get-records", controller.getRecords);

export default router;