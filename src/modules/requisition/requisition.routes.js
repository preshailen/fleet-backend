import express from 'express';
import * as controller from './requisition.controller.js';
const router = express.Router();

router.get('/getRequisitions', controller.getRequisitions);
router.get('/getRequisitionById/:id', controller.getRequisitionById);
router.get('/getAttachedQuotes/:id', controller.getAttachedQuotes);
router.get('/getSignedPdfUrl/:url', controller.getSignedPdfUrl);
router.get('/getSupplierLeadTime', controller.getSupplierLeadTime);
router.post('/updateRequisitionStatus/:id/:status', controller.updateRequisitionStatus);
router.post('/rejectRequisition/:id', controller.rejectRequisition);
router.post('/createRequisition', controller.createRequisition);
router.post('/fulfillRequisition', controller.fulfillRequisition);
router.post('/selectPreferredQuote/:requisitionId/:quoteId', controller.selectPreferredQuote);


export default router;