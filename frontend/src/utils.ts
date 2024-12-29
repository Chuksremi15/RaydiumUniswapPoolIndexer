import { ethers, formatUnits } from "ethers";
import { PoolData } from "./pages/UniswapPoolsIndexer";

const UNISWAP_V3_POOL_ABI = [
  "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
];

const UNISWAP_V2_POOL_ABI = [
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function totalSupply() view returns (uint256)",
  "function decimals() view returns (uint8)",
];

export async function getPriceAndMarketCapV2(
  poolContract: ethers.Contract,
  provider: ethers.JsonRpcProvider,
  token1USDPrice: number
): Promise<PoolData> {
  try {
    // Fetch token addresses
    const [token0Address, token1Address] = await Promise.all([
      poolContract.token0(),
      poolContract.token1(),
    ]);

    // Create token contracts for fetching decimals and symbols
    const token0Contract = new ethers.Contract(
      token0Address,
      [
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)",
      ],
      provider
    );
    const token1Contract = new ethers.Contract(
      token1Address,
      [
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)",
      ],
      provider
    );

    // Fetch decimals and symbols for both tokens
    const [decimals0, symbol0, decimals1, symbol1] = await Promise.all([
      token0Contract.decimals(),
      token0Contract.symbol(),
      token1Contract.decimals(),
      token1Contract.symbol(),
    ]);

    const poolAddress = await poolContract.getAddress();

    // Fetch reserves from the pool
    const totalSupply = await poolContract.totalSupply();

    // Fetch reserves from the pool
    const [reserve0, reserve1] = await poolContract.getReserves();

    // Normalize reserves using decimals
    const normalizedReserve0 = parseFloat(formatUnits(reserve0, decimals0));
    const normalizedReserve1 = parseFloat(formatUnits(reserve1, decimals1));

    // Calculate price of token0 in terms of token1: price = reserve1 / reserve0
    const priceToken0InToken1 = normalizedReserve1 / normalizedReserve0;

    // Calculate token0 price in USD: priceToken0InToken1 * token1USDPrice
    const priceToken0InUSD = priceToken0InToken1 * token1USDPrice;

    // Market cap of token0 in USD: reserve0 * priceToken0InUSD
    const marketCapToken0USD = normalizedReserve0 * priceToken0InUSD;

    // Market cap of token1 in USD: reserve1 * token1USDPrice
    const marketCapToken1USD = normalizedReserve1 * token1USDPrice;

    const totalLiquidity = normalizedReserve1 * token1USDPrice;

    return {
      poolType: "Uniswap V2",
      poolAddress,
      prices: {
        token0: priceToken0InUSD,
      },
      marketCapsUSD: {
        [symbol0]: marketCapToken0USD,
        [symbol1]: marketCapToken1USD,
      },
      reserves: {
        [symbol0]: normalizedReserve0,
        [symbol1]: normalizedReserve1,
      },
      totalSupply: totalSupply,
      totalLiquidity: totalLiquidity,
      tokens: {
        token0: {
          address: token0Address,
          symbol: symbol0,
          decimals: decimals0,
        },
        token1: {
          address: token1Address,
          symbol: symbol1,
          decimals: decimals1,
        },
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching V2 price and market cap:", errorMessage);

    return { error: errorMessage };
  }
}

// Token total supply (replace with actual value or fetch dynamically from ERC20 contract)
const TOTAL_SUPPLY = 1_000_000_000; // Example total supply

/**
 * Calculate price and market cap for Uniswap V3 pools.
 */
export async function getPriceAndMarketCapV3(
  poolAddress: string,
  provider: ethers.JsonRpcProvider
) {
  try {
    const poolContract = new ethers.Contract(
      poolAddress,
      UNISWAP_V3_POOL_ABI,
      provider
    );

    // Fetch pool's slot0 to get sqrtPriceX96
    const { sqrtPriceX96 } = await poolContract.slot0();

    // Calculate price from sqrtPriceX96
    const price = Number(sqrtPriceX96) ** 2 / 2 ** 192;

    // Calculate market cap
    const marketCap = price * TOTAL_SUPPLY;

    return {
      price,
      marketCap,
      poolType: "Uniswap V3",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching V2 price and market cap:", errorMessage);
    return { error: errorMessage, poolType: "Uniswap V3" };
  }
}

// // Function to get Token Price in USD
// async function getPriceInUSD(
//   priceEth: number,
//   amounts: {
//     amount0In: number;
//     amount1In: number;
//     amount0Out: number;
//     amount1Out: number;
//   }
// ) {
//   let transactionType: string = "";
//   let tokenPrice: number = 0;
//   let token1PriceInUSD: number = 0;

//   const ethPriceInUsd = parseFloat(formatUnits(priceEth, 8)); // Chainlink ETH price feed has 8 decimals

//   // Determine if it's a buy or sell transaction and calculate token price in terms of Token0
//   if (amounts.amount0In > 0 && amounts.amount1Out > 0) {
//     transactionType = "BUY";
//     tokenPrice = amounts.amount0In / amounts.amount1Out; // Price of Token1 in terms of Token0
//   } else if (amounts.amount1In > 0 && amounts.amount0Out > 0) {
//     transactionType = "SELL";
//     tokenPrice = amounts.amount1In / amounts.amount0Out; // Price of Token1 in terms of Token0
//   } else {
//     transactionType = "UNKNOWN";
//   }

//   // Convert Token Price in terms of USD
//   token1PriceInUSD = tokenPrice * ethPriceInUsd;

//   return {
//     transactionType,
//     ethPriceInUsd,
//     time: Date.now(),
//   };
// }

export const LOCAL_URL = "http://localhost:3000";

export const TARGET_MINTS = [
  {
    value: "",
    label: "Select a meme",
  },
  {
    value: "Df6yfrKC8kZE3KNkrHERKzAetSxbrWeniQfyJY4Jpump",
    label: "CHILLGUY",
  },
  { value: "2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump", label: "Pnut" },
  { value: "CzLSujWBLFsSjncfkh59rUFqvafWcY5tzedWJSuypump", label: "GOAT" },
  { value: "8x5VqbHA8D7NkD52uNuS5nnt3PwA8pLD34ymskeSo2Wn", label: "ZEREBRO" },
  { value: "MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5", label: "MEW" },
  { value: "ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82", label: "BOME" },
  {
    value: "7atgF8KQo4wJrD5ATGX7t1V2zVvykPJbFfNeVf1icFv1",
    label: "catwifhat",
  },
  { value: "GJAFwWjJ3vnTsrQVabjBVK2TYB1YtRCQXRDfDgUnpump", label: "ACT" },
  { value: "ED5nyyWEzpPPiWimP8vYm7sD7TD3LAt3Q3gRTWHzPJBY", label: "MOODENG" },
  { value: "8Ki8DpuWNxu9VsS3kQbarsCWMcFGWkzzA8pUPto9zBd5", label: "LOCKIN" },
  { value: "2oGLxYuNBJRcepT1mEV6KnETaLD7Bf6qq3CM6skasBfe", label: "PUPS" },
  { value: "kinXdEcpDQeHPEuQnqmUgtYykqKGVFq6CeVX5iAHJq6", label: "KIN" },
  {
    value: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    label: "dogwifhat",
  },
  { value: "CLoUDKc4Ane7HeQcPpE3YHnznRxhMimJ4MyaUqyHFzAu", label: "cloud" },
  {
    value: "ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx",
    label: "Star Atlas",
  },
  { value: "28tVhteKZkzzWjrdHGXzxfm4SQkhrDrjLur9TYCDVULE", label: "BUU" },
  { value: "9psiRdn9cXYVps4F1kFuoNjd2EtmqNJXrCPmRppJpump", label: "UBC" },
];

export const getSolanaTokenName = (addr: string) => {
  const tokenInfo = TARGET_MINTS.filter(({ value }) => {
    return addr.toLowerCase() === value.toLowerCase();
  });
  return tokenInfo[0].label;
};

export const formatTimestamp = (timestamp: number) => {
  const now = Date.now();
  const elapsedMs = now - timestamp;

  const seconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
  } else if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  } else if (days < 7) {
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  } else if (weeks < 4) {
    return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  } else if (months < 12) {
    return `${months} month${months !== 1 ? "s" : ""} ago`;
  } else {
    return `${years} year${years !== 1 ? "s" : ""} ago`;
  }
};

export const getPriceInSol = (
  base_token_change: string,
  token_change: string
) => {
  return Math.abs(parseFloat(base_token_change) / parseFloat(token_change));
};
export const getValueSolUsd = (solPrice: number, sol: string) => {
  return Math.abs(solPrice * parseFloat(sol));
};
