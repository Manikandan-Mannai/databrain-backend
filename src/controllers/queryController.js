import mongoose from "mongoose";
import DataSource from "../models/dataModel.js";
import Query from "../models/queryModel.js";

function normalizeValue(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" || typeof value === "boolean") return value;
  const str = value.toString().trim();
  if (str === "") return null;
  if (!isNaN(str)) return Number(str);
  const lower = str.toLowerCase();
  if (lower === "true") return true;
  if (lower === "false") return false;
  const date = new Date(str);
  if (!isNaN(date.getTime())) return date;
  return str;
}

function buildMatchFilter(filters) {
  const match = {};
  for (const f of filters) {
    if (!f.column) continue;
    const val = normalizeValue(f.value);
    if (val === null) continue;

    const op = (f.operator || "=").toLowerCase();
    const operatorMap = {
      "=": "$eq",
      "!=": "$ne",
      ">": "$gt",
      "<": "$lt",
      ">=": "$gte",
      "<=": "$lte",
      contains: "$regex",
      in: "$in",
      "not in": "$nin",
    };
    const mongoOp = operatorMap[op] || "$eq";

    if (mongoOp === "$regex") {
      match[f.column] = { [mongoOp]: val.toString(), $options: "i" };
    } else if (mongoOp === "$in" || mongoOp === "$nin") {
      match[f.column] = { [mongoOp]: Array.isArray(val) ? val : [val] };
    } else if (mongoOp === "$eq" && typeof val === "string") {
      match[f.column] = { $regex: `^${val}$`, $options: "i" };
    } else {
      match[f.column] = { [mongoOp]: val };
    }
  }
  return match;
}

export const runQuery = async (req, res) => {
  try {
    const { dataSourceId, config, name } = req.body;
    if (!dataSourceId || !config || !name) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const dataSource = await DataSource.findById(dataSourceId);
    if (!dataSource) {
      return res.status(404).json({
        success: false,
        message: "Data source not found",
      });
    }

    if (
      dataSource.uploadedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const collection = mongoose.connection.collection(
      dataSource.collectionName
    );
    const pipeline = [];

    if (config.filters?.length) {
      const match = buildMatchFilter(config.filters);
      if (Object.keys(match).length) pipeline.push({ $match: match });
    }

    if (config.groupBy) {
      const group = { _id: `$${config.groupBy}` };
      for (const m of config.metrics || []) {
        if (!m.column) continue;
        const field = `$${m.column}`;
        const alias = m.as?.trim() || `${m.aggregation}_${m.column}`;
        const agg = m.aggregation?.toLowerCase() || "";
        if (agg === "sum") group[alias] = { $sum: { $toDouble: field } };
        else if (agg === "avg") group[alias] = { $avg: { $toDouble: field } };
        else if (agg === "min") group[alias] = { $min: { $toDouble: field } };
        else if (agg === "max") group[alias] = { $max: { $toDouble: field } };
        else if (agg === "count") group[alias] = { $sum: 1 };
      }
      pipeline.push({ $group: group });

      const project = { _id: 0, [config.groupBy]: "$_id" };
      for (const m of config.metrics || []) {
        if (!m.column) continue;
        const alias = m.as?.trim() || `${m.aggregation}_${m.column}`;
        project[alias] = 1;
      }
      pipeline.push({ $project: project });
    } else if (
      config.metrics?.length === 1 &&
      config.metrics[0].aggregation?.toLowerCase() === "count"
    ) {
      pipeline.push({ $count: "count" });
    }

    if (!pipeline.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid query configuration",
      });
    }

    let result;
    try {
      result = await collection
        .aggregate(pipeline, { allowDiskUse: true })
        .toArray();
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Aggregation failed. Check your data fields and operators.",
        error: err.message,
      });
    }

    const savedQuery = await Query.create({
      name,
      dataSourceId,
      config,
      createdBy: req.user._id,
      result,
    });

    res.json({
      success: true,
      message: "Query executed successfully",
      data: { queryId: savedQuery._id, result, pipeline },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to run query",
      error: error.message,
    });
  }
};

export const getQueryById = async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);
    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Query not found",
      });
    }
    res.json({ success: true, data: query });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch query",
      error: error.message,
    });
  }
};
