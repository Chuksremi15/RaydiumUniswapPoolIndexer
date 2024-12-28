function main(stream) {
  try {
    var data = stream[0];
    var filteredReceipts = [];
    data.forEach((receipt) => {
      let relevantLogs = receipt.logs.filter(
        (log) =>
          log.topics[0] ===
          "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67"
      );
      if (relevantLogs.length > 0) {
        filteredReceipts.push(receipt);
      }
    });

    return {
      filteredReceipts,
    };
  } catch (e) {
    return { error: e.message };
  }
}

// Webhook endpoint to handle incoming data
app.post("/webhook", (req, res) => {
  console.log("Received a request!");
  try {
    if (req.is("application/json")) {
      const data = req.body;

      if (allReceipts.length > 10) {
        allReceipts.splice(0, 10);
      }

      allReceipts.push(data);

      console.log("allReceipts:", data);

      res.status(200).json({ status: "Data received and saved" });
    } else {
      console.error("Request content type is not JSON.");
      return res
        .status(200)
        .json({ error: "Content type must be 'application/json'" });
    }
  } catch (err) {
    console.error("Error processing request:", err.message);
    res.status(500).json({ error: err.message });
  }
});
