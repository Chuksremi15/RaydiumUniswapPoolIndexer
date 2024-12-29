import { useState } from "react";
import { AddressDisplay } from "../components/AddressDisplay";
import { Nav } from "../components/Nav";
import {
  TARGET_MINTS,
  formatTimestamp,
  getPriceInSol,
  getSolanaTokenName,
  getValueSolUsd,
} from "../utils";
import { useQuery } from "@tanstack/react-query";
import { fetchSolPrice, fetchSwaps, fetchTokenData } from "../api";
import { Icons } from "./Icons";

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
  const [inputVal, setInputVal] = useState("");

  const {
    data: tokenData,
    isLoading: istokenDataLoading,
    isError: istokenDataIsError,
    error: tokenDataError,
  } = useQuery({
    queryKey: [inputVal, "tokenData"], // Query key includes inputVal
    queryFn: () => fetchTokenData(inputVal), // Fetch function
    enabled: !!inputVal,
    refetchInterval: false,
  });

  console.log("tokenData", tokenData);

  const {
    data: solPrice,
    isLoading: isSolPriceLoading,
    isError: isSolPriceIsError,
    error: solPriceError,
  } = useQuery({
    queryKey: [inputVal, "solPrice"], // Query key includes inputVal
    queryFn: () => fetchSolPrice(), // Fetch function
    enabled: true,
    refetchInterval: 90000,
  });

  console.log("sol Price", solPrice);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [inputVal, "user"], // Query key includes inputVal
    queryFn: () => fetchSwaps(inputVal), // Fetch function
    enabled: !!inputVal, // Automatically runs when inputVal is non-empty
    refetchInterval: 5000,
  });

  return (
    <div className="bg-dark font-body h-screen overflow-scroll ">
      <div className="h-screen font-body container mx-auto text-white flex flex-col gap-y-2 py-10">
        <Nav />

        <div className="flex items-center w-[350px] relative mx-auto mb-2">
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

        <div className="flex gap-x-6 justify-between mx-auto w-full pb-20">
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
                    USD
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
                          <div>{formatTimestamp(data.time_created)}</div>
                        </td>

                        {data.transaction_type === "BUY" ? (
                          <>
                            <td className="px-4 py-4">
                              <div className="text-green bg-greenbg p-1 w-12 flex items-center justify-center rounded">
                                Buy
                              </div>
                            </td>
                            <td className="px-4 py-4 text-green">
                              <div>
                                {Math.abs(
                                  getValueSolUsd(
                                    solPrice,
                                    data.base_token_change
                                  )
                                ).toFixed(6)}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-green">
                              <div>
                                {Math.abs(
                                  parseFloat(data.token_change)
                                ).toFixed(6)}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-green">
                              <div>
                                {" "}
                                {Math.abs(
                                  parseFloat(data.base_token_change)
                                ).toFixed(6)}
                              </div>
                            </td>

                            <td className="px-4 py-4 text-green">
                              {getPriceInSol(
                                data.base_token_change,
                                data.token_change
                              ).toFixed(6)}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-4">
                              <div className="text-[#F04866] bg-[#42222B] p-1 w-12 flex items-center justify-center rounded">
                                SELL
                              </div>
                            </td>
                            <td className="px-4 py-4 text-[#F094A4]">
                              <div>
                                {Math.abs(
                                  getValueSolUsd(193, data.base_token_change)
                                ).toFixed(6)}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-[#F094A4]">
                              <div>
                                {Math.abs(
                                  parseFloat(data.token_change)
                                ).toFixed(6)}
                              </div>
                            </td>

                            <td className="px-4 py-4 text-[#F094A4]">
                              <div>
                                {" "}
                                {Math.abs(
                                  parseFloat(data.base_token_change)
                                ).toFixed(6)}
                              </div>
                            </td>

                            <td className="px-4 py-4 text-[#F094A4]">
                              {getPriceInSol(
                                data.base_token_change,
                                data.token_change
                              ).toFixed(6)}
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
            <div className="bg-tablebg font-body py-4 rounded-lg  w-[400px] ">
              <p className="text-ash text-base mb-2 px-4">Token info</p>

              {istokenDataLoading ? (
                <div className="py-16 flex items-center justify-center w-full">
                  <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin " />
                </div>
              ) : (
                tokenData && (
                  <div>
                    <div className="h-[350px] mb-4">
                      <img
                        className="h-full w-full object-cover object-center rounded-lg"
                        src={tokenData.metaData.image}
                      />
                    </div>
                    <div className="flex flex-col gap-y-2 px-4">
                      <div className="flex justify-between ">
                        <p className="text-gray2 text-sm">Name</p>
                        <p className="text-ash text-sm">
                          {tokenData.metaData.name}
                        </p>
                      </div>
                      <div className="flex justify-between ">
                        <p className="text-gray2 text-sm">Total supply</p>
                        <p className="text-ash text-sm">
                          {tokenData.totalsupply}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-gray2 text-sm">Pair</p>
                        <AddressDisplay address={inputVal} />
                      </div>
                      <div className="flex justify-between ">
                        <p className="text-gray2 text-sm">Token symbol</p>
                        <p className="text-ash text-sm">
                          {tokenData.metaData.symbol}
                        </p>
                      </div>

                      <Icons metadata={tokenData.metaData} />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolPoolIndexer;
