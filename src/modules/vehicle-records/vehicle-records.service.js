import ExcelJS from "exceljs";
import mongoose from "mongoose";
import VehicleRecord from "../../models/vehicle-records/vehicleRecord.model.js";

const BATCH_SIZE = 500;

export const uploadRecords = async (filePath) => {
  const session = await mongoose.startSession();

  let headers = {};
  let batch = [];
  let inserted = 0;
  let allErrors = [];

  let failed = false; // 🔥 HARD STOP FLAG

  try {
    session.startTransaction();

    const workbook = new ExcelJS.stream.xlsx.WorkbookReader(filePath);

    for await (const worksheet of workbook) {
      for await (const row of worksheet) {

        if (failed) break;

        if (row.number === 1) {
          headers = extractHeadersFromStream(row);
          continue;
        }

        try {
          const raw = mapRowStream(row, headers);
          const shaped = enforceSchema(raw);
          const cleaned = cleanRow(shaped);

          batch.push({
            ...cleaned,
            __rowNumber: row.number
          });

        } catch (err) {
          failed = true;

          allErrors.push({
            row: row.number,
            field: null,
            value: null,
            message: err.message
          });

          break;
        }

        if (batch.length >= BATCH_SIZE) {
          await insertBatch(batch, session);
          inserted += batch.length;
          batch = [];
        }
      }
    }

    // flush remaining batch ONLY if no failure
    if (!failed && batch.length) {
      await insertBatch(batch, session);
      inserted += batch.length;
    }

    // 🚨 If any error → force rollback
    if (failed || allErrors.length) {
      await session.abortTransaction();
      session.endSession();

      const error = new Error("Vehicle record validation failed");
      error.details = allErrors;

      throw error;
    }

    await session.commitTransaction();
    session.endSession();

    return { inserted };

  } catch (err) {

    // 🔥 SAFE ABORT (only if active)
    try {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
    } catch (_) {}

    session.endSession();

    if (err.details) throw err;

    const error = new Error(err.message || "Upload failed");
    error.details = allErrors;

    throw error;
  }
};
export const getRecords = async (req) => {
  return await pagination(VehicleRecord, req.query, {
    searchFields: [
      'supplierName', 'businessUnit', 'divisionDepotDepartment', 'costCentre', 'area', 'province', 'responsibleManager',
      'regNo','contractNo', 'contractType', 'rateCategory', 'make', 'model', 'fuelType', 'engineCapacity',
      'dealStatus', 'supplierResponsibleName'
    ]
  });
}

/*==================HELPERS========================*/

export function isExcelFile(buffer, file) {
  if (!file) return false;

  const validMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  const isValidMime = validMimeTypes.includes(file.mimetype);
  const isValidExt = file.originalname.toLowerCase().endsWith('.xlsx');


  if (!isValidMime && !isValidExt) return false;

  // --- Check ZIP header (PK)
  const isZip =
    buffer[0] === 0x50 && // P
    buffer[1] === 0x4b && // K
    (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07);

  if (!isZip) return false;

  // --- Check End of Central Directory (basic ZIP integrity)
  const footer = buffer.slice(-22);

  const hasEndOfCentralDir =
    footer.includes(0x50) && footer.includes(0x4b);

  if (!hasEndOfCentralDir) return false;

  return true;
}
export async function validateExcelContent(buffer) {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    if (!workbook.worksheets || workbook.worksheets.length === 0) return false;
    
    const firstSheet = workbook.worksheets[0];

    let hasData = false;

    firstSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1 && row.values.length > 1) {
        hasData = true;
      }
    });
    return hasData;

  } catch (err) {
    console.log(err);
    return false;
  }
}
const normalizeHeader = (str) => {
  if (!str) return "";
  return str
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
};
const headerMap = {
  suppliername: "supplierName",
  month: "month",
  businessunit: "businessUnit",
  divisiondepotdepartment: "divisionDepotDepartment",
  costcentre: "costCentre",
  area: "area",
  province: "province",
  responsiblemanager: "responsibleManager",

  rfqsentdate: "rfqSentDate",
  quotesreceiveddate: "quotesReceivedDate",
  actualquotationdays: "actualQuotationDays",
  targetquotationdays: "targetQuotationDays",
  varianceforquotedays: "varianceForQuoteDays",

  approvalofbestquotedate: "approvalOfBestQuoteDate",
  vehicledeliverydate: "vehicleDeliveryDate",
  actualdeliverydays: "actualDeliveryDays",
  targetdeliverydays: "targetDeliveryDays",
  variancefordeliverydays: "varianceForDeliveryDays",

  regno: "regNo",
  contractno: "contractNo",
  contracttype: "contractType",
  ratecategory: "rateCategory",

  make: "make",
  model: "model",
  year: "year",
  fueltype: "fuelType",
  enginecapacity: "engineCapacity",

  tyresallocated: "tyresAllocated",
  tyresused: "tyresUsed",

  retailprice: "retailPrice",
  discountamount: "discountAmount",
  discount: "discountPercent",
  accessoryamount: "accessoryAmount",
  financesundries: "financeSundries",

  interest: "interestPercent",
  residualvalue: "residualValue",
  rv: "rvPercent",

  startdate: "startDate",
  enddate: "endDate",
  contractperiod: "contractPeriod",

  inclusivekmpermonth: "inclusiveKmPerMonth",
  totalcontractkm: "totalContractKm",

  licenceexpirydate: "licenceExpiryDate",

  odostart: "odoStart",
  odoend: "odoEnd",
  kmtravelled: "kmTravelled",
  kmtravelledltd: "kmTravelledLtd",
  averageltdkm: "averageLtdKm",

  fixedrental: "fixedRental",
  repairsandmaintenance: "repairsAndMaintenance",
  licencefee: "licenceFee",
  trackingcostandservices: "trackingCostAndServices",
  adminfee: "adminFee",

  totalfixedrentalexclvat: "totalFixedRentalExclVat",
  fixedrentalvat: "fixedRentalVat",
  totalfixedrentalinclvat: "totalFixedRentalInclVat",

  startdateofexcessbilling: "startDateOfExcessBilling",
  enddateofexcessbilling: "endDateOfExcessBilling",

  startodoofexcessbilling: "startOdoOfExcessBilling",
  endodoofexcessbilling: "endOdoOfExcessBilling",

  totalkmtravelled: "totalKmTravelled",
  allowedkm: "allowedKm",
  excesskmtravelled: "excessKmTravelled",

  excessrmcpk: "excessRmCpk",
  excessrvcpk: "excessRvCpk",

  excessrmamount: "excessRmAmount",
  excessrvamount: "excessRvAmount",

  totalexcessamountexclvat: "totalExcessAmountExclVat",
  excessvat: "excessVat",
  totalexcessamountinclvat: "totalExcessAmountInclVat",

  operatordefault: "operatorDefault",
  accidentandwriteoffs: "accidentAndWriteOffs",
  tyres: "tyres",
  additionalcosts: "additionalCosts",
  auxiliaryamount: "auxiliaryAmount",
  oocp: "oocp",

  fuelcost: "fuelCost",
  fuellitres: "fuelLitres",
  oilcost: "oilCost",
  oillitres: "oilLitres",

  monthlyfinescost: "monthlyFinesCost",
  monthlyetollcost: "monthlyETollCost",

  subtotalvariablecost: "subtotalVariableCost",
  variablevat: "variableVat",
  totalvariablecost: "totalVariableCost",

  totalcostinclvat: "totalCostInclVat",
  inputvat: "inputVat",
  totalcostexclinputvat: "totalCostExclInputVat",

  cpktco: "cpkTco",

  maintenancedays: "maintenanceDays",
  accidentsdays: "accidentsDays",
  breakdownsdays: "breakdownsDays",

  totalavailability: "totalAvailabilityPercent",

  
  restructuredcontractenddate: "restructuredContractEndDate",
  restructuredcontractperiod: "restructuredContractPeriod",
  restructuredinclusivekmpermonth: "restructuredInclusiveKmPerMonth",

  fixedrentalpriortorestructure: "fixedRentalPriorToRestructure",
  oversandundersincl5tolerance: "oversAndUndersInclTolerance",

  estimatedreplacementdatetimekm: "estimatedReplacementDateTimeAndKm",
  estimatedreplacementtime: "estimatedReplacementTime",
  estimatedreplacementkm: "estimatedReplacementKm",

  dealstatus: "dealStatus",
  supplierresponsiblename: "supplierResponsibleName",

  excessrmytd: "excessRmYtd",
  excessrvytd: "excessRvYtd",
  underutilisationrmytd: "underUtilisationRmYtd",
  underutilisationrmcpk: "underUtilisationRmCpk",
  totalunderutilisationrmamountexclvat: "totalUnderUtilisationRmAmountExclVat",
  totalunderutilisationamountinclvat: "totalUnderUtilisationAmountInclVat",
  datesold: "dateSold"
};
const DATE_FIELDS = new Set([
  "month",
  "rfqSentDate",
  "quotesReceivedDate",
  "approvalOfBestQuoteDate",
  "vehicleDeliveryDate",
  "startDate",
  "endDate",
  "licenceExpiryDate",
  "startDateOfExcessBilling",
  "endDateOfExcessBilling",
  "restructuredContractEndDate",
  "estimatedReplacementDateTimeAndKm",
  "estimatedReplacementTime",
  "dateSold"
]);
const BASE_SCHEMA = {
  supplierName: null,
  month: null,
  businessUnit: null,
  divisionDepotDepartment: null,
  costCentre: null,
  area: null,
  province: null,
  responsibleManager: null,

  rfqSentDate: null,
  quotesReceivedDate: null,
  actualQuotationDays: null,
  targetQuotationDays: null,
  varianceForQuoteDays: null,

  approvalOfBestQuoteDate: null,
  vehicleDeliveryDate: null,
  actualDeliveryDays: null,
  targetDeliveryDays: null,
  varianceForDeliveryDays: null,

  regNo: null,
  contractNo: null,
  contractType: null,
  rateCategory: null,

  make: null,
  model: null,
  year: null,
  fuelType: null,
  engineCapacity: null,

  tyresAllocated: null,
  tyresUsed: null,

  retailPrice: null,
  discountAmount: null,
  discountPercent: null,
  accessoryAmount: null,
  financeSundries: null,

  interestPercent: null,
  residualValue: null,
  rvPercent: null,

  startDate: null,
  endDate: null,
  contractPeriod: null,

  inclusiveKmPerMonth: null,
  totalContractKm: null,

  licenceExpiryDate: null,
  odoStart: null,
  odoEnd: null,
  kmTravelled: null,
  kmTravelledLtd: null,
  averageLtdKm: null,

  fixedRental: null,
  repairsAndMaintenance: null,
  licenceFee: null,
  trackingCostAndServices: null,
  adminFee: null,

  totalFixedRentalExclVat: null,
  fixedRentalVat: null,
  totalFixedRentalInclVat: null,

  startDateOfExcessBilling: null,
  endDateOfExcessBilling: null,

  startOdoOfExcessBilling: null,
  endOdoOfExcessBilling: null,

  totalKmTravelled: null,
  allowedKm: null,
  excessKmTravelled: null,

  excessRmCpk: null,
  excessRvCpk: null,

  excessRmAmount: null,
  excessRvAmount: null,

  totalExcessAmountExclVat: null,
  excessVat: null,
  totalExcessAmountInclVat: null,

  operatorDefault: null,
  accidentAndWriteOffs: null,
  tyres: null,
  additionalCosts: null,
  auxiliaryAmount: null,
  oocp: null,

  fuelCost: null,
  fuelLitres: null,
  oilCost: null,
  oilLitres: null,

  monthlyFinesCost: null,
  monthlyETollCost: null,

  subtotalVariableCost: null,
  variableVat: null,
  totalVariableCost: null,

  totalCostInclVat: null,
  inputVat: null,
  totalCostExclInputVat: null,

  cpkTco: null,

  maintenanceDays: null,
  accidentsDays: null,
  breakdownsDays: null,

  totalAvailabilityPercent: null,

  restructuredContractEndDate: null,
  restructuredContractPeriod: null,
  restructuredInclusiveKmPerMonth: null,

  fixedRentalPriorToRestructure: null,
  oversAndUndersInclTolerance: null,

  estimatedReplacementDateTimeAndKm: null,
  estimatedReplacementTime: null,
  estimatedReplacementKm: null,

  dealStatus: null,
  supplierResponsibleName: null,

  excessRmYtd: null,
  excessRvYtd: null,
  underUtilisationRmYtd: null,
  underUtilisationRmCpk: null,
  totalUnderUtilisationRmAmountExclVat: null,
  totalUnderUtilisationAmountInclVat: null,
  dateSold: null,
};
const enforceSchema = (row) => {
  return { ...BASE_SCHEMA, ...row };
}
const mapRow = (row, headers) => {
  const obj = {};

  row.eachCell((cell, colNumber) => {
    const key = headers[colNumber];
    const value = getCellValue(cell, key);

    if (key) {
      obj[key] = value;
    }
  });

  return computeDerivedFields(obj);
};
const cleanRow = (row) => {
  const cleaned = {};

  Object.keys(row).forEach((key) => {
    let value = row[key];

    if (value === "" || value === undefined) {
      value = null;
    }

    cleaned[key] = value;
  });

  return cleaned;
};

const computeDerivedFields = (doc) => {
  const result = { ...doc };

  // Quote variance
  if (
    typeof result.actualQuotationDays === "number" &&
    typeof result.targetQuotationDays === "number"
  ) {
    result.varianceForQuoteDays =
      result.actualQuotationDays - result.targetQuotationDays;
  }

  // Delivery variance
  if (
    typeof result.actualDeliveryDays === "number" &&
    typeof result.targetDeliveryDays === "number"
  ) {
    result.varianceForDeliveryDays =
      result.actualDeliveryDays - result.targetDeliveryDays;
  }

  // Excess KM
  if (
    typeof result.totalKmTravelled === "number" &&
    typeof result.allowedKm === "number"
  ) {
    result.excessKmTravelled =
      result.totalKmTravelled - result.allowedKm;
  }

  return result;
};
const extractHeaders = (sheet) => {
  const headers = {};
  const firstRow = sheet.getRow(1);

  const unmapped = [];

  firstRow.eachCell((cell, colNumber) => {
    let rawHeader = cell.value;

    if (rawHeader && typeof rawHeader === "object") {
      if (rawHeader.richText) {
        rawHeader = rawHeader.richText.map(rt => rt.text).join("");
      } else if (rawHeader.text) {
        rawHeader = rawHeader.text;
      } else {
        rawHeader = String(rawHeader);
      }
    }

    const normalized = normalizeHeader(rawHeader);
    let key = headerMap[normalized];

    if (normalized === "vat") {
      const prev = normalizeHeader(firstRow.getCell(colNumber - 1).value);
      const next = normalizeHeader(firstRow.getCell(colNumber + 1).value);

      if (prev.includes("totalfixedrentalexclvat") && next.includes("totalfixedrentalinclvat")) {
        key = "fixedRentalVat";
      } else if (prev.includes("totalexcessamountexclvat") && next.includes("totalexcessamountinclvat")) {
        key = "excessVat";
      } else if (prev.includes("subtotalvariablecost") && next.includes("totalvariablecost")) {
        key = "variableVat";
      }
    }

    if (!key) {
      unmapped.push({
        rawHeader,
        normalized,
        colNumber
      });
    }

    headers[colNumber] = key || null;
  });

  if (unmapped.length) {
    const error = new Error("Unmapped headers found");
    error.details = unmapped;
    throw error;
  }

  return headers;
};
/*==================HELPERS========================*/

const insertBatch = async (batch, session, allErrors) => {
  try {
    await VehicleRecord.insertMany(batch, {
      session,
      ordered: true
    });
  } catch (err) {

    // 🔥 Mongoose validation errors
    if (err.name === "ValidationError") {
      Object.values(err.errors).forEach(e => {
        const doc = batch[0]; // fallback if index missing

        allErrors.push({
          row: doc.__rowNumber,
          field: e.path,
          value: e.value,
          message: e.message
        });
      });
      return;
    }

    // 🔥 Mongo bulk write errors
    if (err.writeErrors) {
      err.writeErrors.forEach(e => {
        const failedDoc = batch[e.index];

        allErrors.push({
          row: failedDoc?.__rowNumber,
          field: null,
          value: null,
          message: e.errmsg
        });
      });
      return;
    }

    throw err;
  }
};

const extractHeadersFromStream = (row) => {
  const headers = {};

  row.eachCell((cell, colNumber) => {
    const normalized = normalizeHeader(cell.text || cell.value);
    const key = headerMap[normalized];
    headers[colNumber] = key || null;
  });

  return headers;
};

const mapRowStream = (row, headers) => {
  const obj = {};

  row.eachCell((cell, colNumber) => {
    const key = headers[colNumber];
    if (!key) return;

    obj[key] = getCellValue(cell, key);
  });

  return computeDerivedFields(obj);
};

const getCellValue = (cell, key) => {
  let value = cell.value;

  if (value instanceof Date) return value;

  if (value && typeof value === "object") {
    if ("text" in value) return value.text;
    if ("result" in value) return value.result;
    return null;
  }

  if (value === "" || value === undefined) return null;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!isNaN(trimmed)) return Number(trimmed);
    return trimmed;
  }

  return value;
};