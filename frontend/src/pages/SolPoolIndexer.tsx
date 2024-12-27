import { Connection, PublicKey } from "@solana/web3.js";

const SolPoolIndexer = () => {
  // Raydium AMM program ID
  const RAYDIUM_AMM_PROGRAM_ID = new PublicKey(
    "4ZJHn7RA5kW7ph9zud2yujSmBChNWW1ZyR69KrwArz5Y"
  );

  // Raydium pool address (replace with your target pool)
  const POOL_ADDRESS = new PublicKey(
    "Bzc9NZfMqkXR6fz1DBph7BDf9BroyEf6pnzESP7v5iiw"
  );

  // Initialize Solana connection
  const connection = new Connection(
    "https://api.mainnet-beta.solana.com",
    "confirmed"
  );

  async function monitorRaydiumSwaps() {
    console.log("Monitoring Raydium swaps...");

    // Subscribe to logs for the Raydium program
    connection.onLogs(
      POOL_ADDRESS,
      (logs, context) => {
        console.log("New logs detected:", logs);

        // Check if the logs contain a "swap" event
        if (logs.logs.some((log) => log.includes("swap"))) {
          console.log("Swap detected in the Raydium pool!");
        }
      },
      "confirmed"
    );
  }

  // Start monitoring
  monitorRaydiumSwaps();

  return (
    <div>
      <h1 className="text-black"> SolPoolIndexer</h1>
    </div>
  );
};

export default SolPoolIndexer;
