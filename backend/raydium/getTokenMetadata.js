import { Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";

const solana = new Connection(
  "https://capable-tiniest-dawn.solana-mainnet.quiknode.pro/4fafcfe0d021629fb32e0a412712c6394911d436/"
);

export async function getTokenMetadata(address) {
  const metaplex = Metaplex.make(solana);

  const mintAddress = new PublicKey(address);

  let tokenName;
  let tokenSymbol;
  let tokenLogo;

  const metadataAccount = metaplex
    .nfts()
    .pdas()
    .metadata({ mint: mintAddress });

  const metadataAccountInfo = await solana.getAccountInfo(metadataAccount);

  if (metadataAccountInfo) {
    const token = await metaplex
      .nfts()
      .findByMint({ mintAddress: mintAddress });
    tokenName = token.name;
    tokenSymbol = token.symbol;
    tokenLogo = token.json && token.json.image;

    return {
      metaData: token.json,
      totalsupply: token.mint.supply.basisPoints.toString(10),
      decimal: token.mint.decimals,
    };
  }
}
