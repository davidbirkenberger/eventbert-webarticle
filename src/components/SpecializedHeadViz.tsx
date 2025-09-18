import React from "react";
import LabeledContainer from "./LabeledContainer";

interface SpecializedHeadVizProps {
  headTitle: string;
  description: string;
  examples?: {
    sentence: string;
    tokens: string[];
    attentionMatrix: number[][];
    highlightedConnections: Array<{from: number, to: number}>;
  }[];
  // New props for real model data
  useRealData?: boolean;
  modelData?: {
    text: string;
    tokens: string[];
    attention_data: Record<string, Record<string, number[][]>>;
  };
  // New props for word-level attention data
  useWordLevelData?: boolean;
  sentenceAttentionData?: {
    sentence: string;
    words: string[];
    tokens: string[];
    word_to_subword: number[][];
    attention_matrices: Record<string, {
      layer: number;
      head: number;
      word_attention: number[][];
      word_attention_shape: number[];
    }>;
  };
  layerIndex?: number;
  headIndex?: number;
}

export default function SpecializedHeadViz({ 
  headTitle, 
  description, 
  examples = [],
  useRealData = false,
  modelData,
  useWordLevelData = false,
  sentenceAttentionData,
  layerIndex = 7,
  headIndex = 10
}: SpecializedHeadVizProps) {
  
  // Central highlight color definition
  const highlightColor = "#2372dd"; // Elegant dark blue
  
  // Use word-level data if specified
  let displayExamples = examples;
  
  if (useWordLevelData && sentenceAttentionData) {
    // Get both heads from the data
    const head1Key = `L${layerIndex}_H${headIndex}`;
    const head2Key = 'L7_H10'; // Always show L7-H10 as second head
    
    const head1Data = sentenceAttentionData.attention_matrices[head1Key];
    const head2Data = sentenceAttentionData.attention_matrices[head2Key];
    
    
    displayExamples = [];
    
    // Add first head
    if (head1Data) {
      const wordAttentionMatrix = head1Data.word_attention;
      const words = sentenceAttentionData.words;
      
      
      // Create highlighted connections based on word attention weights
      const highlightedConnections: Array<{from: number, to: number}> = [];
      
      // Find the strongest connection for the first head (L7-H6)
      let maxWeight = 0;
      let strongestConnection = { from: 0, to: 0 };
      
      for (let from = 0; from < wordAttentionMatrix.length; from++) {
        for (let to = 0; to < wordAttentionMatrix[from].length; to++) {
          if (from !== to && wordAttentionMatrix[from][to] > maxWeight) {
            maxWeight = wordAttentionMatrix[from][to];
            strongestConnection = { from, to };
          }
        }
      }
      
      highlightedConnections.push(strongestConnection);
      
      displayExamples.push({
        sentence: sentenceAttentionData.sentence,
        tokens: words,
        attentionMatrix: wordAttentionMatrix,
        highlightedConnections: highlightedConnections
      });
    } else {
    }
    
    // Add second head
    if (head2Data) {
      const wordAttentionMatrix = head2Data.word_attention;
      const words = sentenceAttentionData.words;
      
      
      // Create highlighted connections based on word attention weights
      const highlightedConnections: Array<{from: number, to: number}> = [];
      
      // Find the two strongest connections for the second head (L7-H6)
      const connections: Array<{from: number, to: number, weight: number}> = [];
      
      for (let from = 0; from < wordAttentionMatrix.length; from++) {
        for (let to = 0; to < wordAttentionMatrix[from].length; to++) {
          if (from !== to) {
            connections.push({ from, to, weight: wordAttentionMatrix[from][to] });
          }
        }
      }
      
      // Sort by weight and take the top 2
      connections.sort((a, b) => b.weight - a.weight);
      const top2Connections = connections.slice(0, 2);
      
      highlightedConnections.push(...top2Connections.map(conn => ({ from: conn.from, to: conn.to })));
      
      displayExamples.push({
        sentence: sentenceAttentionData.sentence,
        tokens: words,
        attentionMatrix: wordAttentionMatrix,
        highlightedConnections: highlightedConnections
      });
    } else {
      // Create a placeholder for the second head if data is missing
      const words = sentenceAttentionData.words;
      const placeholderMatrix = Array(words.length).fill(0).map(() => Array(words.length).fill(0.1));
      
      displayExamples.push({
        sentence: sentenceAttentionData.sentence,
        tokens: words,
        attentionMatrix: placeholderMatrix,
        highlightedConnections: []
      });
    }
  }
  // Use real data if specified (fallback to token-level)
  else if (useRealData && modelData) {
    const layerKey = `layer_${layerIndex}`;
    const headKey = `head_${headIndex}`;
    const attentionMatrix = modelData.attention_data[layerKey]?.[headKey];
    
    if (attentionMatrix) {
      // Create highlighted connections based on attention weights
      const highlightedConnections: Array<{from: number, to: number}> = [];
      
      // Find strong attention connections (above threshold)
      for (let from = 0; from < attentionMatrix.length; from++) {
        for (let to = 0; to < attentionMatrix[from].length; to++) {
          if (from !== to && attentionMatrix[from][to] > 0.3) {
            highlightedConnections.push({ from, to });
          }
        }
      }
      
      displayExamples = [{
        sentence: modelData.text,
        tokens: modelData.tokens,
        attentionMatrix: attentionMatrix,
        highlightedConnections: highlightedConnections
      }];
    }
  }

  return (
    <div style={{ marginTop: 32 }}>
      <LabeledContainer label={headTitle}>

        
        <div style={{ marginBottom: 24 }}>
          <ul style={{ margin: 0, paddingLeft: 20, color: "#666", lineHeight: 1.5 }}>
            <li>{description}</li>
          </ul>
        </div>

        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          {displayExamples.map((example, exampleIndex) => {
            // Determine head label based on index and data
            let headLabel = "";
            if (useWordLevelData && sentenceAttentionData) {
              if (exampleIndex === 0) {
                headLabel = `L${layerIndex}-H${headIndex}`; // L7-H6
              } else {
                headLabel = 'L7-H10'; // Always second head
              }
            }
            
            return (
              <div key={exampleIndex} style={{ flex: 1, minWidth: 300 }}>
                <div style={{ 
                  border: "1px solid #eee", 
                  borderRadius: 6, 
                  padding: 16, 
                  background: "#fafafa",
                  position: "relative"
                }}>
                  {headLabel && (
                    <div style={{ 
                      position: "absolute", 
                      top: -10, 
                      left: 16, 
                      background: "#1976d2", 
                      color: "white", 
                      padding: "2px 8px", 
                      borderRadius: 12, 
                      fontSize: 12, 
                      fontWeight: "bold",
                      zIndex: 3
                    }}>
                      {headLabel}
                    </div>
                  )}
                  <div style={{ fontSize: 14, color: "#666", marginBottom: 12, fontStyle: "italic" }}>
                    {exampleIndex === 0 
                      ? "Erkennt Adjektiv → Nomen-Bezüge: In rund 90,6 % der Fälle fokussiert er direkt auf das richtige Nomen."
                      : "Erkennt Verb → Objekt-Bezüge: In rund 80,1 % der Fälle fokussiert er direkt auf das richtige Objekt."
                    }
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
                        const rightColumnX = 135; // Right edge of middle column
                        
                        // Calculate positioning for the new flexbox row system
                        const headerHeight = 70; // Column headers height
                        const rowHeight = 40; // Each row height
                        const rowGap = 20; // Gap between rows
                        
                        // Calculate Y position at the center of each row
                        const y1 = headerHeight + fromIndex * (rowHeight + rowGap) + rowHeight / 2;
                        const y2 = headerHeight + toIndex * (rowHeight + rowGap) + rowHeight / 2;
                        
                        return (
                          <line
                            key={`${fromIndex}-${toIndex}`}
                            x1={leftColumnX}
                            y1={y1}
                            x2={rightColumnX}
                            y2={y2}
                            stroke={isHighlighted ? highlightColor : "#666666"}
                            strokeWidth={isHighlighted ? 2 : 1}
                            opacity={isHighlighted ? 0.8 : weight * 0.7}
                          />
                        );
                      }
                      return null;
                    })
                  )}
                </svg>
                
                {/* Flexbox-based row system */}
                <div style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "20px", 
                  position: "relative", 
                  zIndex: 2 
                }}>
                    
                  
                  {/* Word rows */}
                  {example.tokens.map((token, i) => (
                    <div key={i} style={{ 
                      display: "flex", 
                      gap: "16px", 
                      alignItems: "center",
                      height: "40px",
                      position: "relative"
                    }}>
                      
                      {/* Input word */}
                      <div style={{ 
                        flex: 1, 
                        textAlign: "right",
                        fontSize: 14,
                        padding: "2px 4px",
                        fontFamily: "monospace",
                        color: example.highlightedConnections.some(conn => conn.from === i) ? "#000000" : "#333",
                        fontWeight: example.highlightedConnections.some(conn => conn.from === i) ? "bold" : "normal"
                      }}>
                        {/* Special styling for exklusives only in the first head and left column */}
                        {token === "exklusives" && exampleIndex === 0 ? (
                          <div style={{
                            border: `2px solid ${highlightColor}`,
                            borderRadius: "6px",
                            padding: "4px 8px",
                            margin: "0 -8px",
                            position: "relative"
                          }}>
                            <div style={{
                              position: "absolute",
                              top: "-8px",
                              left: "50%",
                              transform: "translateX(-50%)",
                              fontSize: 10,
                              color: highlightColor,
                              fontWeight: "bold",
                              backgroundColor: "#fafafa",
                              padding: "0 4px",
                              whiteSpace: "nowrap"
                            }}>
                              Adjektiv
                            </div>
                            {token}
                          </div>
                        ) : token === "exklusives" && exampleIndex === 1 ? (
                          <div style={{
                            border: `2px solid ${highlightColor}`,
                            borderRadius: "6px",
                            padding: "4px 8px",
                            margin: "0 -8px",
                            position: "relative"
                          }}>
                            <div style={{
                              position: "absolute",
                              top: "-8px",
                              left: "50%",
                              transform: "translateX(-50%)",
                              fontSize: 10,
                              color: highlightColor,
                              fontWeight: "bold",
                              backgroundColor: "#fafafa",
                              padding: "0 4px",
                              whiteSpace: "nowrap"
                            }}>
                              Objekt
                            </div>
                            {token}
                          </div>
                        ) : token === "Catering" && exampleIndex === 1 ? (
                          <div style={{
                            border: `2px solid ${highlightColor}`,
                            borderRadius: "6px",
                            padding: "4px 8px",
                            margin: "0 -8px",
                            position: "relative"
                          }}>
                            {token}
                          </div>
                        ) : (
                          token
                        )}
                      </div>
                      
                      {/* Middle space for SVG lines */}
                      <div style={{ flex: 1, position: "relative" }}>
                        {/* SVG lines will be positioned here */}
                      </div>
                      
                      {/* Output word */}
                      <div style={{ 
                        flex: 1,
                        fontSize: 14,
                        padding: "2px 4px",
                        fontFamily: "monospace",
                        color: example.highlightedConnections.some(conn => conn.to === i) ? "#000000" : "#333",
                        fontWeight: example.highlightedConnections.some(conn => conn.to === i) ? "bold" : "normal"
                      }}>
                        {/* Special styling for Catering as Nomen only in the first head and right column */}
                        {token === "Catering" && exampleIndex === 0 ? (
                          <div style={{
                            border: `2px solid ${highlightColor}`,
                            borderRadius: "6px",
                            padding: "4px 8px",
                            margin: "0 -8px",
                            position: "relative"
                          }}>
                            <div style={{
                              position: "absolute",
                              top: "-8px",
                              left: "50%",
                              transform: "translateX(-50%)",
                              fontSize: 10,
                              color: highlightColor,
                              fontWeight: "bold",
                              backgroundColor: "#fafafa",
                              padding: "0 4px",
                              whiteSpace: "nowrap"
                            }}>
                              Nomen
                            </div>
                            {token}
                          </div>
                        ) : token === "bieten" && exampleIndex === 1 ? (
                          <div style={{
                            border: `2px solid ${highlightColor}`,
                            borderRadius: "6px",
                            padding: "4px 8px",
                            margin: "0 -8px",
                            position: "relative"
                          }}>
                            <div style={{
                              position: "absolute",
                              top: "-8px",
                              left: "50%",
                              transform: "translateX(-50%)",
                              fontSize: 10,
                              color: highlightColor,
                              fontWeight: "bold",
                              backgroundColor: "#fafafa",
                              padding: "0 4px",
                              whiteSpace: "nowrap"
                            }}>
                              Verb
                            </div>
                            {token}
                          </div>
                        ) : (
                          token
                        )}
                      </div>
                    </div>
                  ))}
                  

                  

                </div>
              </div>
            </div>
          )})}
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
          Die Auswertung folgt der Methode von <a href="https://aclanthology.org/W19-4828/" target="_blank" rel="noopener noreferrer" style={{ color: "#1976d2", textDecoration: "none" }}>Clark et al. (2019)</a>: Anhand von tausenden Sätzen aus dem Universal-Dependencies-Korpus haben wir für jede Abhängigkeitsrelation (z. B. det, amod, obj) geprüft, ob die stärkste Aufmerksamkeit eines Tokens auf das passende Bezugswort fällt. Die berichteten Werte geben an, wie häufig dies über alle Beispiele hinweg der Fall war.
        </div>
      </LabeledContainer>
    </div>
  );
} 