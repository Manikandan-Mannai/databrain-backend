import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import DataSource from "../models/dataModel.js";
import mongoose from "mongoose";

const upload = multer({ dest: "uploads/" });

export const uploadCSV = [
  upload.single("file"),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }

      const { name } = req.body;
      if (!name || name.trim() === "") {
        return res
          .status(400)
          .json({ success: false, message: "File name is required" });
      }

      const results = [];
      const columns = new Set();

      await new Promise((resolve, reject) => {
        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on("headers", (headers) => {
            headers.forEach((h) => columns.add(h.trim()));
          })
          .on("data", (data) => {
            const cleaned = {};
            Object.keys(data).forEach((key) => {
              const rawValue = data[key].trim();
              const cleanKey = key.trim();
              cleaned[cleanKey] =
                rawValue === "" || isNaN(rawValue)
                  ? rawValue
                  : Number(rawValue);
            });
            results.push(cleaned);
          })
          .on("end", resolve)
          .on("error", reject);
      });

      if (results.length === 0) {
        fs.unlinkSync(req.file.path);
        return res
          .status(400)
          .json({ success: false, message: "CSV file is empty" });
      }

      const collectionName = `data_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const collection = mongoose.connection.collection(collectionName);

      await collection.insertMany(results, { session });

      const dataSource = await DataSource.create(
        [
          {
            name: name.trim(),
            collectionName,
            uploadedBy: req.user._id,
            rowCount: results.length,
            columns: Array.from(columns),
          },
        ],
        { session }
      );

      await session.commitTransaction();
      fs.unlinkSync(req.file.path);

      return res.status(201).json({
        success: true,
        message: "CSV uploaded and processed successfully",
        data: {
          dataSourceId: dataSource[0]._id,
          name: dataSource[0].name,
          rowCount: dataSource[0].rowCount,
          columns: dataSource[0].columns,
          uploadedAt: dataSource[0].createdAt,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      if (req.file?.path) fs.unlinkSync(req.file.path);
      console.error("CSV Upload Failed:", error.message);
      return res
        .status(500)
        .json({ success: false, message: "Failed to process CSV file" });
    } finally {
      session.endSession();
    }
  },
];
