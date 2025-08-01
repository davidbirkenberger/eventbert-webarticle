import React, { useEffect, useState } from "react";

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

export default function FeedForwardViz() {
  const [data, setData] = useState<any>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/feedforwarddata.josn")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading || !data) return <div>Loading…</div>;

  const tokens: string[] = data.tokens;
  const layers: { name: string; values: Record<string, number[]> }[] = data.layers;
  const token = tokens[selectedIdx];
  const numLayers = layers.length;
  const layerDims = layers.map((l) => l.values[token].length);

  // Layout
  const neuronRadius = 18;
  const layerGap = 120;
  const neuronGap = 38;
  const width = (numLayers - 1) * layerGap + 2 * neuronRadius + 120;
  const height = Math.max(...layerDims) * neuronGap + 2 * neuronRadius + 40;
  const leftPad = 60;
  const topPad = 30;

  // Find max abs value for line width normalization
  let maxAbs = 1;
  for (let l = 0; l < numLayers - 1; ++l) {
    const from = layers[l].values[token];
    const to = layers[l + 1].values[token];
    for (let i = 0; i < from.length; ++i) {
      for (let j = 0; j < to.length; ++j) {
        const w = from[i]; // Use from neuron value as 'weight' for color/width
        if (Math.abs(w) > maxAbs) maxAbs = Math.abs(w);
      }
    }
  }

  // Token selector
  function prevToken() {
    setSelectedIdx((i) => (i - 1 + tokens.length) % tokens.length);
  }
  function nextToken() {
    setSelectedIdx((i) => (i + 1) % tokens.length);
  }

  return (
    <div style={{ width, margin: "0 auto", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
        <button onClick={prevToken} style={{ fontSize: 22, border: "none", background: "none", cursor: "pointer", color: "#888", marginRight: 12 }}>&larr;</button>
        <span style={{ fontWeight: 700, fontSize: 22, margin: "0 8px" }}>
          “{token}”
        </span>
        <button onClick={nextToken} style={{ fontSize: 22, border: "none", background: "none", cursor: "pointer", color: "#888", marginLeft: 12 }}>&rarr;</button>
      </div>
      <svg width={width} height={height}>
        {/* Draw lines between layers */}
        {layers.slice(0, -1).map((layer, lIdx) => {
          const from = layer.values[token];
          const to = layers[lIdx + 1].values[token];
          return from.map((fromVal, i) =>
            to.map((toVal, j) => {
              // Use fromVal as 'weight' for color/width
              const x1 = leftPad + lIdx * layerGap + neuronRadius;
              const y1 = topPad + i * neuronGap + neuronRadius;
              const x2 = leftPad + (lIdx + 1) * layerGap + neuronRadius;
              const y2 = topPad + j * neuronGap + neuronRadius;
              return (
                <line
                  key={`l${lIdx}-n${i}-to-n${j}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={getWeightColor(fromVal)}
                  strokeWidth={getWeightWidth(fromVal, maxAbs)}
                  opacity={0.25}
                />
              );
            })
          );
        })}
        {/* Draw neurons and values */}
        {layers.map((layer, lIdx) =>
          layer.values[token].map((val: number, i: number) => {
            const x = leftPad + lIdx * layerGap + neuronRadius;
            const y = topPad + i * neuronGap + neuronRadius;
            return (
              <g key={`l${lIdx}-n${i}`}>
                <circle
                  cx={x}
                  cy={y}
                  r={neuronRadius}
                  fill="#fff"
                  stroke="#aaa"
                  strokeWidth={2}
                />
                <text
                  x={x}
                  y={y + 2}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fontWeight={"bold"}
                  fontSize={15}
                  fill="#222"
                  style={{ userSelect: "none" }}
                >
                  {val.toFixed(2)}
                </text>
              </g>
            );
          })
        )}
        {/* Layer labels */}
        {layers.map((layer, lIdx) => (
          <text
            key={`label-${lIdx}`}
            x={leftPad + lIdx * layerGap + neuronRadius}
            y={topPad - 16}
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