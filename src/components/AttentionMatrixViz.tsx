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

    // Draw all tokens on the left with reduced opacity for non-selected
    ctx.font = "16px 'Inter', monospace";
    ctx.textAlign = "right";
    tokens.forEach((t, i) => {
      if (i === selectedTokenIndex) {
        ctx.fillStyle = "#1976d2";
        ctx.font = "bold 16px 'Inter', monospace";
      } else {
        ctx.fillStyle = "rgba(34, 34, 34, 0.3)";
        ctx.font = "16px 'Inter', monospace";
      }
      ctx.fillText(t, padding - 12, yPos[i] + 6);
    });

    // Draw all tokens on the right (no highlighting)
    ctx.textAlign = "left";
    ctx.font = "16px 'Inter', monospace";
    ctx.fillStyle = "#222";
    tokens.forEach((t, i) => {
      ctx.fillText(t, width - padding + 12, yPos[i] + 6);
    });

    // Draw all attention lines with reduced opacity for non-selected connections
    for (let from = 0; from < tokens.length; from++) {
      for (let to = 0; to < tokens.length; to++) {
        const weight = attention[from][to];
        if (weight > 0.01) {
          ctx.beginPath();
          ctx.moveTo(padding, yPos[from]);
          ctx.lineTo(width - padding, yPos[to]);
          
          if (from === selectedTokenIndex) {
            // Selected token connections are more prominent
            ctx.strokeStyle = `rgba(30, 100, 255, ${weight})`;
            ctx.lineWidth = 5;
          } else {
            // Other connections with reduced opacity
            ctx.strokeStyle = `rgba(30, 100, 255, ${weight * 0.})`;
            ctx.lineWidth = 1;
          }
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