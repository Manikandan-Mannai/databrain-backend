import Chart from "../models/chartModel.js";
import Query from "../models/queryModel.js";

export const createChart = async (req, res) => {
  try {
    const { title, type, queryId, config, series, data, layout } = req.body;

    if (!title || !type || !queryId || !config || !data)
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });

    const query = await Query.findById(queryId);
    if (!query)
      return res
        .status(404)
        .json({ success: false, message: "Query not found" });

    if (query.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Access denied" });

    if (type === "pie") {
      if (!config.pieLabel || !config.pieValue)
        return res
          .status(400)
          .json({
            success: false,
            message: "pieLabel and pieValue required for pie charts",
          });
    } else {
      if (!config.xAxisLabel)
        return res
          .status(400)
          .json({
            success: false,
            message: "xAxisLabel required for bar/line charts",
          });
      if (!Array.isArray(series) || series.length === 0)
        return res
          .status(400)
          .json({
            success: false,
            message: "At least one series required for bar/line charts",
          });
    }

    const chart = await Chart.create({
      title,
      type,
      queryId,
      config,
      series: type === "pie" ? [] : series,
      data,
      layout: layout || { x: 0, y: 0, w: 6, h: 4 },
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Chart created successfully",
      data: { chartId: chart._id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create chart",
      error: error.message,
    });
  }
};

export const getChartData = async (req, res) => {
  try {
    const { chartId } = req.params;
    const chart = await Chart.findById(chartId).populate(
      "queryId",
      "result name"
    );

    if (!chart)
      return res
        .status(404)
        .json({ success: false, message: "Chart not found" });

    if (
      chart.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    )
      return res.status(403).json({ success: false, message: "Access denied" });

    const resultData = chart.data.length
      ? chart.data
      : chart.queryId?.result || [];

    res.json({
      success: true,
      data: {
        type: chart.type,
        title: chart.title,
        config: chart.config,
        layout: chart.layout,
        series: chart.series,
        data: resultData,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch chart data",
      error: error.message,
    });
  }
};

export const getAllCharts = async (req, res) => {
  try {
    const charts = await Chart.find({ createdBy: req.user._id })
      .populate("queryId", "name result")
      .select("title type config layout series data createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: charts });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch charts",
      error: error.message,
    });
  }
};

export const updateChart = async (req, res) => {
  try {
    const { chartId } = req.params;
    const updates = req.body;

    if (updates.type === "pie") {
      if (!updates.config?.pieLabel || !updates.config?.pieValue)
        return res
          .status(400)
          .json({
            success: false,
            message: "pieLabel and pieValue required for pie charts",
          });
    } else if (updates.type && updates.type !== "pie") {
      if (!updates.config?.xAxisLabel)
        return res
          .status(400)
          .json({
            success: false,
            message: "xAxisLabel required for bar/line charts",
          });
      if (!Array.isArray(updates.series) || updates.series.length === 0)
        return res
          .status(400)
          .json({ success: false, message: "At least one series required" });
    }

    const chart = await Chart.findOneAndUpdate(
      { _id: chartId, createdBy: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!chart)
      return res
        .status(404)
        .json({ success: false, message: "Chart not found or access denied" });

    res.json({ success: true, message: "Chart updated", data: chart });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update chart",
      error: error.message,
    });
  }
};

export const deleteChart = async (req, res) => {
  try {
    const { chartId } = req.params;

    const chart = await Chart.findOneAndDelete({
      _id: chartId,
      createdBy: req.user._id,
    });

    if (!chart)
      return res
        .status(404)
        .json({ success: false, message: "Chart not found or access denied" });

    res.json({ success: true, message: "Chart deleted" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete chart",
      error: error.message,
    });
  }
};
