"use client";
import React from "react";
import { useModelData } from "@/hooks/useModelData";
import LoadingSpinner from "./LoadingSpinner";

const TokenizedSentence: React.FC = () => {
  const { data, loading } = useModelData();
  
  if (loading) {
    return (
      <div className="font-mono text-xl">
        <div className="mb-4 flex justify-center">
          <LoadingSpinner size="sm" text="Lade Tokens..." />
        </div>
      </div>
    );
  }
  
  const tokens = data?.tokens || ["[CLS]", "mit", "unseren", "sna", "##cks", "bieten", "wir", "das", "beste", "cater", "##ing", ".", "[SEP]"];

  return (
    <div className="font-mono text-xl">
      <div className="mb-4 flex gap-2">
        {tokens.slice(0, 10).map((token, i) => (
          <span
            key={i}
            className={`inline-block align-bottom leading-[50px] ${
              token === "[CLS]" 
                ? "font-bold text-4xl opacity-100" 
                : "font-normal text-xl opacity-40"
            }`}
          >
            {token}
          </span>
        ))}
        {tokens.length > 10 && (
          <span className="text-xl opacity-40 align-bottom leading-[50px]">...</span>
        )}
      </div>
    </div>
  );
};

export default TokenizedSentence;
