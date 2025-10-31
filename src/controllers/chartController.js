import Chart from "../models/chartModel.js";
import Query from "../models/queryModel.js";

export const createChart = async (req, res) => {
  try {
    const { title, type, queryId, config } = req.body;
    if (!title || !type || !queryId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    const query = await Query.findById(queryId);
    if (!query || query.createdBy.toString() !== req.user._id.toString()) {
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
      message: "Chart created",
      data: { chartId: chart._id },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to create chart" });
  }
};

export const getChartData = async (req, res) => {
  try {
    const { chartId } = req.params;
    const chart = await Chart.findById(chartId).populate("queryId");
    if (!chart)
      return res
        .status(404)
        .json({ success: false, message: "Chart not found" });

    if (
      chart.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const result = chart.queryId.result || [];
    return res.json({
      success: true,
      data: { result, config: chart.config, type: chart.type },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch chart" });
  }
};
