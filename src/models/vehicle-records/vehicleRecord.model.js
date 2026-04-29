import mongoose from "mongoose";

const vehicleRecordSchema = new mongoose.Schema({
    supplierName: { type: String , trim: true },
    month: { type: Date },
    businessUnit: { type: String , trim: true },
    divisionDepotDepartment: { type: String , trim: true },
    costCentre: { type: String , trim: true },
    area: { type: String , trim: true },
    province: { type: String , trim: true },
    responsibleManager: { type: String , trim: true },

    rfqSentDate: { type: Date  },
    quotesReceivedDate: { type: Date  },
    actualQuotationDays: { type: Number  },
    targetQuotationDays: { type: Number  },
    varianceForQuoteDays: { type: Number  },

    approvalOfBestQuoteDate: { type: Date  },
    vehicleDeliveryDate: { type: Date  },
    actualDeliveryDays: { type: Number  },
    targetDeliveryDays: { type: Number  },
    varianceForDeliveryDays: { type: Number  },

    regNo: { type: String , uppercase: true, trim: true },
    contractNo: { type: String , trim: true },
    contractType: { type: String  },
    rateCategory: { type: String  },

    make: { type: String , trim: true },
    model: { type: String , trim: true },
    year: { type: Number  },
    fuelType: { type: String  },
    engineCapacity: { type: Number  },

    tyresAllocated: { type: Number  },
    tyresUsed: { type: Number  },

    retailPrice: { type: Number  },
    discountAmount: { type: Number  },
    discountPercent: { type: Number  },
    accessoryAmount: { type: Number  },
    financeSundries: { type: Number  },

    interestPercent: { type: Number  },
    residualValue: { type: Number },
    rvPercent: { type: Number  },

    startDate: { type: Date  },
    endDate: { type: Date  },
    contractPeriod: { type: Number  },

    inclusiveKmPerMonth: { type: Number  },
    totalContractKm: { type: Number  },

    licenceExpiryDate: { type: Date  },

    odoStart: { type: Number  },
    odoEnd: { type: Number  },
    kmTravelled: { type: Number  },
    kmTravelledLtd: { type: Number  },
    averageLtdKm: { type: Number  },

    fixedRental: { type: Number  },
    repairsAndMaintenance: { type: Number  },
    licenceFee: { type: Number  },
    trackingCostAndServices: { type: Number  },
    adminFee: { type: Number  },

    totalFixedRentalExclVat: { type: Number  },
    fixedRentalVat: { type: Number  },
    totalFixedRentalInclVat: { type: Number  },

    startDateOfExcessBilling: { type: Date  },
    endDateOfExcessBilling: { type: Date  },

    startOdoOfExcessBilling: { type: Number  },
    endOdoOfExcessBilling: { type: Number  },

    totalKmTravelled: { type: Number  },
    allowedKm: { type: Number  },
    excessKmTravelled: { type: Number  },

    excessRmCpk: { type: Number  },
    excessRvCpk: { type: Number  },

    excessRmAmount: { type: Number  },
    excessRvAmount: { type: Number  },

    totalExcessAmountExclVat: { type: Number  },
    excessVat: { type: Number  },
    totalExcessAmountInclVat: { type: Number  },

    operatorDefault: { type: Number  },
    accidentAndWriteOffs: { type: Number  },
    tyres: { type: Number  },
    additionalCosts: { type: Number  },
    auxiliaryAmount: { type: Number  },
    oocp: { type: Number  },

    fuelCost: { type: Number  },
    fuelLitres: { type: Number  },
    oilCost: { type: Number  },
    oilLitres: { type: Number  },

    monthlyFinesCost: { type: Number  },
    monthlyETollCost: { type: Number  },

    subtotalVariableCost: { type: Number  },
    variableVat: { type: Number  },
    totalVariableCost: { type: Number  },

    totalCostInclVat: { type: Number  },
    inputVat: { type: Number  },
    totalCostExclInputVat: { type: Number  },

    cpkTco: { type: Number  },

    maintenanceDays: { type: Number  },
    accidentsDays: { type: Number  },
    breakdownsDays: { type: Number  },

    totalAvailabilityPercent: { type: Number  },

    restructuredContractEndDate: { type: Date },
    restructuredContractPeriod: { type: Number  },
    restructuredInclusiveKmPerMonth: { type: Number  },

    fixedRentalPriorToRestructure: { type: Number  },
    oversAndUndersInclTolerance: { type: Number  },

    estimatedReplacementDateTimeAndKm: { type: Date  },
    estimatedReplacementTime: { type: Date  },
    estimatedReplacementKm: { type: Number  },

    dealStatus: { type: String , trim: true },
    supplierResponsibleName: { type: String , trim: true },

    excessRmYtd: { type: Number  },
    excessRvYtd: { type: Number  },
    underUtilisationRmYtd: { type: Number  },
    underUtilisationRmCpk: { type: Number  },
    totalUnderUtilisationRmAmountExclVat: { type: Number  },
    totalUnderUtilisationAmountInclVat: { type: Number  },
    dateSold: { type: Date },
  }, { timestamps: true });

export default mongoose.model("VehicleRecord", vehicleRecordSchema);

