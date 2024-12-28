import express from "express";
import "dotenv/config";
import cors from "cors";
import { PORT } from "./constant.js";
import raydium from "./raydium/router.js";
import uniswap from "./uniswap/router.js";
import { connectToDatabase } from "./db.js";

connectToDatabase();

const app = express();

// Database connection configuration

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Middleware to parse JSON payloads
app.use(express.json());

//Mount routers

app.use("/raydium", raydium);
app.use("/uniswap", uniswap);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
