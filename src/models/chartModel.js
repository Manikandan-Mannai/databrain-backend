// backend/models/chartModel.ts
import mongoose from "mongoose";

const seriesSchema = new mongoose.Schema({
  yField: { type: String, required: true },
  name: { type: String },
  type: { type: String, enum: ["bar", "line", "area"], default: "bar" },
  color: { type: String },
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
      xAxis: { type: String, required: true },
      groupBy: { type: String },
      series: [seriesSchema],
      stack: { type: Boolean, default: false },
      pie: {
        valueField: { type: String },
        labelField: { type: String },
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
