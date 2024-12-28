import { Connection, PublicKey } from "@solana/web3.js";
import { useState } from "react";
import { PoolData } from "./UniswapPoolsIndexer";
import { AddressDisplay } from "../components/AddressDisplay";
import { Nav } from "../components/Nav";
import {
  LOCAL_URL,
  TARGET_MINTS,
  formatTimestamp,
  getSolanaTokenName,
} from "../utils";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Define the type for each interpreted swap event
export type RaydiumSwapEvent = {
  transactionType: "BUY" | "SELL"; // Assuming other possible types
  timeCreated: number;
  baseTokenAddr: string[];
  tokenAddr: string;
  baseTokenChange: number;
  tokenChange: number;
  owner: string;
};

const SolPoolIndexer = () => {
  const [swapEvents, setSwapEvents] = useState<RaydiumSwapEvent[]>([]);

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

  const [inputVal, setInputVal] = useState("");

  const fetchUserData = async (tokenAddress: string) => {
    if (!tokenAddress) throw new Error("Address is required");
    const { data } = await axios.get(
      `${LOCAL_URL}/raydium/getswaps/${tokenAddress}`
    );
    return data;
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["user", inputVal], // Query key includes inputVal
    queryFn: () => fetchUserData(inputVal), // Fetch function
    enabled: !!inputVal, // Automatically runs when inputVal is non-empty
    refetchInterval: 5000, // Refetch every 5000 milliseconds (5 seconds)
  });

  console.log("data", data);

  return (
    <div className="bg-dark font-body h-screen">
      <div className="h-screen font-body container mx-auto text-white flex flex-col gap-y-6 py-10">
        <Nav />

        <div className="flex items-center w-[350px] relative mx-auto">
          <select
            className="input text-sm text-white bg-tablebg rounded-xl border-gray2 h-14 focus:outline-0 focus:gray2 w-[350px] mx-auto focus:text-sm pl-4 pr-12 border placeholder:text-sm transition-all duration-300"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            data-testid="search-input-box-fake"
          >
            {TARGET_MINTS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
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
                    {inputVal && getSolanaTokenName(inputVal)}
                  </th>
                  <th scope="col" className="px-4 py-3 font-normal ">
                    Solana
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
                  {!isLoading && !isError && data ? (
                    data.data.length > 0 &&
                    [...data.data].reverse().map((data, index) => (
                      <tr key={index} className="hover:bg-gray-750 transition">
                        <td className="px-4 py-4 text-gray">
                          <div
                            onClick={() => {
                              console.log(data, "data");
                            }}
                          >
                            {formatTimestamp(data.time_created)}
                          </div>
                        </td>
                        {data.transaction_type === "BUY" ? (
                          <>
                            <td className="px-4 py-4">
                              <div className="text-green bg-greenbg p-1 w-12 flex items-center justify-center rounded">
                                Buy
                              </div>
                            </td>
                            <td className="px-4 py-4 text-green">
                              <div>{data.token_change}</div>
                            </td>
                            <td className="px-4 py-4 text-green">
                              <div> {data.base_token_change}</div>
                            </td>
                            <td className="px-4 py-4 text-green">$40,000</td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-4">
                              <div className="text-[#F04866] bg-[#42222B] p-1 w-12 flex items-center justify-center rounded">
                                SELL
                              </div>
                            </td>
                            <td className="px-4 py-4 text-[#F094A4]">
                              <div>{data.token_change}</div>
                            </td>

                            <td className="px-4 py-4 text-[#F094A4]">
                              <div> {data.base_token_change}</div>
                            </td>

                            <td className="px-4 py-4 text-[#F094A4]">
                              $40,000
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  ) : (
                    <></>
                  )}
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
};

export default SolPoolIndexer;
