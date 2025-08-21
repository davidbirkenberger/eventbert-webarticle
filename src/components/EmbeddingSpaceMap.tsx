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
  onTokenSelect?: (token: string | null) => void;
  width?: number;
  height?: number;
};

const EmbeddingSpaceMap: React.FC<Props> = ({
  data,
  selectedToken,
  onTokenSelect,
  width = 800,
  height = 350,
}) => {
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);

  // Compute bounds for scaling with padding for text labels
  const xs = data.map(d => d.x);
  const ys = data.map(d => d.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);

  // Add padding to prevent clipping of text labels
  const textPadding = 30; // Increased padding for text labels
  
  // Scale function with better padding
  const scaleX = (x: number) =>
    ((x - minX) / (maxX - minX || 1)) * (width - 2 * textPadding) + textPadding;
  const scaleY = (y: number) =>
    height - (((y - minY) / (maxY - minY || 1)) * (height - 2 * textPadding) + textPadding);

  // Smart text positioning to avoid clipping
  const getTextPosition = (x: number, y: number, token: string) => {
    const fontSize = 15;
    const textHeight = fontSize * 1.2; // Approximate text height
    
    // Check if text would clip at the top
    if (y - textHeight < textPadding) {
      // Position text below the point if it would clip at top
      return { x, y: y + 20 };
    }
    
    // Check if text would clip at the bottom
    if (y + textHeight > height - textPadding) {
      // Position text above the point if it would clip at bottom
      return { x, y: y - 20 };
    }
    
    // Default: position text above the point
    return { x, y: y - 10 };
  };

  // Auto-zoom to selected token
  useEffect(() => {
    if (!selectedToken) return;
    const point = data.find(d => d.token === selectedToken);
    if (!point || !transformRef.current) return;
    const x = scaleX(point.x);
    const y = scaleY(point.y);
    // Center and zoom in (adjust scale as needed)
    transformRef.current.setTransform(
      width / 2 - x * 1, // panX - reduced from 3 to 1.5
      height / 2 - y * 1, // panY - reduced from 3 to 1.5
      1, // scale - reduced from 3 to 1.5
      1000, // animation time ms
      "easeInOutQuad"
    );
  }, [selectedToken, data, width, height]);

  if (!data || data.length === 0) return null;

  return (
    <div style={{ position: "relative", width, height }}>
      <TransformWrapper ref={transformRef} minScale={1} maxScale={10} initialScale={1} centerOnInit>
        <TransformComponent>
          <svg 
            width={width} 
            height={height} 
            style={{ background: "#fff" }}
            overflow="visible" // Allow content to overflow for better text visibility
          >
            {/* All points */}
            {data.map((d, i) => {
              const pointX = scaleX(d.x);
              const pointY = scaleY(d.y);
              const textPos = getTextPosition(pointX, pointY, d.token);
              
              return (
                <g key={i}>
                  <circle
                    cx={pointX}
                    cy={pointY}
                    r={4}
                    fill={d.token === selectedToken ? "black" : "grey"}
                    opacity={d.token === selectedToken ? 1 : 0.15}
                    onMouseEnter={() => onTokenSelect && onTokenSelect(d.token)}
                    onMouseLeave={() => onTokenSelect && onTokenSelect(null)}
                    onClick={() => onTokenSelect && onTokenSelect(d.token)}
                    style={{ cursor: "pointer" }}
                  />
                  <text
                    x={textPos.x}
                    y={textPos.y}
                    fontWeight={d.token === selectedToken ? "bold" : "normal"}
                    fontSize={15}
                    fill={d.token === selectedToken ? "black" : "grey"}
                    opacity={d.token === selectedToken ? 1 : 0.15}
                    textAnchor="middle"
                    dominantBaseline="middle" // Better text alignment
                    style={{ pointerEvents: "none" }}
                  >
                    {d.token}
                  </text>
                </g>
              );
            })}
          </svg>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

export default EmbeddingSpaceMap; 