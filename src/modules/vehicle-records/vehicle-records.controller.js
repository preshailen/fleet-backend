import * as vehicleRecordsService from './vehicle-records.service.js';
import ExcelJS from 'exceljs';
import fs from 'fs';

export const uploadRecords = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'File does not exist' })
    }
    const buffer = fs.readFileSync(file.path);
    const validFile = vehicleRecordsService.isExcelFile(buffer, file);
    const validContent = await vehicleRecordsService.validateExcelContent(buffer);
    if(!validFile || !validContent) {
      return res.status(400).json({ message: 'Invalid excel file'})
    }
    res.status(201).json(await vehicleRecordsService.uploadRecords(buffer));
  } catch (error) {
    res.status(500).json({ error });
  }
}
export const getRecords = async(req, res) => {
  try {
    res.status(200).json(await vehicleRecordsService.getRecords(req));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
