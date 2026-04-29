import * as vehicleRecordsService from './vehicle-records.service.js';
import Busboy from "busboy";

export const uploadRecords = (req, res) => {
  const busboy = Busboy({ headers: req.headers });

  let processingPromise;

  busboy.on("file", (fieldname, file) => {
    processingPromise = uploadRecords(file);
  });

  busboy.on("finish", async () => {
    try {
      if (!processingPromise) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const result = await processingPromise;
      res.json(result);

    } catch (err) {
      res.status(400).json({
        message: err.message,
        details: err.details || []
      });
    }
  });

  req.pipe(busboy);
};
export const getRecords = async(req, res) => {
  try {
    res.status(200).json(await vehicleRecordsService.getRecords(req));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}