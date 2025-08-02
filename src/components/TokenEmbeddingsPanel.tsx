import React, { useEffect, useState } from "react";

// Type definitions for the embeddings data
interface TokenEmbeddingsData {
  tokens: string[];
  token_ids: number[];
  embeddings: number[][];
}

const EMBEDDINGS_URL = "/token_embeddings_raw.json";

interface Props {
  hoveredToken?: string | null;
  onHover?: (token: string | null) => void;
}

const TokenEmbeddingsPanel: React.FC<Props> = ({ hoveredToken, onHover }) => {
  const [data, setData] = useState<TokenEmbeddingsData | null>(null);
  const [internalIdx, setInternalIdx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Find the index of the hovered token in the tokens array
  let idx: number | null = null;
  if (hoveredToken && data) {
    idx = data.tokens.indexOf(hoveredToken);
    if (idx === -1) idx = null;
  } else if (!hoveredToken) {
    idx = internalIdx;
  }

  useEffect(() => {
    fetch(EMBEDDINGS_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load embeddings data");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div style={{ color: "red" }}>Error: {error}</div>;
  }

  if (!data) {
    return <div>Loading token embeddings…</div>;
  }

  return (
    <div style={{ fontFamily: "monospace", fontSize: 22 }}>
      <div style={{ marginBottom: "1em" }}>
        {data.tokens
          .filter(token => token !== "[CLS]" && token !== "[SEP]")
          .map((token, i) => {
            // Find the original index in the full tokens array
            const originalIndex = data.tokens.indexOf(token);
            return (
              <span
                key={i}
                style={{
                  marginRight: 12,
                  cursor: "pointer",
                  fontWeight: idx === originalIndex ? "bold" : "normal",
                  fontSize: 22,
                }}
                onMouseEnter={() => (onHover ? onHover(token) : setInternalIdx(originalIndex))}
                onMouseLeave={() => (onHover ? onHover(null) : setInternalIdx(null))}
                onClick={() => (onHover ? onHover(token) : setInternalIdx(originalIndex))}
              >
                {token}
              </span>
            );
          })}
      </div>
      <div
        style={{
          whiteSpace: "pre-line",
          color: "gray",
          minHeight: "3em",
          borderTop: "1px solid #ddd",
          paddingTop: "0.5em",
          fontSize: 18,
        }}
      >
        {idx !== null && (
          <>
            ID: {data.token_ids[idx]}
            {"\n"}
            Embedding: [
            {data.embeddings[idx]
              .slice(0, 10)
              .map((v) => v.toFixed(2))
              .join(", ")}
            ...]
          </>
        )}
      </div>
    </div>
  );
};

export default TokenEmbeddingsPanel; 