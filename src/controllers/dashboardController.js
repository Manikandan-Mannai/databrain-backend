import Dashboard from "../models/dashboardModel.js";
import Chart from "../models/chartModel.js";

export const saveDashboard = async (req, res) => {
  const session = await Dashboard.db.startSession();
  session.startTransaction();

  try {
    const { name, charts } = req.body;
    if (!name || !Array.isArray(charts) || charts.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Dashboard name and at least one chart required",
      });
    }

    for (const { chartId } of charts) {
      const chart = await Chart.findOne({
        _id: chartId,
        createdBy: req.user._id,
      }).session(session);
      if (!chart) {
        return res.status(403).json({
          success: false,
          message: `Chart ${chartId} not found or access denied`,
        });
      }
    }

    const dashboard = await Dashboard.create(
      [
        {
          name,
          charts: charts.map((c) => ({
            chartId: c.chartId,
            layout: c.layout || { x: 0, y: 0, w: 6, h: 4 },
          })),
          createdBy: req.user._id,
        },
      ],
      { session }
    );

    await dashboard[0].populate("charts.chartId");
    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "Dashboard saved",
      data: { dashboardId: dashboard[0]._id },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Dashboard save failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to save dashboard",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

export const getAllDashboards = async (req, res) => {
  try {
    const dashboards = await Dashboard.find({ createdBy: req.user._id })
      .populate({
        path: "charts.chartId",
        select: "title type config series data layout",
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: dashboards });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboards",
      error: error.message,
    });
  }
};

export const getDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === "undefined" || id === "null") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing dashboard ID" });
    }

    const dashboard = await Dashboard.findOne({
      _id: id,
      createdBy: req.user._id,
    }).populate("charts.chartId", "title type config layout");

    if (!dashboard) {
      return res
        .status(404)
        .json({ success: false, message: "Dashboard not found" });
    }

    return res.json({ success: true, data: dashboard });
  } catch (error) {
    console.error("getDashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard",
      error: error.message,
    });
  }
};
