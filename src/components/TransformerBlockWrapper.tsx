import React, { useState } from "react";
import TransformerBlockChart from "./TransformerBlockChart";
import AttentionMatrixViz from "./AttentionMatrixViz";
import FeedForwardViz from "./FeedForwardViz";

interface TransformerBlockWrapperProps {
  attentionTokens: string[];
  attentionMatrix: number[][];
}

export default function TransformerBlockWrapper({ attentionTokens, attentionMatrix }: TransformerBlockWrapperProps) {
  const [selectedBlock, setSelectedBlock] = useState<"attention" | "feedforward">("attention");

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 48, width: "100%" }}>
      <div style={{ flex: "0 0 auto" }}>
        <TransformerBlockChart selected={selectedBlock} onSelect={setSelectedBlock} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {selectedBlock === "attention" ? (
          <AttentionMatrixViz tokens={attentionTokens} attention={attentionMatrix} />
        ) : (
          <FeedForwardViz />
        )}
      </div>
    </div>
  );
} 