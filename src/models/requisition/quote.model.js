import mongoose from 'mongoose';

const quoteSchema = new mongoose.Schema({
  requisition: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Requisition',
    required: true
  },
  pdfUrl: { type: String, required: true },
  preferredQuote: Boolean,
  fileName: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Quote', quoteSchema);