import React, { useRef, useEffect, useState } from "react";

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
  width = 500,//Math.max(600, tokens.length * 25 + 160), // Dynamische Breite basierend auf Token-Anzahl
  height = 500
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredTokenIndex, setHoveredTokenIndex] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fix für Retina/High-DPI Displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Setze die tatsächliche Canvas-Größe
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // Skaliere den Kontext
    ctx.scale(dpr, dpr);
    
    // Setze die Canvas-CSS-Größe
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    ctx.clearRect(0, 0, rect.width, rect.height);

    const xpadding = 150;
    const ypadding = 50;
    const tokenHeight = (rect.height - 2 * ypadding) / tokens.length;
    const yPos = tokens.map((_, i) => ypadding + i * tokenHeight);

    // Draw all tokens on the left with hover state
    ctx.font = "16px 'Inter', monospace";
    ctx.textAlign = "right";
    tokens.forEach((t, i) => {
      if (i === hoveredTokenIndex) {
        // Hovered token - highlight with purple color to match attention edges
        ctx.fillStyle = "#9333ea";
        ctx.font = "bold 16px 'Inter', monospace";
      } else {
        // Regular tokens - full opacity by default, reduced only on hover
        const opacity = hoveredTokenIndex !== null ? 0.3 : 1;
        ctx.fillStyle = `rgba(34, 34, 34, ${opacity})`;
        ctx.font = "16px 'Inter', monospace";
      }
      ctx.fillText(t, xpadding - 12, yPos[i] + 6);
    });

    // Draw all tokens on the right
    ctx.textAlign = "left";
    ctx.font = "16px 'Inter', monospace";
    ctx.fillStyle = hoveredTokenIndex !== null ? "rgba(34, 34, 34, 0.3)" : "#222";
    tokens.forEach((t, i) => {
      ctx.fillText(t, rect.width - xpadding + 12, yPos[i] + 6);
    });

    // Draw attention lines based on hover state
    for (let from = 0; from < tokens.length; from++) {
      for (let to = 0; to < tokens.length; to++) {
        const weight = attention[from][to];
        if (weight > 0.01) {
          ctx.beginPath();
          ctx.moveTo(xpadding, yPos[from]);
          ctx.lineTo(rect.width - xpadding, yPos[to]);
          
          // All attention connections use the same color (purple) with different opacity based on hover state
          const opacity = from === hoveredTokenIndex ? Math.min(weight * 2, 0.9) : (hoveredTokenIndex !== null ? weight * 0.3 : weight);
          ctx.strokeStyle = `rgba(147, 51, 234, ${opacity})`;
          ctx.lineWidth = from === hoveredTokenIndex ? Math.max(weight * 8, 2) : Math.max(weight * 3, 1);
          ctx.stroke();
        }
      }
    }
  }, [tokens, attention, selectedTokenIndex, hoveredTokenIndex, width, height]);

  // Handle mouse events for hover
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xpadding = 150;
    const ypadding = 50;
    const tokenHeight = (rect.height - 2 * ypadding) / tokens.length;
    const yPos = tokens.map((_, i) => ypadding + i * tokenHeight);
    
    // Check if mouse is over a left token
    if (x < xpadding) {
      for (let i = 0; i < tokens.length; i++) {
        if (Math.abs(y - yPos[i]) < tokenHeight / 2) {
          setHoveredTokenIndex(i);
          return;
        }
      }
    }
    
    // Mouse not over any token
    setHoveredTokenIndex(null);
  };

  const handleMouseLeave = () => {
    setHoveredTokenIndex(null);
  };

  return (
    <div style={{ 
      width: "auto", 
      height: "auto",
      background: "#fff", 
      position: "relative",

    }}>
      <canvas 
        ref={canvasRef}
        width={width} 
        height={height}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: "pointer", width: "100%", height: "auto"}}
      />
      

    </div>
  );
};

export default AttentionMatrixViz; 