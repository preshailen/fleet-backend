import * as requisitionService from './requisition.service.js';

export const getRequisitions = async (req, res) => {
  try {
    res.status(200).json(await requisitionService.getRequisitions(req));
  } catch (err) {
    res.status(500).json({ message: err.message });
  } 
}
export const getRequisitionById = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'Id is missing'})
    }
    res.status(200).json(await requisitionService.getRequisitionById(req.params.id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
export const getAttachedQuotes = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'Id is missing'})
    }
    res.status(200).json(await requisitionService.getAttachedQuotes(req.params.id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
export const getSignedPdfUrl = async (req, res) => {
  try {
    if (!req.params.url) {
      return res.status(400).json({ message: 'Url is missing'})
    }
    res.status(200).json(await requisitionService.getSignedPdfUrl(req.params.url));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
export const getSupplierLeadTime = async (req, res) => {
  try {
    const { supplierEmail } = req.query;
    res.status(200).json(await requisitionService.getSupplierLeadTime({ supplierEmail }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
export const updateRequisitionStatus = async (req, res) =>{
  try {
    if (!req.params.id || !req.params.status) {
      return res.status(400).json({ message: 'Data is missing'})
    }
    res.status(200).json(await requisitionService.updateRequisitionStatus(req.params.id, req.params.status));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
export const rejectRequisition = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'Id is missing'})
    }
    res.status(200).json(await requisitionService.rejectRequisition(req.params.id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
export const createRequisition = async (req, res) => {
  try {
    const { companyName, department, requestingEmployee, contactNumber, contactEmail, supplierEmail, nameOfDriverAssigned,
            purpose, type, vehicleType, engineSize, fuelType, transmission, colourPreference,
            estimatedMonthlyKms, costCentre, budgetAvailable, estimatedVehicleCost,
            insurance, vehicleTracking, roadworthy, licensingAndRegistration
          } = req.body;
    if (!companyName || !department || !requestingEmployee || !contactNumber || !contactEmail || !supplierEmail || !nameOfDriverAssigned ||
        !purpose || !type || !vehicleType || !engineSize || !fuelType || !transmission ||
        !colourPreference || (estimatedMonthlyKms == null) || !costCentre ||
        (budgetAvailable == null) || (estimatedVehicleCost == null) || (insurance == null) || (vehicleTracking == null) ||
        (roadworthy == null) || (licensingAndRegistration == null)) {
      return res.status(400).json({ message: 'A required field is missing' });
    }
    res.status(201).json(await requisitionService.createRequisition(req.body));
  } catch (error) {
    res.status(500).json({ message: 'Error creating Requisition', error });
  }
}
export const fulfillRequisition = async (req, res) => {
  try {
    const MAX_SIZE = 10 * 1024 * 1024;
    const { id } = req.body;
    const files = req.files || [];
    if (!id || !Array.isArray(files) || files.length < 3) {
      return res.status(400).json({ message: 'Error with the request' });
    }
    const allArePdf = files.every(file => file && file.mimetype === 'application/pdf' && file.originalname?.toLowerCase().endsWith('.pdf') && file.buffer && file.buffer.length > 4 && file.buffer.slice(0, 5).toString() === '%PDF-');
    const isTooBig = files.some(file => file.size > MAX_SIZE);
    const hasDuplicates = new Set(files.map(f => f.originalname + f.size)).size !== files.length;
    if (!allArePdf || isTooBig || hasDuplicates) {
      return res.status(400).json({ message: 'Error with the request' });
    }
    res.status(201).json(await requisitionService.fulfillRequisition(id, files));
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error creating Fulfillment', error });
  }
}
export const selectPreferredQuote = async (req, res) => {
  try {
    if (!req.params.requisitionId || !req.params.quoteId) {
      return res.status(400).json({ message: 'One or more Ids are missing'})
    }
    res.status(200).json(await requisitionService.selectPreferredQuote(req.params.requisitionId, req.params.quoteId));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
