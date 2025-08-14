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
                    left: "33.33%", // Position in middle column
                    width: "33.33%", // Only cover middle column
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
                        // Use three-column layout positioning (SVG now only covers middle column)
                        const leftColumnX = 0; // Left edge of middle column
                        const rightColumnX = 170; // Right edge of middle column
                        
                        // Use correct spacing based on actual token height
                        const baseY = 94; // Match the user's correction
                        const tokenHeight = 22; // fontSize: 12 (~16px) + padding: 4px + margin: 2px
                        const spacing = 24; // Use actual spacing between tokens (tokenHeight - marginBottom)
                        
                        // Calculate Y position at the center of each token
                        const y1 = baseY + fromIndex * spacing + spacing / 2;
                        const y2 = baseY + toIndex * spacing + spacing / 2;
                        
                        return (
                          <line
                            key={`${fromIndex}-${toIndex}`}
                            x1={leftColumnX}
                            y1={y1}
                            x2={rightColumnX}
                            y2={y2}
                            stroke={isHighlighted ? "#d32f2f" : "#1976d2"}
                            strokeWidth={isHighlighted ? 2 : 1}
                            opacity={isHighlighted ? 0.8 : weight * 0.7}
                          />
                        );
                      }
                      return null;
                    })
                  )}
                </svg>
                
                <div style={{ display: "flex", gap: 16, position: "relative", zIndex: 2 }}>
                  {/* Left tokens */}
                  <div style={{ flex: 1, textAlign: "right" }}>
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
                  
                  {/* Middle column for lines */}
                  <div style={{ flex: 1, position: "relative" }}>
                    {/* This column is just for the SVG lines */}
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
        
        {/* Source citation */}
        <div style={{ 
          marginTop: 16, 
          fontSize: 12, 
          color: "#666", 
          fontStyle: "italic",
          borderTop: "1px solid #eee",
          paddingTop: 12
        }}>
          Quelle: Kevin Clark, Urvashi Khandelwal, Omer Levy, and Christopher D. Manning. 2019. What Does BERT Look at? An Analysis of BERT's Attention. In <em>Proceedings of the 2019 ACL Workshop BlackboxNLP: Analyzing and Interpreting Neural Networks for NLP</em>, pages 276–286, Florence, Italy. Association for Computational Linguistics. <a href="https://aclanthology.org/W19-4828/" target="_blank" rel="noopener noreferrer" style={{ color: "#1976d2", textDecoration: "none" }}>https://aclanthology.org/W19-4828/</a>
        </div>
      </div>
    </div>
  );
} 