import VehicleRecord from "../../models/vehicle-records/vehicleRecord.model.js";
import mongoose from 'mongoose';

export const getTotals = async () => {
  const fields = [
    "businessUnit",
    "divisionDepotDepartment",
    "costCentre",
    "responsibleManager",
    "year"
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
          month: { $month: "$month" }
        },
        total: { $sum: 1 }
      }
    },
    {
      $project: {
        group: "$_id.group",
        year: "$_id.year",
        month: "$_id.month",
        total: 1,
        _id: 0
      }
    },
    {
      $sort: { year: 1, month: 1 }
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

export const getCumulativeTotals = async () => {
  const fields = [
    "rateCategory",
    "make",
    "model",
    "fuelType",
    "engineCapacity",
    "province",
    "area",
    "dealStatus",
    "supplierName"
  ];

  // Start of previous year
  const startOfLastYear = new Date(new Date().getFullYear() - 1, 0, 1);

  // Current month
  const currentMonth = new Date();

  const buildPipeline = (field) => [
    {
      $match: {
        [field]: { $ne: null },
        month: {
          $gte: startOfLastYear,
          $lte: currentMonth
        }
      }
    },

    {
      $group: {
        _id: `$${field}`,

        cumulativeTotal: {
          $sum: 1
        }
      }
    },

    {
      $project: {
        _id: 0,
        group: "$_id",
        cumulativeTotal: 1,

        // Always current month
        lastDate: {
          $dateToString: {
            format: "%b %Y",
            date: currentMonth
          }
        }
      }
    },

    {
      $sort: {
        cumulativeTotal: -1
      }
    },
    {
      $limit: 20
    }
  ];

  const facets = {};

  fields.forEach(field => {
    facets[field] = buildPipeline(field);
  });

  return await VehicleRecord.aggregate([
    {
      $facet: facets
    }
  ]);
};