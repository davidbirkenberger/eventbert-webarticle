import React, { useRef, useEffect } from "react";
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from "react-zoom-pan-pinch";

type EmbeddingPoint = {
  token: string;
  x: number;
  y: number;
};

type Props = {
  data: EmbeddingPoint[];
  selectedToken?: string;
  onHover?: (token: string | null) => void;
  width?: number;
  height?: number;
};

const EmbeddingSpaceMap: React.FC<Props> = ({
  data,
  selectedToken,
  onHover,
  width = 1000,
  height = 350,
}) => {
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);

  // Compute bounds for scaling
  const xs = data.map(d => d.x);
  const ys = data.map(d => d.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);

  // Scale function
  const scaleX = (x: number) =>
    ((x - minX) / (maxX - minX || 1)) * (width - 40) + 20;
  const scaleY = (y: number) =>
    height - (((y - minY) / (maxY - minY || 1)) * (height - 40) + 20);

  // Auto-zoom to selected token
  useEffect(() => {
    if (!selectedToken) return;
    const point = data.find(d => d.token === selectedToken);
    if (!point || !transformRef.current) return;
    const x = scaleX(point.x);
    const y = scaleY(point.y);
    // Center and zoom in (adjust scale as needed)
    transformRef.current.setTransform(
      width / 2 - x * 3, // panX
      height / 2 - y * 3, // panY
      3, // scale
      200, // animation time ms
      "easeOut"
    );
  }, [selectedToken, data, width, height]);

  // Reset handler
  const handleReset = () => {
    if (transformRef.current) {
      transformRef.current.resetTransform();
    }
  };

  if (!data || data.length === 0) return null;

  return (
    <div style={{ position: "relative", width, height }}>
      {/* Reset button */}
      <button
        onClick={handleReset}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 2,
          background: "rgba(255,255,255,0.8)",
          border: "1px solid #ccc",
          borderRadius: "50%",
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          padding: 0,
        }}
        title="Reset Zoom"
      >
        {/* Minimal circular arrow icon */}
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 3a6 6 0 1 1-4.24 1.76" />
          <polyline points="5 3 9 3 9 7" />
        </svg>
      </button>
      <TransformWrapper ref={transformRef} minScale={1} maxScale={10} initialScale={1} centerOnInit>
        <TransformComponent>
          <svg width={width} height={height} style={{ background: "#fff" }}>
            {/* All points */}
            {data.map((d, i) => (
              <g key={i}>
                <circle
                  cx={scaleX(d.x)}
                  cy={scaleY(d.y)}
                  r={4}
                  fill={d.token === selectedToken ? "black" : "grey"}
                  opacity={d.token === selectedToken ? 1 : 0.15}
                  onMouseEnter={() => onHover && onHover(d.token)}
                  onMouseLeave={() => onHover && onHover(null)}
                  style={{ cursor: "pointer" }}
                />
                <text
                  x={scaleX(d.x)}
                  y={scaleY(d.y) - 10}
                  fontWeight={d.token === selectedToken ? "bold" : "normal"}
                  fontSize={15}
                  fill={d.token === selectedToken ? "black" : "grey"}
                  opacity={d.token === selectedToken ? 1 : 0.15}
                  textAnchor="middle"
                  style={{ pointerEvents: "none" }}
                >
                  {d.token}
                </text>
              </g>
            ))}
          </svg>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

export default EmbeddingSpaceMap; 