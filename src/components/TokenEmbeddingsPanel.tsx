import React, { useState } from "react";
import { useModelData } from "../hooks/useModelData";

interface Props {
  selectedToken?: string | null;
  onTokenSelect?: (token: string | null) => void;
}

const TokenEmbeddingsPanel: React.FC<Props> = ({ selectedToken, onTokenSelect }) => {
  const { data, loading, error } = useModelData();
  const [internalIdx, setInternalIdx] = useState<number | null>(null);

  // Pre-select the first available token when data loads
  React.useEffect(() => {
    if (data && !selectedToken && internalIdx === null) {
      const firstTokenIndex = data.tokens.findIndex(token => token !== "[CLS]" && token !== "[SEP]");
      if (firstTokenIndex !== -1) {
        setInternalIdx(firstTokenIndex);
      }
    }
  }, [data, selectedToken]); // Removed internalIdx from dependencies

  if (loading) {
    return <div>Loading token embeddings…</div>;
  }

  if (error || !data) {
    return <div style={{ color: "red" }}>Error: {error || "Failed to load data"}</div>;
  }

  // Find the index of the selected token in the tokens array
  let idx: number | null = null;
  if (selectedToken) {
    idx = data.tokens.indexOf(selectedToken);
    if (idx === -1) idx = null;
  } else if (!selectedToken) {
    idx = internalIdx;
  }

  return (
    <div style={{ fontFamily: "monospace", fontSize: 16 }}>
      <div style={{ marginBottom: "1em" }}>
        <div style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: "8px",
          maxWidth: "100%"
        }}>
          {data.tokens
            .filter(token => token !== "[CLS]" && token !== "[SEP]")
            .map((token, i) => {
              // Find the original index in the full tokens array
              const originalIndex = data.tokens.indexOf(token);
              return (
                <span
                  key={i}
                  style={{
                    cursor: "pointer",
                    fontWeight: idx === originalIndex ? "bold" : "normal",
                    fontSize: 18,
                    padding: "2px 4px",
                    borderRadius: "3px",
                    backgroundColor: idx === originalIndex ? "#e0e0e0" : "#f5f5f5",
                    transition: "background-color 0.2s"
                  }}
                  onClick={() => {
                    if (onTokenSelect) {
                      onTokenSelect(token);
                    } else {
                      setInternalIdx(originalIndex);
                    }
                  }}
                >
                  {token}
                </span>
              );
            })}
        </div>
      </div>
      <div
        style={{
          whiteSpace: "pre-line",
          color: "gray",
          minHeight: "3em",
          borderTop: "1px solid #ddd",
          paddingTop: "0.5em",
          fontSize: 18,
          backgroundColor: "#f8f9fa",
          border: "1px solid #e9ecef",
          borderRadius: "6px",
          padding: "16px",
          marginTop: "16px"
        }}
      >
        {idx !== null && (
          <>
            Token: {data.tokens[idx]}
            {"\n"}
            Embedding: [
            {data.token_embeddings.raw[data.tokens[idx]]
              ?.slice(0, 7)
              .map((v) => v.toFixed(3))
              .join(", ") || "N/A"}
            , ...]
          </>
        )}
      </div>
    </div>
  );
};

export default TokenEmbeddingsPanel; 