const wrappedSolAddress = [
  "So11111111111111111111111111111111111111112",
  "So11111111111111111111111111111111111111111",
];

export const filterRaydiumSwap = (array) => {
  const decryptedData = {
    transactionType: "",
    timeCreated: 0,
    baseTokenAddr: [
      "So11111111111111111111111111111111111111112",
      "So11111111111111111111111111111111111111111",
    ],
    tokenAddr: "",
    baseTokenChange: 0,
    tokenChange: 0,
    owner: "",
  };

  array.forEach(({ change, mint, owner }) => {
    if (!wrappedSolAddress.includes(mint) && change < -0.001) {
      console.log();
      decryptedData.tokenAddr = mint;
      decryptedData.tokenChange += change;
      decryptedData.transactionType = "SELL";
    } else if (!wrappedSolAddress.includes(mint) && change > 0.001) {
      decryptedData.tokenAddr = mint;
      decryptedData.tokenChange += change;
      decryptedData.transactionType = "BUY";
    }

    if (
      wrappedSolAddress.includes(mint) &&
      (change > 0.0001 || change < -0.0001)
    ) {
      decryptedData.baseTokenChange += change;
    }

    decryptedData.owner = owner;
  });

  decryptedData.timeCreated = Date.now();

  return decryptedData;
};
