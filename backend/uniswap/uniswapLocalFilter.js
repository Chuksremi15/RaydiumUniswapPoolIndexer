export function interpretSwapEvent(
  log,
  paramsblockNumber,
  paramstransactionHash
) {
  // Decode the topics and data from the log
  const SWAP_EVENT_SIGNATURE =
    "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822";

  if (log.topics[0] !== SWAP_EVENT_SIGNATURE) {
    return { error: "Not a Swap event." };
  }

  try {
    // Extract the data fields
    const amount0In = BigInt(`0x${log.data.slice(2, 66)}`);
    const amount1In = BigInt(`0x${log.data.slice(66, 130)}`);
    const amount0Out = BigInt(`0x${log.data.slice(130, 194)}`);
    const amount1Out = BigInt(`0x${log.data.slice(194, 258)}`);

    // Extract indexed fields (sender and recipient addresses)
    const sender = `0x${log.topics[1].slice(-40)}`;
    const to = `0x${log.topics[2].slice(-40)}`;

    // Interpret the block and transaction metadata
    const blockNumber = parseInt(paramsblockNumber, 16);
    const transactionHash = paramstransactionHash;

    // Convert amounts to decimal format (assuming 18 decimals)
    const decimals = 18;
    //const formatAmount = (value) => Number(value) / 10 ** decimals;

    return {
      blockNumber,
      transactionHash,
      contractAddress: log.address,
      sender,
      recipient: to,
      amounts: {
        amount0In: amount0In.toString(),
        amount1In: amount1In.toString(),
        amount0Out: amount0Out.toString(),
        amount1Out: amount1Out.toString(),
      },
    };
  } catch (error) {
    return { error: `Failed to interpret log: ${error.message}` };
  }
}

// Example usage
const log = {
  address: "0xac03e049ca564d923321610747c072a325f18acc",
  data: "0x00000000000000000000000000000000000000000000013aa4a70d531e799680000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000973fa8a71125955",
  topics: [
    "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822",
    "0x00000000000000000000000080a64c6d7f12c47b7c66c5b4e20e72bc1fcd5d9e",
    "0x00000000000000000000000080a64c6d7f12c47b7c66c5b4e20e72bc1fcd5d9e",
  ],
};
const blockNumber = "0x1477806";
const transactionHash =
  "0x970e049fde67488a2b161e29bab7c2ffd35161590991c79ad778c9e305c9a844";

console.log(interpretSwapEvent(log, blockNumber, transactionHash));
