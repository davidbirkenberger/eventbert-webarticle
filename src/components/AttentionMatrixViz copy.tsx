import React, { useRef, useEffect } from "react";

type Props = {
  tokens: string[];
  attention: number[][];
  selectedTokenIndex?: number;
  width?: number;
  height?: number;
};

const AttentionMatrixViz: React.FC<Props> = ({
  tokens,
  attention,
  selectedTokenIndex = 0,
  width = 600,
  height = 600,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const padding = 80;
    const tokenHeight = (height - 2 * padding) / tokens.length;
    const yPos = tokens.map((_, i) => padding + i * tokenHeight);

    // Draw tokens left
    ctx.font = "16px 'Inter', monospace";
    ctx.textAlign = "right";
    tokens.forEach((t, i) => {
      ctx.fillStyle = i === selectedTokenIndex ? "#1976d2" : "#222";
      ctx.font = i === selectedTokenIndex ? "bold 16px 'Inter', monospace" : "16px 'Inter', monospace";
      ctx.fillText(t, padding - 12, yPos[i] + 6);
    });

    // Draw tokens right
    ctx.textAlign = "left";
    tokens.forEach((t, i) => {
      ctx.fillStyle = i === selectedTokenIndex ? "#1976d2" : "#222";
      ctx.font = i === selectedTokenIndex ? "bold 16px 'Inter', monospace" : "16px 'Inter', monospace";
      ctx.fillText(t, width - padding + 12, yPos[i] + 6);
    });

    // Draw attention lines
    for (let from = 0; from < tokens.length; from++) {
      for (let to = 0; to < tokens.length; to++) {
        const weight = attention[from][to];
        if (weight > 0.01) {
          ctx.beginPath();
          ctx.moveTo(padding, yPos[from]);
          ctx.lineTo(width - padding, yPos[to]);
          ctx.strokeStyle = `rgba(30, 100, 255, ${weight})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }, [tokens, attention, selectedTokenIndex, width, height]);

  return (
    <div style={{ width, height, background: "#fff", borderRadius: 8, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default AttentionMatrixViz; 