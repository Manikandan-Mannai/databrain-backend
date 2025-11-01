import Chart from "../models/chartModel.js";
import Query from "../models/queryModel.js";

export const createChart = async (req, res) => {
  try {
    const { title, type, queryId, config } = req.body;

    if (!title || !type || !queryId || !config) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, type, queryId, config",
      });
    }

    if (
      type !== "pie" &&
      (!config.xAxis ||
        !Array.isArray(config.series) ||
        config.series.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Bar/Line charts require xAxis and at least one series",
      });
    }

    if (
      type === "pie" &&
      (!config.pie?.labelField || !config.pie?.valueField)
    ) {
      return res.status(400).json({
        success: false,
        message: "Pie chart requires labelField and valueField",
      });
    }

    const query = await Query.findById(queryId);
    if (!query) {
      return res
        .status(404)
        .json({ success: false, message: "Query not found" });
    }
    if (query.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const chart = await Chart.create({
      title,
      type,
      queryId,
      config,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Chart created successfully",
      data: { chartId: chart._id },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create chart",
      error: error.message,
    });
  }
};

export const getChartData = async (req, res) => {
  try {
    const { chartId } = req.params;

    const chart = await Chart.findById(chartId).populate({
      path: "queryId",
      select: "result name",
    });

    if (!chart) {
      return res
        .status(404)
        .json({ success: false, message: "Chart not found" });
    }

    if (
      chart.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const result = chart.queryId?.result || [];
    const config = chart.config || {};
    const chartType = chart.type;

    return res.json({
      success: true,
      data: {
        result,
        config,
        type: chartType,
        title: chart.title,
        layout: chart.layout,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chart data",
      error: error.message,
    });
  }
};

export const getAllCharts = async (req, res) => {
  try {
    const charts = await Chart.find({ createdBy: req.user._id })
      .populate({
        path: "queryId",
        select: "name result",
      })
      .select("title type config layout createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: charts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch charts",
      error: error.message,
    });
  }
};

export const updateChartLayout = async (req, res) => {
  try {
    const { chartId } = req.params;
    const { layout } = req.body;

    if (!layout || typeof layout !== "object") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid layout" });
    }

    const chart = await Chart.findOneAndUpdate(
      { _id: chartId, createdBy: req.user._id },
      { layout },
      { new: true }
    );

    if (!chart) {
      return res
        .status(404)
        .json({ success: false, message: "Chart not found or access denied" });
    }

    return res.json({
      success: true,
      message: "Layout updated",
      data: { layout: chart.layout },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update layout",
      error: error.message,
    });
  }
};
