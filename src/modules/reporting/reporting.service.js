import VehicleRecord from "../../models/vehicle-records/vehicleRecord.model.js";
import mongoose from 'mongoose';

export const getTotals = async (period = 'year') => {
  const isMonth = period === 'month';

  const fields = [
    "businessUnit",
    "divisionDepotDepartment",
    "costCentre",
    "responsibleManager",
    "rateCategory",
    "make",
    "model",
    "year",
    "engineCapacity",
    "province",
    "area",
    "dealStatus",
    "supplierName"
  ];

  const buildPipeline = (field) => ([
    {
      $match: {
        [field]: { $ne: null }
      }
    },
    {
      $group: {
        _id: {
          group: `$${field}`,
          year: { $year: "$month" },
          ...(isMonth && { month: { $month: "$month" } })
        },
        total: { $sum: 1 }
      }
    },
    {
      $project: {
        group: "$_id.group",
        year: "$_id.year",
        ...(isMonth && { month: "$_id.month" }),
        total: 1,
        _id: 0
      }
    },
    {
      $sort: isMonth
        ? { year: 1, month: 1 }
        : { year: 1 }
    }
  ]);

  const facets = {};
  fields.forEach(field => {
    facets[field] = buildPipeline(field);
  });

  return await VehicleRecord.aggregate([
    {
      $match: {
        month: { $ne: null }
      }
    },
    {
      $facet: facets
    }
  ]);
};