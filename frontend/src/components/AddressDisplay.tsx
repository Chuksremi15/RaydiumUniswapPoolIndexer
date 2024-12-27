import React, { useState } from "react";

interface AddressDisplayProps {
  address: string;
}

export const AddressDisplay: React.FC<AddressDisplayProps> = ({ address }) => {
  const truncateAddress = (address: string) => {
    if (address.length > 10) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return address;
  };

  const [copyState, setCopyState] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(address)
      .then(() => {
        setCopyState("Address copied!");
        setTimeout(() => {
          setCopyState(null); // Clear the copyState after 3 seconds
        }, 3000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  return (
    <div
      onClick={handleCopy}
      className="flex items-center space-x-2 text-ash text-sm"
    >
      <span className="text-sm text-gray-700">{truncateAddress(address)}</span>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-gray-600"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3M6 8V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3M6 8v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8" />
      </svg>

      {copyState && <p>Copied</p>}
    </div>
  );
};
