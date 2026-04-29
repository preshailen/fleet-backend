import Requisition from '../../models/requisition/requisition.model.js';
import { sendEmail } from '../email/email.service.js';
import requisitionEmailTemplate from '../email/templates/requisiton.template.js';
import pagination from '../../utils/pagination.js';
import { uploadToR2, deleteFromR2, getSignedUrlFromR2 } from '../../utils/r2uploader.js';
import Quote from '../../models/requisition/quote.model.js';
import quotesUploadedTemplate from '../email/templates/quotesUploaded.template.js'

export const getRequisitions = async (req) => {
  return await pagination(Requisition, req.query, {});
}
export const getRequisitionById = async (id) => {
  return await Requisition.findById(id);
}
export const getAttachedQuotes = async (id) => {
  return await Quote.find({ requisition: id });
}
export const getSignedPdfUrl = async (url) => {
  return await getSignedUrlFromR2(url);
}
export const getSupplierLeadTime = async ({ supplierEmail } = {}) => {
  const match = {
    status: { $ne: 'submitted' },
    fulfillmentDate: { $ne: null }
  };
  if (supplierEmail && (supplierEmail !== 'All')) {
    match.supplierEmail = supplierEmail;
  }
  const result = await Requisition.aggregate([
    { $match: match },
    { 
      $match: {
        $expr: {
          $gt: ['$fulfillmentDate', '$createdAt']
        }
      }
    },
    {
      $project: {
        durationMinutes: {
          $divide: [
            { $subtract: ["$fulfillmentDate", "$createdAt"] },
            1000 * 60
          ]
        }
      }
    },
    {
      $group: {
        _id: '$status',
        avgTime: { $avg: "$durationMinutes" },
        minTime: { $min: "$durationMinutes" },
        maxTime: { $max: "$durationMinutes" },
        total: { $sum: 1 }
      }
    }
  ]);
  return result[0] || { avgTime: 0, minTime: 0, maxTime: 0, total: 0 };
}
export const updateRequisitionStatus = async (id, status) =>{
  const requisition = await Requisition.findById(id);
  requisition.status = status;
  await requisition.save();
  return true;
}
export const rejectRequisition = async (id) => {
  const requisition = await Requisition.findById(id);
  const quotes = await Quote.find({ requisition: id });
  requisition.status = 'rejected';
  await requisition.save();
  quotes.map(j => deleteFromR2(j.pdfUrl))
  await Quote.deleteMany({ requisition: id });
  return true;
}
export const createRequisition = async (requisition) => {
  const response = await sendEmail({
    to: requisition.supplierEmail,
    subject: "New Vehicle Requisition (do not reply)",
    html: requisitionEmailTemplate(await Requisition.create(requisition))
  });
  return true;
}
export const fulfillRequisition = async(id, files) => {
  const requisition = await Requisition.findById(id);
  if (!requisition) throw new Error('Requisition not found');
  const uploads = await Promise.all(files.map(file => uploadToR2(file)));

  const quotes = await Promise.all(uploads.map((url, index) => Quote.create({ requisition: id, preferredQuote: false, pdfUrl: url, fileName: files[index].originalname })));
  requisition.fulfillmentDate = new Date();
  requisition.status = 'fulfilled';
  await requisition.save();
  const response = await sendEmail({
    to: requisition.contactEmail,
    subject: "Quotes uploaded  (do not reply)",
    html: quotesUploadedTemplate(requisition.id)
  });
  return true;
}
export const selectPreferredQuote = async (requisitionId, quoteId) => {
  const requisition = await Requisition.findById(requisitionId);
  requisition.status = 'quoteSelected';
  const quote = await Quote.findOne({ _id: quoteId, requisition: requisitionId });
  quote.preferredQuote = true;
  await requisition.save();
  await quote.save()
  return true;
}