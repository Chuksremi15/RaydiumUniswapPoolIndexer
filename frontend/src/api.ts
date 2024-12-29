import axios from "axios";
import { LOCAL_URL } from "./utils";

export const fetchTokenData = async (tokenAddress: string) => {
  if (!tokenAddress) throw new Error("Address is required");
  const { data } = await axios.get(
    `${LOCAL_URL}/raydium/getmetadata/${tokenAddress}`
  );
  return data.data;
};

export const fetchSwaps = async (tokenAddress: string) => {
  if (!tokenAddress) throw new Error("Address is required");
  const { data } = await axios.get(
    `${LOCAL_URL}/raydium/getswaps/${tokenAddress}`
  );
  return data;
};

export const fetchSolPrice = async () => {
  const response = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
  );

  return response.data.solana.usd;
};
