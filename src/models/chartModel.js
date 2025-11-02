import mongoose from "mongoose";

const valueSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: { type: Number, required: true },
});

const dataPointSchema = new mongoose.Schema({
  label: { type: String, required: true },
  values: [valueSchema],
});

const seriesSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["bar", "line", "area", "pie"], default: "bar" },
  color: { type: String },
  yAxis: { type: String },
});

const chartSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["bar", "line", "pie", "mixed"],
      required: true,
    },
    queryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Query",
      required: true,
    },
    config: {
      xAxisLabel: { type: String, required: true },
      yAxisLabel: { type: String },
      multipleAxis: { type: Boolean, default: false },
      groupBy: { type: String },
      stack: { type: Boolean, default: false },
      showLegend: { type: Boolean, default: true },
      showGrid: { type: Boolean, default: true },
    },
    series: [seriesSchema],
    data: {
      type: [dataPointSchema],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length === 0 || arr.every((d) => d.label != null);
        },
        message: "Each data point must have a valid label",
      },
    },
    layout: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      w: { type: Number, default: 6 },
      h: { type: Number, default: 4 },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Chart", chartSchema);
