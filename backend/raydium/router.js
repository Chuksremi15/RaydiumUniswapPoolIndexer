import express from "express";
import { filterRaydiumSwap } from "./raydiumSwapLocalFilter.js";
const router = express.Router();

// Store swap event logs
let raydiumSwapLogs = [];

router.post("/webhook", (req, res) => {
  console.log("Received a request!");

  try {
    if (!req.is("application/json")) {
      return res
        .status(400)
        .json({ error: "Content type must be 'application/json'" });
    }

    const log = req.body;

    const data = filterRaydiumSwap(log.transactions[0].ownerBalanceChanges);

    // Add new logs that token address exist
    if (data.tokenAddr) {
      raydiumSwapLogs.push(data);
    }

    console.log("log :", data);

    // Ensure array does not exceed MAX_LOGS
    if (raydiumSwapLogs.length > MAX_LOGS) {
      // Remove the oldest logs to maintain the maximum size
      raydiumSwapLogs.splice(0, raydiumSwapLogs.length - MAX_LOGS);
    }

    res.status(200).json({ status: "Log received and processed" });
  } catch (err) {
    console.error("Error processing request:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to retrieve swap logs data
router.get("/getswaps/:tokenAddress", (req, res) => {
  try {
    const { tokenAddress } = req.params;

    if (!tokenAddress) {
      return res.status(400).json({ error: "Pool address required" });
    }

    // Store decrypted swap event logs for a pool
    const tokenSwapsArray = [];

    raydiumSwapLogs.forEach((data) => {
      if (data.tokenAddr.toLowerCase() === tokenAddress.toLowerCase()) {
        tokenSwapsArray.push(data);
      }
    });

    return res.status(200).json({
      status: "success",
      message: "Decrypted Logs received successfully",
      arrayLength: tokenSwapsArray.length,
      data: tokenSwapsArray,
    });
  } catch (err) {
    console.error("Error retrieving data:", err.message);

    // Send a 500 error response with error details
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve data",
      error: err.message,
    });
  }
});

//tokenSwapsArray.some((obj) => obj.timeCreated === data.timeCreated)

export default router;
