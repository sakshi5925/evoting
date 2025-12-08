// Convert BigNumber → normal number safely
export const bnToNumber = (value) => {
  if (!value) return 0;

  try {
    // ethers v6
    if (typeof value === "bigint") return Number(value);

    // ethers v5 BigNumber
    if (value.toNumber) return value.toNumber();

    return Number(value);
  } catch (err) {
    return Number(value);
  }
};

// Normalize ETH address to lowercase
export const normalizeAddress = (address) => {
  if (!address) return "";
  try {
    return address.toLowerCase();
  } catch (err) {
    return address;
  }
};
