import Query from "../models/queryModel.js";
import DataSource from "../models/dataModel.js";
import mongoose from "mongoose";

export const runQuery = async (req, res) => {
  try {
    const { dataSourceId, config, name } = req.body;
    if (!dataSourceId || !config || !name) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const dataSource = await DataSource.findById(dataSourceId);
    if (!dataSource) {
      return res
        .status(404)
        .json({ success: false, message: "Data source not found" });
    }

    if (
      dataSource.uploadedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const collection = mongoose.connection.collection(
      dataSource.collectionName
    );
    const pipeline = [];

    const match = {};
    if (config.filters && config.filters.length > 0) {
      config.filters.forEach((f) => {
        let val = f.value;
        if (!isNaN(f.value) && f.value !== "") val = Number(f.value);
        if (f.operator === "contains") {
          match[f.column] = { $regex: val, $options: "i" };
        } else if (f.operator === "=") {
          match[f.column] = val;
        } else {
          match[f.column] = { [`$${f.operator}`]: val };
        }
      });
      pipeline.push({ $match: match });
    }

    if (config.groupBy) {
      const group = { _id: `$${config.groupBy}` };
      config.metrics.forEach((m) => {
        const field = `$${m.column}`;
        group[m.as] = { [`$${m.aggregation.toLowerCase()}`]: field };
      });
      pipeline.push({ $group: group });

      const project = { _id: 0, [config.groupBy]: "$_id" };
      config.metrics.forEach((m) => {
        project[m.as] = 1;
      });
      pipeline.push({ $project: project });
    }

    const result = await collection.aggregate(pipeline).toArray();

    const savedQuery = await Query.create({
      name,
      dataSourceId,
      config,
      createdBy: req.user._id,
      result,
    });

    return res.json({
      success: true,
      message: "Query executed successfully",
      data: {
        queryId: savedQuery._id,
        result,
      },
    });
  } catch (error) {
    console.error("Query Error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to run query" });
  }
};
