import React from "react";

interface SpecializedHeadVizProps {
  headTitle: string;
  description: string;
  examples: {
    sentence: string;
    tokens: string[];
    attentionMatrix: number[][];
    highlightedConnections: Array<{from: number, to: number}>;
  }[];
}

export default function SpecializedHeadViz({ headTitle, description, examples }: SpecializedHeadVizProps) {
  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ 
        border: "1px solid #ddd", 
        borderRadius: 8, 
        padding: 24, 
        background: "#fff",
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
      }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: 20, fontWeight: "bold", color: "#333" }}>
          {headTitle}
        </h3>
        
        <div style={{ marginBottom: 24 }}>
          <ul style={{ margin: 0, paddingLeft: 20, color: "#666", lineHeight: 1.5 }}>
            <li>{description}</li>
          </ul>
        </div>

        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          {examples.map((example, exampleIndex) => (
            <div key={exampleIndex} style={{ flex: 1, minWidth: 300 }}>
              <div style={{ 
                border: "1px solid #eee", 
                borderRadius: 6, 
                padding: 16, 
                background: "#fafafa",
                position: "relative"
              }}>
                <div style={{ fontSize: 14, color: "#666", marginBottom: 12, fontStyle: "italic" }}>
                  "{example.sentence}"
                </div>
                
                {/* SVG for attention lines */}
                <svg 
                  width="100%" 
                  height="100%" 
                  style={{ 
                    position: "absolute", 
                    top: 0, 
                    left: 0, 
                    pointerEvents: "none",
                    zIndex: 1
                  }}
                >
                  {/* Draw attention lines */}
                  {example.tokens.map((_, fromIndex) =>
                    example.tokens.map((_, toIndex) => {
                      const weight = example.attentionMatrix[fromIndex]?.[toIndex] || 0;
                      const isHighlighted = example.highlightedConnections.some(
                        conn => conn.from === fromIndex && conn.to === toIndex
                      );
                      
                      if (weight > 0.01) {
                        // Try a much simpler approach - just use index directly
                        const leftColumnX = 60; // Left column center
                        const rightColumnX = 140; // Right column center
                        
                        // Just use index * 16 for spacing (simpler)
                        const y1 = 40 + fromIndex * 16;
                        const y2 = 40 + toIndex * 16;
                        
                        return (
                          <line
                            key={`${fromIndex}-${toIndex}`}
                            x1={leftColumnX}
                            y1={y1}
                            x2={rightColumnX}
                            y2={y2}
                            stroke={isHighlighted ? "#d32f2f" : "#1976d2"}
                            strokeWidth={isHighlighted ? 2 : 1}
                            opacity={isHighlighted ? 0.8 : weight * 0.3}
                          />
                        );
                      }
                      return null;
                    })
                  )}
                </svg>
                
                <div style={{ display: "flex", gap: 16, position: "relative", zIndex: 2 }}>
                  {/* Left tokens */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: "#999", marginBottom: 8 }}>Input</div>
                    {example.tokens.map((token, i) => (
                      <div key={i} style={{ 
                        fontSize: 12, 
                        padding: "2px 4px", 
                        marginBottom: 2,
                        fontFamily: "monospace",
                        position: "relative"
                      }}>
                        {token}
                      </div>
                    ))}
                  </div>
                  
                  {/* Right tokens */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: "#999", marginBottom: 8 }}>Output</div>
                    {example.tokens.map((token, i) => (
                      <div key={i} style={{ 
                        fontSize: 12, 
                        padding: "2px 4px", 
                        marginBottom: 2,
                        fontFamily: "monospace",
                        color: example.highlightedConnections.some(conn => conn.to === i) ? "#d32f2f" : "#333"
                      }}>
                        {token}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 