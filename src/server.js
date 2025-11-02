import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import chartRoutes from "./routes/chartRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";
import queryRoutes from "./routes/queryRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import cors from "cors";

dotenv.config();

const app = express();
connectDB();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/charts", chartRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
