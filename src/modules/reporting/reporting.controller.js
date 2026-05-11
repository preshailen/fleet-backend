import * as reportingService from './reporting.service.js';


export const getTotals = async(req, res) => {
  try {
    res.status(200).json(await reportingService.getTotals());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}