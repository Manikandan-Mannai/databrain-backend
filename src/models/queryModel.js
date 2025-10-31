import mongoose from "mongoose";

const querySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dataSourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DataSource",
      required: true,
    },
    config: {
      groupBy: String,
      metrics: [
        {
          column: String,
          aggregation: {
            type: String,
            enum: ["SUM", "AVG", "COUNT", "MIN", "MAX"],
          },
          as: String,
        },
      ],
      filters: [
        {
          column: String,
          operator: {
            type: String,
            enum: ["=", ">", "<", ">=", "<=", "!=", "contains"],
          },
          value: String,
        },
      ],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Query", querySchema);
