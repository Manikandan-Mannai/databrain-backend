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
    config: {
      xAxis: String,
      yAxis: String,
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
