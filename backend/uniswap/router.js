import express from "express";
import { interpretSwapEvent } from "./uniswapLocalFilter.js";
const router = express.Router();

// Store swap event logs
let swapLogs = [];

// Store decrypted swap event logs
const decryptedLogsArray = [];

// Webhook endpoint to handle swap logs
router.post("/webhook", (req, res) => {
  console.log("Received a request!");

  try {
    if (!req.is("application/json")) {
      return res
        .status(400)
        .json({ error: "Content type must be 'application/json'" });
    }

    const log = req.body;

    // Add the new log
    swapLogs.push(...log.filteredReceipts);

    // Ensure array does not exceed MAX_LOGS
    if (swapLogs.length > MAX_LOGS) {
      // Remove the oldest logs to maintain the maximum size
      swapLogs.splice(0, swapLogs.length - MAX_LOGS);
    }

    console.log("Updated swapLogs:", swapLogs);

    res.status(200).json({ status: "Log received and processed" });
  } catch (err) {
    console.error("Error processing request:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to retrieve swap logs data
router.get("/getlogs", (req, res) => {
  try {
    // Send a success response with swap logs
    return res.status(200).json({
      status: "success",
      message: "Data retrieved successfully",
      arrayLength: swapLogs.length,
      data: swapLogs,
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

// Endpoint to retrieve swap logs data
router.get("/getdecryptedlogs", (req, res) => {
  try {
    swapLogs.forEach((data) => {
      let decryptedData;

      data.logs.forEach((logData) => {
        decryptedData = interpretSwapEvent(
          logData,
          data.blockNumber,
          data.transactionHash
        );
      });

      if (decryptedData.contractAddress) {
        decryptedLogsArray.push(decryptedData);
      }
    });

    // Ensure array does not exceed MAX_LOGS
    if (decryptedLogsArray.length > MAX_LOGS) {
      // Remove the oldest logs to maintain the maximum size
      decryptedLogsArray.splice(0, decryptedLogsArray.length - MAX_LOGS);
    }

    return res.status(200).json({
      status: "success",
      message: "Decrypted Logs received successfully",
      arrayLength: decryptedLogsArray.length,
      data: decryptedLogsArray,
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

// Endpoint to retrieve swap logs data
router.get("/getdecryptedpoollogs/:poolAddress", (req, res) => {
  try {
    const { poolAddress } = req.params;

    if (!poolAddress) {
      return res.status(400).json({ error: "Pool address required" });
    }

    // Store decrypted swap event logs for a pool
    const decryptedPoolLogsArray = [];

    swapLogs.forEach((data) => {
      let decryptedData;

      data.logs.forEach((logData) => {
        decryptedData = interpretSwapEvent(
          logData,
          data.blockNumber,
          data.transactionHash
        );

        if (
          decryptedData.contractAddress &&
          poolAddress &&
          decryptedData.contractAddress.toLowerCase() ===
            poolAddress.toLowerCase()
        ) {
          const amounts = decryptedData.amounts;
          let transactionType = "";
          let tokenPrice = 0;
          if (Number(amounts.amount0In) > 0 && Number(amounts.amount1Out) > 0) {
            transactionType = "SELL";
            tokenPrice = Number(amounts.amount0In) / Number(amounts.amount1Out); // Price of Token1 in terms of Token0
          } else if (
            Number(amounts.amount1In) > 0 &&
            Number(amounts.amount0Out) > 0
          ) {
            transactionType = "BUY";
            tokenPrice = Number(amounts.amount1In) / Number(amounts.amount0Out); // Price of Token1 in terms of Token0
          } else {
            transactionType = "UNKNOWN";
          }

          decryptedData.transactionType = transactionType;
          decryptedData.tokenPrice = tokenPrice;
          decryptedData.timeCreated = Date.now();

          decryptedPoolLogsArray.push(decryptedData);
        } else {
          console.error("Invalid data: ", {
            contractAddress: decryptedData.contractAddress,
            poolAddress,
          });
        }
      });
    });

    return res.status(200).json({
      status: "success",
      message: "Decrypted Logs received successfully",
      arrayLength: decryptedPoolLogsArray.length,
      data: decryptedPoolLogsArray,
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

export default router;
