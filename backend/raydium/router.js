import express from "express";
import { filterRaydiumSwap } from "./raydiumSwapLocalFilter.js";
import { MAX_LOGS } from "../constant.js";
import { client } from "../db.js";
import { getTokenMetadata } from "./getTokenMetadata.js";

const router = express.Router();

// Store swap event logs
let raydiumSwapLogs = [];

const query = `
      INSERT INTO transactions (
        transaction_type, 
        time_created, 
        base_token_addr, 
        token_addr, 
        base_token_change, 
        token_change, 
        owner
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

router.post("/webhook", async (req, res) => {
  console.log("Received a request!");

  try {
    if (!req.is("application/json")) {
      return res
        .status(400)
        .json({ error: "Content type must be 'application/json'" });
    }

    const log = req.body;

    console.log("log", log.transactions[0]);

    res.status(200).json({ status: "Log received and processed" });

    const data = filterRaydiumSwap(log.transactions[0].ownerBalanceChanges);

    // Add new logs that token address exist
    if (data.tokenAddr) {
      raydiumSwapLogs.push(data);

      // Parameters
      const values = [
        data.transactionType,
        data.timeCreated,
        data.baseTokenAddr,
        data.tokenAddr,
        data.baseTokenChange,
        data.tokenChange,
        data.owner,
      ];

      // Execute query
      await client.query(query, values);
    }

    // Ensure array does not exceed MAX_LOGS
    if (raydiumSwapLogs.length > MAX_LOGS) {
      // Remove the oldest logs to maintain the maximum size
      raydiumSwapLogs.splice(0, raydiumSwapLogs.length - MAX_LOGS);
    }
  } catch (err) {
    console.error("Error processing request:", err.message);
    //res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to retrieve swap logs data
router.get("/getswaps/:tokenAddress", async (req, res) => {
  try {
    const { tokenAddress } = req.params;

    if (!tokenAddress) {
      return res.status(400).json({ error: "Pool address required" });
    }

    // Store decrypted swap event logs for a pool
    const tokenSwapsArray = [];

    // Query to fetch all rows
    const result = await client.query("SELECT * FROM transactions");

    const swapTransactions = result.rows;

    swapTransactions.forEach((data) => {
      if (data.token_addr.toLowerCase() === tokenAddress.toLowerCase()) {
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

//end point to retrieve token metadata
router.get("/getmetadata/:tokenAddress", async (req, res) => {
  try {
    const { tokenAddress } = req.params;

    if (!tokenAddress) {
      return res.status(400).json({ error: "token address required" });
    }

    const metaData = await getTokenMetadata(tokenAddress);

    return res.status(200).json({
      status: "success",
      message: "metadata fetched successfully",
      data: metaData,
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
