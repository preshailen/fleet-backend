import * as reportingService from './reporting.service.js';


export const getTotals = async(req, res) => {
  try {
    res.status(200).json(await reportingService.getTotals());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export const getCumulativeTotals = async(req, res) => {
  try {
    res.status(200).json(await reportingService.getCumulativeTotals());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export const getCumulativeDrilldown = async (req, res) => {
  try {
    res.status(200).json(await reportingService.getCumulativeDrilldown(req.field, req.group))
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
}
