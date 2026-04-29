import ExcelJS from "exceljs";
import VehicleRecord from "../../models/vehicle-records/vehicleRecord.model.js";
import pagination from "../../utils/pagination.js";

const BATCH_SIZE = 500;
const VALIDATION_CONCURRENCY = 20;

/* ================= MAIN ================= */

export const uploadRecords = async (filePath) => {
  let headers = {};
  let batch = [];
  let validDocs = [];
  const errors = [];

  const workbook = new ExcelJS.stream.xlsx.WorkbookReader(filePath);

  for await (const worksheet of workbook) {
    for await (const row of worksheet) {

      // Header row
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

      // Process batch
      if (batch.length >= BATCH_SIZE) {
        await processBatch(batch, validDocs, errors);
        batch = [];
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

/* ================= GET ================= */

export const getRecords = async (req) => {
  return await pagination(VehicleRecord, req.query, {
    searchFields: [
      "supplierName", "businessUnit", "divisionDepotDepartment", "costCentre", "area", "province", "responsibleManager",
      "regNo", "contractNo", "contractType", "rateCategory", "make", "model", "fuelType", "engineCapacity",
      "dealStatus", "supplierResponsibleName"
    ]
  });
};

/* ================= BATCH PROCESSING ================= */

const processBatch = async (batch, validDocs, errors) => {
  await validateBatchParallel(batch, errors);

  // Only keep valid ones
  const errorRows = new Set(errors.map(e => e.row));
  const cleanDocs = batch.filter(doc => !errorRows.has(doc.__rowNumber));

  validDocs.push(...cleanDocs);
};

/* ================= PARALLEL VALIDATION ================= */

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

const cleanRow = (row) => {
  const cleaned = {};

  Object.keys(row).forEach((key) => {
    let value = row[key];
    if (value === "" || value === undefined) value = null;
    cleaned[key] = value;
  });

  return cleaned;
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

const fail = (details) => {
  const error = new Error("Vehicle record validation failed");
  error.details = details;
  throw error;
};