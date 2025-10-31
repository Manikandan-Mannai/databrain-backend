import mongoose from "mongoose";

const dataSourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    collectionName: { type: String, required: true, unique: true },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rowCount: { type: Number, required: true },
    columns: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("DataSource", dataSourceSchema);
