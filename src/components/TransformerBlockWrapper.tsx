import React, { useState } from "react";
import TransformerBlockChart from "./TransformerBlockChart";
import AttentionMatrixViz from "./AttentionMatrixViz";
import FeedForwardViz from "./FeedForwardViz";
import AddNormViz from "./AddNormViz";
import AddNormViz2 from "./AddNormViz2";

// Head selector component for attention visualization
const HeadSelector: React.FC<{ 
  selectedIndex: number; 
  onSelect: (index: number) => void; 
}> = ({ selectedIndex, onSelect }) => {
  const headCount = 12; // Assuming 12 heads based on typical BERT architecture
  
  return (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      marginBottom: 16,
      gap: 8 
    }}>
      <span style={{ fontSize: 16, color: "#666", marginRight: 8 }}>Head:</span>
      <div style={{ 
        display: "flex", 
        gap: 4, 
        alignItems: "center",
        flexWrap: "wrap"
      }}>
        {Array.from({ length: headCount }, (_, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            style={{
              padding: "4px 8px",
              border: "1px solid #ddd",
              borderRadius: 4,
              background: i === selectedIndex ? "#e3f2fd" : "#fff",
              color: i === selectedIndex ? "#1976d2" : "#666",
              fontWeight: i === selectedIndex ? "bold" : "normal",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "monospace",
            }}
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  );
};

interface TransformerBlockWrapperProps {
  attentionTokens: string[];
  attentionMatrix: number[][];
  selectedTokenIndex?: number;
  selectedLayerIndex?: number;
  selectedHeadIndex?: number;
  onHeadSelect?: (index: number) => void;
}

export default function TransformerBlockWrapper({ 
  attentionTokens, 
  attentionMatrix, 
  selectedTokenIndex = 0,
  selectedLayerIndex = 0,
  selectedHeadIndex = 0,
  onHeadSelect
}: TransformerBlockWrapperProps) {
  const [selectedBlock, setSelectedBlock] = useState<"attention" | "feedforward" | "addnorm" | "addnorm2">("attention");

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 48, width: "100%" }}>
      <div style={{ flex: "0 0 auto" }}>
        <TransformerBlockChart selected={selectedBlock} onSelect={setSelectedBlock} />
        <div style={{ 
          textAlign: "right", 
          marginTop: 0, 
          fontSize: 20, 
          color: "#666",
          fontWeight: "bold"
        }}>
          Layer {selectedLayerIndex}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {selectedBlock === "attention" ? (
          <div style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            background: "#fff",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            padding: 24,
            position: "relative",
          }}>
            <div style={{ 
              fontSize: 12, 
              color: "#999", 
              position: "absolute",
              top: -8,
              left: 12,
              background: "#fff",
              padding: "0 8px"
            }}>Multi-Head Attention</div>
            <HeadSelector selectedIndex={selectedHeadIndex} onSelect={onHeadSelect || (() => {})} />
            <AttentionMatrixViz tokens={attentionTokens} attention={attentionMatrix} selectedTokenIndex={selectedTokenIndex} />
          </div>
        ) : selectedBlock === "feedforward" ? (
          <div style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            background: "#fff",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            padding: 24,
            position: "relative",
          }}>
            <div style={{ 
              fontSize: 12, 
              color: "#999", 
              position: "absolute",
              top: -8,
              left: 12,
              background: "#fff",
              padding: "0 8px"
            }}>Feed-Forward Network</div>
            <FeedForwardViz selectedTokenIndex={selectedTokenIndex} />
          </div>
        ) : selectedBlock === "addnorm2" ? (
          <div style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            background: "#fff",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            padding: 24,
            position: "relative",
          }}>
            <div style={{ 
              fontSize: 12, 
              color: "#999", 
              position: "absolute",
              top: -8,
              left: 12,
              background: "#fff",
              padding: "0 8px"
            }}>Add & Norm (MLP)</div>
            <AddNormViz2 selectedTokenIndex={selectedTokenIndex} />
          </div>
        ) : (
          <div style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            background: "#fff",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            padding: 24,
            position: "relative",
          }}>
            <div style={{ 
              fontSize: 12, 
              color: "#999", 
              position: "absolute",
              top: -8,
              left: 12,
              background: "#fff",
              padding: "0 8px"
            }}>Add & Norm</div>
            <AddNormViz selectedTokenIndex={selectedTokenIndex} />
          </div>
        )}
      </div>
    </div>
  );
} 