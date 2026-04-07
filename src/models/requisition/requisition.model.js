import mongoose from 'mongoose';

const requisitionSchema = new mongoose.Schema({
  companyName: { type: String, required: true, trim: true, maxLength: 100, },
  department: { type: String, required: true, trim: true, maxLength: 100 },
  requestingEmployee: { type: String, required: true, trim: true, maxLength: 100 },
  contactNumber: { type: String, required: true, trim: true, maxLength: 100, match: [/^\+?[0-9][0-9\s\-()]{6,19}$/, "Please use a valid telephone number"] },
  contactEmail: { type: String, required: true, trim: true, lowercase: true, maxLength: 100, match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"] },
  supplierEmail:{ type: String, required: true, trim: true, lowercase: true, maxLength: 100, match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"] },
  nameOfDriverAssigned: { type: String, required: true, trim: true, maxLength: 100 },
  basicAdditionalInfo: { type: String, trim: true, maxLength: 1000 },
  purpose: { type: String, required: true, trim: true, maxLength: 100 },
  type: { type: String, required: true, trim: true, maxLength: 100 },
  term: { type: Number, min: 1, max: 600 },
  vehicleType: { type: String, required: true, trim: true, maxLength: 100 },
  make: { type: String, required: true, trim: true, maxLength: 100 },
  model: { type: String, required: true, trim: true, maxLength: 100 },
  engineSize: { type: String, required: true, trim: true, maxLength: 100 },
  fuelType: { type: String, required: true, trim: true, maxLength: 100 },
  transmission: { type: String, required: true, trim: true, maxLength: 100 },
  colourPreference: { type: String, required: true, trim: true, maxLength: 100 },
  accessories: { type: String, trim: true, maxLength: 1020 },
  vehicleAdditionalInfo: { type: String, trim: true , maxLength: 1000 },
  intendedUse: { type: String, required: true, trim: true, maxLength: 100 },
  estimatedMonthlyKms: { type: Number, required: true, min: 1, max: 100000 },
  costCentre: { type: String, required: true, trim: true, maxLength: 100 },
  budgetAvailable: { type: Number, required: true, min: 1, max: 10000000 },
  estimatedVehicleCost: { type: Number, required: true, min: 1, max: 10000000 },
  insurance: { type: Boolean, required: true },
  vehicleTracking: { type: Boolean, required: true },
  roadworthy: { type: Boolean, required: true },
  licensingAndRegistration: { type: Boolean, required: true },
  fulfillmentDate: { type: Date },
  status: { type: String, required: true, enum: ["submitted", "fulfilled", "quoteSelected", "costCentreApproved", "financeApproved",
                                                 "delegateApproved", "approved", "rejected"], default: "submitted" }
}, { timestamps: true });

requisitionSchema.index({
  status: 1,
  supplierEmail: 1,
  fulfillmentDate: 1
});

export default mongoose.model("Requisition", requisitionSchema);
