import * as vehicleRecordsService from './vehicle-records.service.js';
import fs from "fs/promises";

export const uploadRecords = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "File does not exist"
      });
    }
    const result = await vehicleRecordsService.uploadRecords(req.file.path);
    await fs.unlink(req.file.path);
    res.status(201).json(result);
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(400).json({
      message: error.message,
      details: error.details || null
    });
  }
};
export const getRecords = async(req, res) => {
  try {
    res.status(200).json(await vehicleRecordsService.getRecords(req));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}