import React from "react";
import { useModelData } from "../hooks/useModelData";

// Helper functions for line color/width (from ClsToOutputViz)
function getWeightColor(weight: number) {
  if (weight > 0) return `rgba(30, 100, 255, 0.5)`;
  if (weight < 0) return `rgba(255, 60, 60, 0.5)`;
  return `rgba(120,120,120,0.2)`;
}
function getWeightWidth(weight: number, maxAbs: number) {
  const abs = Math.abs(weight);
  return 0.5 + (abs / maxAbs) * 2.5;
}

interface FeedForwardVizProps {
  selectedTokenIndex?: number;
  selectedLayerIndex?: number;
}

export default function FeedForwardViz({ selectedTokenIndex = 0, selectedLayerIndex = 0 }: FeedForwardVizProps) {
  const { data, loading, error } = useModelData();

  if (loading || !data) return <div>Loading…</div>;
  if (error) return <div>Error: {error}</div>;

  const tokens: string[] = data.tokens || [];
  const allFeedForwardLayers = data.feedforward_layers || [];
  
  // Prüfe ob Feed-Forward-Daten verfügbar sind
  if (!allFeedForwardLayers || allFeedForwardLayers.length === 0) {
    return (
      <div style={{ 
        padding: "20px", 
        textAlign: "center", 
        color: "#666",
        border: "1px solid #ddd",
        borderRadius: "8px",
        background: "#f9f9f9"
      }}>
        <div>Feed-Forward-Daten nicht verfügbar</div>
        <div style={{ fontSize: "14px", marginTop: "8px" }}>
          Die Feed-Forward-Layer-Daten sind in diesem Modell nicht enthalten.
        </div>
      </div>
    );
  }
  
  // Wähle den spezifischen Transformer-Block
  const selectedBlock = allFeedForwardLayers[selectedLayerIndex];
  if (!selectedBlock) {
    return <div>Layer {selectedLayerIndex} nicht verfügbar</div>;
  }
  
  // Extrahiere die Feed-Forward-Layer aus dem Block
  const layers = [
    {
      name: "Linear1",
      values: selectedBlock.linear1?.output_values || {},
      weights: selectedBlock.linear1?.weights || [],
      bias: selectedBlock.linear1?.bias || []
    },
    {
      name: "GELU",
      values: selectedBlock.gelu?.output_values || {},
      weights: null,  // GELU hat keine Gewichte
      bias: null
    },
    {
      name: "Linear2", 
      values: selectedBlock.linear2?.output_values || {},
      weights: selectedBlock.linear2?.weights || [],
      bias: selectedBlock.linear2?.bias || []
    }
  ];
  
  const token = tokens[selectedTokenIndex] || tokens[0] || "[CLS]";
  const numLayers = layers.length;

  // Layout - responsive design
  const neuronRadius = 20;
  const maxNeuronsToShow = 8; // Nur 10 Neuronen anzeigen
  const layerGap = 160; // Reduziert für weniger Whitespace
  const neuronGap = 50; // Reduziert für weniger Whitespace
  const contentWidth = (numLayers - 1) * layerGap + 2 * neuronRadius + 80;
      const height = maxNeuronsToShow * neuronGap + 2 * neuronRadius + 60;
      const leftPad = 40; // Reduziert für weniger Whitespace
    const topPad = 30; // Erhöht für Labels

  // Find max abs value for line width normalization (nur für sichtbare Verbindungen)
  let maxAbs = 1;
  for (let l = 0; l < numLayers - 1; ++l) {
    const from = layers[l]?.values?.[token];
    const to = layers[l + 1]?.values?.[token];
    const weights = layers[l]?.weights;
    
    if (from && to) {
      // Berechne maxAbs nur für die sichtbaren Verbindungen
      const fromNeuronsToShow = Math.min(maxNeuronsToShow, from.length);
      const toNeuronsToShow = Math.min(maxNeuronsToShow, to.length);
      
      for (let i = 0; i < fromNeuronsToShow; ++i) {
        for (let j = 0; j < toNeuronsToShow; ++j) {
          let w = from[i]; // Default: Neuron-Wert
          if (weights && weights[i] && weights[i][j] !== undefined) {
            w = weights[i][j]; // Verwende echte Gewichte wenn verfügbar
          }
          if (Math.abs(w) > maxAbs) maxAbs = Math.abs(w);
        }
      }
    }
  }



  return (
    <div style={{ width: "100%", maxWidth: contentWidth, margin: "0 auto", position: "relative" }}>
      {/* Layer-Auswahl entfernt */}
      
      <svg width="100%" height={height} viewBox={`0 0 ${contentWidth} ${height}`} preserveAspectRatio="xMidYMid meet">
        {/* Draw lines between layers */}
        {layers.slice(0, -1).map((layer, lIdx) => {
          const from = layer?.values?.[token];
          const to = layers[lIdx + 1]?.values?.[token];
          const weights = layer?.weights;
          
          if (!from || !to) return null;
          
          // Zeichne nur Verbindungen zwischen den sichtbaren Neuronen
          const fromNeuronsToShow = Math.min(maxNeuronsToShow, from.length);
          const toNeuronsToShow = Math.min(maxNeuronsToShow, to.length);
          
          return from.slice(0, fromNeuronsToShow).map((fromVal, i) =>
            to.slice(0, toNeuronsToShow).map((toVal, j) => {
              // Verwende echte Gewichte wenn verfügbar, sonst Neuron-Werte
              let weight = fromVal;
              if (weights && weights[i] && weights[i][j] !== undefined) {
                weight = weights[i][j];
              }
              
              const x1 = leftPad + lIdx * layerGap + neuronRadius;
              const y1 = topPad + i * neuronGap + neuronRadius;
              const x2 = leftPad + (lIdx + 1) * layerGap + neuronRadius;
              const y2 = topPad + j * neuronGap + neuronRadius;
              
              // Control points for Bezier curve (S-curve)
              const dx = (x2 - x1) * 0.5;
              const c1x = x1 + dx;
              const c1y = y1;
              const c2x = x2 - dx;
              const c2y = y2;
              const pathD = `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`;
              
              return (
                <g key={`l${lIdx}-n${i}-to-n${j}`}>
                  {/* Background curve */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={getWeightColor(weight)}
                    strokeWidth={getWeightWidth(weight, maxAbs)}
                    opacity={0.15}
                  />
                  {/* Main curve */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={getWeightColor(weight)}
                    strokeWidth={getWeightWidth(weight, maxAbs)}
                    opacity={0.9}
                  />
                </g>
              );
            })
          );
        })}
        {/* Draw neurons and values */}
        {layers.map((layer, lIdx) => {
          const neuronValues = layer.values[token] || [];
          const neuronsToShow = Math.min(maxNeuronsToShow, neuronValues.length);
          
          return (
            <g key={`layer-${lIdx}`}>
              {/* Zeichne nur die ersten 10 Neuronen */}
              {neuronValues.slice(0, neuronsToShow).map((val: number, i: number) => {
                const x = leftPad + lIdx * layerGap + neuronRadius;
                const y = topPad + i * neuronGap + neuronRadius;
                return (
                  <g key={`l${lIdx}-n${i}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r={neuronRadius}
                      fill="#ddd"
                      stroke="#eee"
                      strokeWidth={2}
                    />
                    <text
                      x={x}
                      y={y + 1}
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      fontWeight="bold"
                      fontSize={11.5}
                      fill="#444"
                      style={{ userSelect: "none" }}
                    >
                      {val.toFixed(2)}
                    </text>
                  </g>
                );
              })}
              
              {/* Zeige "..." wenn es mehr Neuronen gibt */}
              {neuronValues.length > maxNeuronsToShow && (
                <text
                  key={`dots-${lIdx}`}
                  x={leftPad + lIdx * layerGap + neuronRadius}
                  y={topPad + maxNeuronsToShow * neuronGap + neuronRadius + 20}
                  textAnchor="middle"
                  fontSize={16}
                  fontWeight={600}
                  fill="#666"
                >
                  ...
                </text>
              )}
            </g>
          );
        })}
        {/* Layer labels */}
        {layers.map((layer, lIdx) => (
          <text
            key={`label-${lIdx}`}
            x={leftPad + lIdx * layerGap + neuronRadius}
            y={topPad - 10}
            textAnchor="middle"
            fontSize={18}
            fontWeight={700}
            fill="#444"
          >
            {layer.name}
          </text>
        ))}
      </svg>
    </div>
  );
} 