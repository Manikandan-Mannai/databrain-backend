import mongoose from "mongoose";

const chartSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ["bar", "line", "pie"], required: true },
    queryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Query",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    config: {
      xAxisLabel: { type: String },
      yAxisLabel: { type: String, default: "Values" },
      pieLabel: { type: String },
      pieValue: { type: String },
      stack: { type: Boolean, default: false },
      showLegend: { type: Boolean, default: true },
      showGrid: { type: Boolean, default: true },
    },
    series: [
      {
        name: String,
        type: { type: String, enum: ["bar", "line"], default: "bar" },
        color: String,
      },
    ],
    data: [
      {
        label: String,
        value: Number,
        values: [{ key: String, value: Number }],
      },
    ],
    layout: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      w: { type: Number, default: 6 },
      h: { type: Number, default: 4 },
    },
  },
  { timestamps: true }
);

chartSchema.pre("validate", function (next) {
  if (this.type === "pie") {
    if (!this.config?.pieLabel || !this.config?.pieValue) {
      return next(
        new Error("pieLabel and pieValue are required for pie charts")
      );
    }
    this.config.xAxisLabel = undefined;
    this.series = [];
  } else {
    if (!this.config?.xAxisLabel) {
      return next(new Error("xAxisLabel is required for bar/line charts"));
    }
    if (!Array.isArray(this.series) || this.series.length === 0) {
      return next(
        new Error("At least one series is required for bar/line charts")
      );
    }
  }
  next();
});

export default mongoose.model("Chart", chartSchema);
