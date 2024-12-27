function main(stream) {
  try {
    var data = stream[0];
    var filteredReceipts = [];

    // Keccak hash of the Swap event for Uniswap V2 and V3
    const uniswapV2SwapTopic =
      "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822";
    const uniswapV3SwapTopic =
      "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67";
    const swapTopics = new Set([uniswapV2SwapTopic, uniswapV3SwapTopic]);

    data.forEach((receipt) => {
      let relevantLogs = receipt.logs.filter(
        (log) => swapTopics.has(log.topics[0]) // Check if the log is a Swap event
      );

      if (relevantLogs.length > 0) {
        filteredReceipts.push({
          transactionHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber,
          logs: relevantLogs.map((log) => ({
            address: log.address,
            topics: log.topics,
            data: log.data,
          })),
        });
      }
    });

    return {
      filteredReceipts,
    };
  } catch (e) {
    return { error: e.message };
  }
}
