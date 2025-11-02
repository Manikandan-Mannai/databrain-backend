import mongoose from "mongoose";

const dashboardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    charts: [
      {
        chartId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Chart",
          required: true,
        },
        layout: {
          x: { type: Number, default: 0 },
          y: { type: Number, default: 0 },
          w: { type: Number, default: 6 },
          h: { type: Number, default: 4 },
        },
      },
    ],
    accessLevel: {
      type: String,
      enum: ["public", "private", "shared"],
      default: "private",
    },
    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Dashboard", dashboardSchema);
