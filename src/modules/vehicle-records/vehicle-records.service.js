import ExcelJS from "exceljs";
import VehicleRecord from "../../models/vehicle-records/vehicleRecord.model.js";
import pagination from "../../utils/pagination.js";

const BATCH_SIZE = 500;
const VALIDATION_CONCURRENCY = 20;

export const uploadRecords = async (stream) => {
  let headers = {};
  let batch = [];
  let validDocs = [];
  const errors = [];

  const workbook = new ExcelJS.stream.xlsx.WorkbookReader(stream);

  for await (const worksheet of workbook) {

  let paused = false;

  for await (const row of worksheet) {

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
      errors.push({
        row: row.number,
        field: null,
        value: null,
        message: err.message
      });
    }

    // 🔥 BACKPRESSURE CONTROL
    if (batch.length >= BATCH_SIZE && !paused) {
      paused = true;

      worksheet.pause();                // ⛔ STOP stream
      await processBatch(batch, validDocs, errors);
      batch = [];
      worksheet.resume();               // ▶️ RESUME stream

      paused = false;
    }
  }
}

  // Final batch
  if (batch.length) {
    await processBatch(batch, validDocs, errors);
  }

  // 🚨 Stop if any validation errors
  if (errors.length) {
    return fail(errors);
  }

  // ✅ Insert only clean data
  await VehicleRecord.insertMany(validDocs);

  return { inserted: validDocs.length };
};

export const getRecords = async (req) => {
  return await pagination(VehicleRecord, req.query, {
    searchFields: [
      "supplierName", "businessUnit", "divisionDepotDepartment", "costCentre", "area", "province", "responsibleManager",
      "regNo", "contractNo", "contractType", "rateCategory", "make", "model", "fuelType", "engineCapacity",
      "dealStatus", "supplierResponsibleName"
    ]
  });
};

/* ================= HELPERS ================= */
const normalizeHeader = (str) => {
  if (!str) return "";
  return str.toString().toLowerCase().replace(/[^a-z0-9]+/g, "").trim();
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

    obj[key] = getCellValue(cell);
  });

  return computeDerivedFields(obj);
};
const getCellValue = (cell) => {
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
const enforceSchema = (row) => {
  return { ...BASE_SCHEMA, ...row };
};
const computeDerivedFields = (doc) => {
  const result = { ...doc };

  if (
    typeof result.actualQuotationDays === "number" &&
    typeof result.targetQuotationDays === "number"
  ) {
    result.varianceForQuoteDays =
      result.actualQuotationDays - result.targetQuotationDays;
  }

  if (
    typeof result.actualDeliveryDays === "number" &&
    typeof result.targetDeliveryDays === "number"
  ) {
    result.varianceForDeliveryDays =
      result.actualDeliveryDays - result.targetDeliveryDays;
  }

  if (
    typeof result.totalKmTravelled === "number" &&
    typeof result.allowedKm === "number"
  ) {
    result.excessKmTravelled =
      result.totalKmTravelled - result.allowedKm;
  }

  return result;
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
const processBatch = async (batch, validDocs, errors) => {
  await validateBatchParallel(batch, errors);

  // Only keep valid ones
  const errorRows = new Set(errors.map(e => e.row));
  const cleanDocs = batch.filter(doc => !errorRows.has(doc.__rowNumber));

  validDocs.push(...cleanDocs);
};
const fail = (details) => {
  const error = new Error("Vehicle record validation failed");
  error.details = details;
  throw error;
};
const runWithConcurrency = async (items, limit, worker) => {
  let index = 0;

  const workers = new Array(limit).fill(null).map(async () => {
    while (index < items.length) {
      const currentIndex = index++;
      await worker(items[currentIndex], currentIndex);
    }
  });

  await Promise.all(workers);
};
const validateBatchParallel = async (batch, errors) => {
  await runWithConcurrency(batch, VALIDATION_CONCURRENCY, async (doc) => {
    try {
      const record = new VehicleRecord(doc);
      await record.validate();
    } catch (err) {
      if (err.name === "ValidationError") {
        Object.values(err.errors).forEach(e => {
          errors.push({
            row: doc.__rowNumber,
            field: e.path,
            value: e.value,
            message: e.message
          });
        });
      } else {
        errors.push({
          row: doc.__rowNumber,
          field: null,
          value: null,
          message: err.message
        });
      }
    }
  });
};
/*==================HELPERS========================*/


/*==================DATA===========================*/
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
/*==================DATA===========================*/
