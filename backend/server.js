import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.route.js";
import electionRouter from "./routes/election.route.js";
import roleRouter from "./routes/role.route.js";


// Load environment variables and connect to the database
dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/election", electionRouter);
app.use("/api/role", roleRouter);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
