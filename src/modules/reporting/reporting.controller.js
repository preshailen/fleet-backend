import * as reportingService from './reporting.service.js';


export const getTotals = async(req, res) => {
  try {
    if (!req.params.period) {
      return res.status(400).json({ message: 'Period is missing'});
    }
    res.status(200).json(await reportingService.getTotals(req.params.period));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}