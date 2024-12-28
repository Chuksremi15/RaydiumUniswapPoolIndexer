import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { LOCAL_URL, formatTimestamp, getPriceAndMarketCapV2 } from "../utils";
import { ethers, formatUnits } from "ethers";
import { AddressDisplay } from "../components/AddressDisplay";

import { Nav } from "../components/Nav";

const CHAINLINK_ETH_USD_PRICE_FEED =
  "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419"; // Ethereum Mainnet ETH/USD Price Feed

const AGGREGATOR_ABI = [
  "function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
];

// ABIs for Uniswap V2 and V3
const UNISWAP_V2_POOL_ABI = [
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function totalSupply() view returns (uint256)",
  "function decimals() view returns (uint8)",
];

const fetchUserData = async (poolAddress: string) => {
  if (!poolAddress) throw new Error("Address is required");
  const { data } = await axios.get(
    `${LOCAL_URL}/getdecryptedpoollogs/${poolAddress}`
  );
  return data;
};

// Define the type for each interpreted swap event
export type SwapEvent = {
  blockNumber: number;
  transactionHash: string;
  contractAddress: string;
  sender: string;
  recipient: string;
  amounts: {
    amount0In: number;
    amount1In: number;
    amount0Out: number;
    amount1Out: number;
  };
  tokenPrice: number;
  transactionType: string;
};

interface TokenData {
  address: string;
  symbol: string;
  decimals: number;
}

export interface PoolData {
  poolType: string;
  poolAddress: string;
  prices: {
    token0: number; // Example: "TOKEN0/USD": 2500
  };
  marketCapsUSD: {
    [key: string]: number; // Example: "TOKEN0": 5000000
  };
  reserves: {
    [key: string]: number; // Example: "TOKEN0": 2000
  };
  totalSupply: number;
  totalLiquidity: number; // Total liquidity token supply
  tokens: {
    token0: TokenData;
    token1: TokenData;
  };
  error?: string;
}

function EthPoolIndexer() {
  // Define an interface for the expected response data

  const [inputVal, setInputVal] = useState("");

  const [swapEvents, setSwapEvents] = useState<SwapEvent[]>([]);

  const [poolContract, setPoolContract] = useState<ethers.Contract | null>(
    null
  );
  const [priceField, setPriceField] = useState<ethers.Contract | null>(null);
  const [poolLoading, setPoolLoading] = useState<boolean>(true);

  const [poolData, setPoolData] = useState<PoolData>({
    poolType: "Uniswap V2",
    poolAddress: "",
    prices: {
      token0: 0,
    },
    marketCapsUSD: {
      TOKEN0: 0,
      TOKEN1: 0,
    },
    reserves: {
      TOKEN0: 0,
      TOKEN1: 0,
    },
    totalSupply: 0,
    totalLiquidity: 0,
    tokens: {
      token0: {
        address: "",
        symbol: "",
        decimals: 0,
      },
      token1: {
        address: "",
        decimals: 0,
        symbol: "",
      },
    },
  });

  const clearInputValue = () => {
    setInputVal("");
  };

  const provider = new ethers.JsonRpcProvider(
    "https://eth-mainnet.g.alchemy.com/v2/WRfOIcBVkpcGsJC6qHPP3kCTMkRbGlzf"
  );

  useEffect(() => {
    try {
      if (!inputVal) return;
      setPoolLoading(true);

      const poolContractstate = new ethers.Contract(
        inputVal,
        UNISWAP_V2_POOL_ABI,
        provider
      );

      const getPrice = async () => {
        const priceFeed = new ethers.Contract(
          CHAINLINK_ETH_USD_PRICE_FEED,
          AGGREGATOR_ABI,
          provider
        );
        setPriceField(priceFeed);
        const [, answer] = await priceFeed.latestRoundData(); // Destructure to get the price
        parseFloat(formatUnits(answer, 8));

        const v2Data = await getPriceAndMarketCapV2(
          poolContractstate,
          provider,
          parseFloat(formatUnits(answer, 8))
        );

        setPoolData(v2Data);

        console.log("Uniswap V2 Data:", v2Data);
      };

      getPrice();

      setPoolContract(poolContractstate);

      setPoolLoading(false);
    } catch (error) {
      setPoolData({
        poolType: "Uniswap V2",
        poolAddress: "",
        prices: { token0: 0 },
        marketCapsUSD: {},
        reserves: {},
        totalSupply: 0,
        totalLiquidity: 0,
        tokens: {
          token0: { address: "", symbol: "", decimals: 0 },
          token1: { address: "", symbol: "", decimals: 0 },
        },
        error: error instanceof Error ? error.message : "Unknown error", // Include the error message
      });
      setPoolLoading(false);
    }
  }, [inputVal]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["user", inputVal], // Query key includes inputVal
    queryFn: () => fetchUserData(inputVal), // Fetch function
    enabled: !!inputVal, // Automatically runs when inputVal is non-empty
    refetchInterval: 5000, // Refetch every 5000 milliseconds (5 seconds)
  });

  useEffect(() => {
    if (data && data.data.length > 0) {
      // setSwapEvents((prev) => {
      //   const existingIds = new Set(prev.map((item) => item.id)); // Collect existing IDs
      //   const newEvents = data.data.filter((item) => !existingIds.has(item.id)); // Filter new items
      //   return [...prev, ...newEvents]; // Add only unique items
      // });

      console.log("data", data.data);
      console.log("swaps", swapEvents);

      let v2Data = {};

      const getPrice = async () => {
        if (priceField && poolContract) {
          const [, answer] = await priceField.latestRoundData(); // Destructure to get the price
          parseFloat(formatUnits(answer, 8));

          v2Data = await getPriceAndMarketCapV2(
            poolContract,
            provider,
            parseFloat(formatUnits(answer, 8))
          );

          console.log("Uniswap V2 Data:", v2Data);
        }
      };

      getPrice();
    }
  }, [data]);

  return (
    <div className="bg-dark font-body h-screen">
      <div className="h-screen font-body container mx-auto text-white flex flex-col gap-y-6 py-10">
        <Nav />

        <div className="flex items-center w-[350px] relative mx-auto">
          <input
            className="input text-sm text-white bg-tablebg rounded-xl border-gray2 h-14 focus:outline-0 focus:gray2 w-[350px] mx-auto  focus:text-sm  pl-4 pr-12 border   placeholder:text-sm  transition-all duration-300"
            placeholder="Enter Uniswap pool addresss"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            readOnly={false}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            data-testid="search-input-box-fake"
          />

          <div
            onClick={() => clearInputValue()}
            className="absolute right-4 hover:scale-95  transition-all duration-200 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
        </div>

        <div className="flex gap-x-6 justify-between mx-auto w-full">
          <div className="bg-tablebg rounded-lg shadow-lg w-full">
            <table className="w-full text-sm text-left">
              <thead className="border-b border-gray2 text-gray2">
                <tr>
                  <th scope="col" className="px-4 py-3 font-normal ">
                    Time
                  </th>
                  <th scope="col" className="px-4 py-3 font-normal ">
                    Type
                  </th>
                  <th scope="col" className="px-4 py-3 font-normal ">
                    {poolData && poolData.tokens.token0.symbol}
                  </th>
                  <th scope="col" className="px-4 py-3 font-normal ">
                    {poolData && poolData.tokens.token1.symbol}
                  </th>
                  <th scope="col" className="px-4 py-3 font-normal ">
                    Price
                  </th>
                </tr>
              </thead>
            </table>
            <div className="h-[500px] overflow-y-scroll">
              <table className="w-full text-sm text-left">
                <tbody className=" divide-gray2 ">
                  {swapEvents.length > 0 &&
                    [...swapEvents].reverse().map((data, index) => (
                      <tr key={index} className="hover:bg-gray-750 transition">
                        <td className="px-4 py-4 text-gray">
                          <div>{formatTimestamp(data.timeCreated)}</div>
                        </td>
                        {data.transactionType === "BUY" ? (
                          <td className="px-4 py-4">
                            <div className="text-green bg-greenbg p-1 w-12 flex items-center justify-center rounded">
                              Buy
                            </div>
                          </td>
                        ) : (
                          <td className="px-4 py-4">
                            <div className="text-[#F04866] bg-[#42222B] p-1 w-12 flex items-center justify-center rounded">
                              SELL
                            </div>
                          </td>
                        )}
                        {data.transactionType === "BUY" ? (
                          <>
                            <td className="px-4 py-4 text-green">
                              <div>
                                {formatUnits(data.amounts.amount0Out, 18)}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-green">
                              <div>
                                {" "}
                                {formatUnits(data.amounts.amount1In, 18)}
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-4 text-green">
                              <div>
                                {formatUnits(data.amounts.amount0In, 18)}
                              </div>
                            </td>

                            <td className="px-4 py-4 text-green">
                              <div>
                                {" "}
                                {formatUnits(data.amounts.amount1Out, 18)}
                              </div>
                            </td>
                          </>
                        )}

                        <td className="px-4 py-4 text-green">$40,000</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-y-4">
            <div className="bg-tablebg font-body p-4 rounded-lg  w-[400px] h-[200px]">
              <p className="text-ash text-base mb-4">Token info</p>

              {!poolLoading && poolData && (
                <div className="flex flex-col gap-y-4">
                  <div className="flex justify-between ">
                    <p className="text-gray2 text-sm">Price</p>
                    <p className="text-ash text-sm">{poolData.prices.token0}</p>
                  </div>
                  <div className="flex justify-between ">
                    <p className="text-gray2 text-sm">Total supply</p>
                    <p className="text-ash text-sm">{poolData.totalSupply}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-gray2 text-sm">Pair</p>
                    <AddressDisplay address={poolData.tokens.token0.address} />
                  </div>
                  <div className="flex justify-between ">
                    <p className="text-gray2 text-sm">Token symbol</p>
                    <p className="text-ash text-sm">
                      {poolData.tokens.token0.symbol}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-tablebg font-body p-4 rounded-lg  w-[400px] h-[200px]">
              <p className="text-ash text-base mb-4">Pool info</p>

              {!poolLoading && poolData && (
                <div className="flex flex-col gap-y-4">
                  <div className="flex justify-between ">
                    <p className="text-gray2 text-sm">Pool Type</p>
                    <p className="text-ash text-sm">{poolData.poolType}</p>
                  </div>
                  <div className="flex justify-between ">
                    <p className="text-gray2 text-sm">Address</p>
                    <AddressDisplay address={poolData.poolAddress} />
                  </div>
                  <div className="flex justify-between ">
                    <p className="text-gray2 text-sm">Token creator</p>
                    <p className="text-ash text-sm">FqD1C...7rF</p>
                  </div>
                  <div className="flex justify-between ">
                    <p className="text-gray2 text-sm">Pool created </p>
                    <p className="text-ash text-sm">12/21/2024 23:52</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EthPoolIndexer;
