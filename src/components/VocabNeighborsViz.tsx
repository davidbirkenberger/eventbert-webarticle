import React, { useMemo, useRef, useEffect, useState } from "react";
import { useModelData } from "../hooks/useModelData";

type Point = { token: string; x: number; y: number };
type NeighborPoint = Point & { is_focus: boolean; similarity: number };

type VocabNeighborsData = {
  topk: number;
  points: NeighborPoint[];
  note: string;
};

type VocabFullPoint = {
  token_id: string;
  token: string;
  x: number;
  y: number;
};

type NeighborByToken = {
  [token: string]: Array<{
    token_id: string;
    token: string;
    similarity: number;
  }>;
};

type VocabNeighborsVizProps = {
  vocabNeighbors: VocabNeighborsData;
  fullVocabData: VocabFullPoint[];
  neighborsByToken: NeighborByToken;
  selectedToken?: string | null;
  onTokenSelect?: (token: string | null) => void;
  width?: number;
  height?: number;
  className?: string;
};

function normalize(points: { x: number; y: number }[], padding = 20) {
  // Compute a simple linear transform that maps data coords to canvas coords.
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  return (w: number, h: number) => (p: { x: number; y: number }) => {
    const sx = (w - 2 * padding) / (maxX - minX || 1);
    const sy = (h - 2 * padding) / (maxY - minY || 1);
    return {
      x: padding + (p.x - minX) * sx,
      y: h - padding - (p.y - minY) * sy // invert Y for canvas
    };
  };
}

export default function VocabNeighborsViz({ 
  vocabNeighbors, 
  fullVocabData,
  neighborsByToken,
  selectedToken,
  onTokenSelect,
  width = 900, 
  height = 520,
  className = ""
}: VocabNeighborsVizProps) {
  const { data: modelData } = useModelData();
  const [hoveredPoint, setHoveredPoint] = useState<{ token: string; similarity?: number; x: number; y: number; dataX?: number; dataY?: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [isResetting, setIsResetting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // Define different colors for neighbors (used in both tab and map)
  const getNeighborColor = (index: number) => {
    const colors = [
      "#ef476fff", // bright-pink-crayola
      "#ffd166ff", // sunglow
      "#06d6a0ff", // emerald
      "#118ab2ff", // blue-ncs
      "#073b4cff"  // midnight-green
    ];
    return colors[index % colors.length];
  };

  // Get sentence tokens from model_data.json (excluding CLS and SEP)
  const sentenceTokens = useMemo(() => {
    if (!modelData) return [];
    return modelData.tokens.filter(token => token !== "[CLS]" && token !== "[SEP]");
  }, [modelData]);

  // Get sentence token points by finding them in the full vocabulary data
  const sentencePoints = useMemo(() => {
    return sentenceTokens.map(token => {
      const vocabPoint = fullVocabData.find(p => p.token === token);
      if (vocabPoint) {
        return {
          token: vocabPoint.token,
          is_focus: true,
          similarity: 1.0,
          x: vocabPoint.x,
          y: vocabPoint.y
        };
      }
      return null;
    }).filter(Boolean) as NeighborPoint[];
  }, [sentenceTokens, fullVocabData]);

  // Get neighbors for the selected token
  const activeTokenNeighbors = useMemo(() => {
    if (!selectedToken || !neighborsByToken[selectedToken]) return [];
    
    // Get the top 5 neighbors for the selected token
    const neighbors = neighborsByToken[selectedToken];
    
    // Convert to the format expected by the component
    const validNeighbors = neighbors.slice(0, 5).map(neighbor => {
      // Find the neighbor's coordinates from the full vocabulary data
      const vocabPoint = fullVocabData.find(p => p.token === neighbor.token);
      if (vocabPoint) {
        return {
          token: neighbor.token,
          is_focus: false,
          similarity: neighbor.similarity,
          x: vocabPoint.x,
          y: vocabPoint.y
        };
      }
      return null;
    }).filter(Boolean) as NeighborPoint[];
    
    return validNeighbors;
  }, [selectedToken, neighborsByToken, fullVocabData]);

  // Build transform from all points in the same coordinate system
  const toAll = useMemo(() => {
    const all = [...sentencePoints, ...fullVocabData];
    const tf = normalize(all);
    return tf(width, height);
  }, [sentencePoints, fullVocabData, width, height]);

  // Apply zoom and pan to canvas coordinates
  const applyTransform = (x: number, y: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // First apply pan
    const pannedX = x + panX;
    const pannedY = y + panY;
    
    // Then apply zoom from center
    const zoomedX = centerX + (pannedX - centerX) * zoom;
    const zoomedY = centerY + (pannedY - centerY) * zoom;
    
    return { x: zoomedX, y: zoomedY };
  };

  // Auto-zoom when token is selected
  useEffect(() => {
    if (selectedToken) {
      // Increase zoom when a token is selected
      const targetZoom = 8.0; // Much stronger zoom when selected
      setZoom(targetZoom);
      
      // Reset pan to center when zooming in
      setPanX(0);
      setPanY(0);
    } else {
      // Reset zoom when no token is selected
      setZoom(1);
      setPanX(0);
      setPanY(0);
    }
  }, [selectedToken]);



  // Hit testing cache for all points (click and hover).
  const hitAreas = useRef<{ 
    token: string; 
    x: number; 
    y: number; 
    r: number; 
    isSentence: boolean;
    similarity?: number;
  }[]>([]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // STEP 1: Draw all vocabulary dots with appropriate colors
    hitAreas.current = [];
    if (fullVocabData.length > 0) {
      for (const p of fullVocabData) {
        const { x, y } = toAll(p);
        const transformed = applyTransform(x, y);
        
        // Check if this is a sentence token
        const isSentenceToken = sentencePoints.some(sp => sp.token === p.token);
        
        if (isSentenceToken) {
          // Draw sentence tokens as black circles (size scales with zoom)
          const pointSize = Math.max(2, Math.min(6, 3 * zoom));
          ctx.beginPath();
          ctx.arc(transformed.x, transformed.y, pointSize, 0, Math.PI * 2);
          ctx.fillStyle = "black";
          ctx.fill();
          
          // Add to hit areas for interaction
          hitAreas.current.push({ 
            token: p.token, 
            x: transformed.x, 
            y: transformed.y, 
            r: Math.max(8, Math.min(16, 10 * zoom)), 
            isSentence: true 
          });
        } else {
          // Draw regular vocabulary as grey dots (size scales with zoom)
          const pointSize = Math.max(1, Math.min(3, 1.5 * zoom));
          ctx.beginPath();
          ctx.arc(transformed.x, transformed.y, pointSize, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0, 0, 0, 0.05)"; // Very faint grey
          ctx.fill();
        }
      }
    }

    // STEP 2: Draw neighbor tokens with different colors (if any are selected)
    if (selectedToken && activeTokenNeighbors.length > 0) {
      activeTokenNeighbors.forEach((neighbor, index) => {
        const { x, y } = toAll(neighbor);
        const transformed = applyTransform(x, y);
        const r = Math.max(2, Math.min(4, 2.5 * zoom)); // Size scales with zoom
        
        ctx.beginPath();
        ctx.arc(transformed.x, transformed.y, r, 0, Math.PI * 2);
        ctx.fillStyle = getNeighborColor(index); // Use different color for each neighbor
        ctx.fill();

        // Add to hit areas
        hitAreas.current.push({ 
          token: neighbor.token, 
          x: transformed.x, 
          y: transformed.y, 
          r, 
          isSentence: false,
          similarity: neighbor.similarity
        });
      });
    }

    // Add sentence tokens to hit areas for interaction
    for (const p of sentencePoints) {
      const { x, y } = toAll(p);
      const transformed = applyTransform(x, y);
      
      hitAreas.current.push({ 
        token: p.token, 
        x: transformed.x, 
        y: transformed.y, 
        r: 8 * zoom, 
        isSentence: true 
      });
    }

    // STEP 3: Apply highlights using canvas composite operations
    if (selectedToken || hoveredPoint) {
      ctx.save();
      
      // Highlight selected sentence token (red dot)
      if (selectedToken) {
        const selectedPoint = sentencePoints.find(p => p.token === selectedToken);
        if (selectedPoint) {
          const { x, y } = toAll(selectedPoint);
          const transformed = applyTransform(x, y);
          
          // Draw red dot on top of the existing black dot
          ctx.globalCompositeOperation = 'source-over';
          ctx.beginPath();
          const highlightSize = Math.max(3, Math.min(8, 4 * zoom));
          ctx.arc(transformed.x, transformed.y, highlightSize, 0, Math.PI * 2);
          ctx.fillStyle = "red";
          ctx.fill();
        }
      }
      
      // Highlight hovered point using composite operation
      if (hoveredPoint) {
        const hoveredPointData = hitAreas.current.find(h => h.token === hoveredPoint.token);
        if (hoveredPointData) {
          // Use 'multiply' to create a red tint effect over the existing point
          ctx.globalCompositeOperation = 'multiply';
          ctx.globalAlpha = 0.7;
          
          ctx.beginPath();
          ctx.arc(hoveredPointData.x, hoveredPointData.y, hoveredPointData.r, 0, Math.PI * 2);
          ctx.fillStyle = "red";
          ctx.fill();
        }
      }
      
      ctx.restore();
    }

    // STEP 4: Draw all labels (after all points are drawn)
    
    // Draw sentence token labels
    for (const p of sentencePoints) {
      const { x, y } = toAll(p);
      const transformed = applyTransform(x, y);
      const isActive = selectedToken ? p.token === selectedToken : false;

      // Label styling (size scales with zoom)
      const fontSize = Math.max(10, Math.min(20, 14 * zoom));
      ctx.font = `${fontSize}px system-ui, sans-serif`;
      ctx.fillStyle = isActive ? "red" : "black";
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      
      // Smart label positioning - closer to dots
      let labelX = transformed.x + 4 * zoom; // Closer to dot
      let labelY = transformed.y;
      
      if (transformed.x > width * 0.7) {
        labelX = transformed.x - 4 * zoom; // Closer to dot
        ctx.textAlign = "right";
      }
      
      if (transformed.y < height * 0.2) {
        labelY = transformed.y + 4 * zoom; // Closer to dot
      }
      
      ctx.fillText(p.token, labelX, labelY);
    }
    

  }, [sentencePoints, selectedToken, hoveredPoint, toAll, width, height, zoom, panX, panY, activeTokenNeighbors, fullVocabData]);

  // Auto-zoom when selectedToken changes (from TokenEmbeddingsPanel)
  useEffect(() => {
    if (selectedToken && sentencePoints.length > 0 && !isResetting) {
      console.log("Selected token changed to:", selectedToken);
      
      // Find the token in sentencePoints and use toAll for normalized coordinates
      const tokenPoint = sentencePoints.find(sp => sp.token === selectedToken);
      console.log("Found tokenPoint:", tokenPoint);
      
      if (tokenPoint) {
        // Use toAll to get normalized coordinates (like before)
        const { x, y } = toAll(tokenPoint);
        console.log("Normalized coordinates:", x, y);
        
        // Calculate pan to center this token
        const targetX = width / 2 - x;
        const targetY = height / 2 - y;
        console.log("Target pan:", targetX, targetY);
        console.log("Current zoom:", zoom, "pan:", panX, panY);
        
        // Animate smoothly to the target position
        const startZoom = zoom;
        const startPanX = panX;
        const startPanY = panY;
        const targetZoom = 20;
        
        const duration = 800; // 800ms for smooth animation
        const startTime = Date.now();
        
        console.log("Starting animation...");
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Smooth easing function
          const easeOut = 1 - Math.pow(1 - progress, 3);
          
          const newZoom = startZoom + (targetZoom - startZoom) * easeOut;
          const newPanX = startPanX + (targetX - startPanX) * easeOut;
          const newPanY = startPanY + (targetY - startPanY) * easeOut;
          
          console.log("Animation frame:", progress, "zoom:", newZoom, "pan:", newPanX, newPanY);
          
          setZoom(newZoom);
          setPanX(newPanX);
          setPanY(newPanY);
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            console.log("Animation finished");
          }
        };
        
        requestAnimationFrame(animate);
      } else {
        console.log("No tokenPoint found for token:", selectedToken);
      }
    }
  }, [selectedToken, sentencePoints, toAll, width, height, zoom, panX, panY]);

  // Click handler to set active token (only sentence tokens).
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const onClick = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      for (const h of hitAreas.current) {
        const dx = mx - h.x, dy = my - h.y;
        if (dx * dx + dy * dy <= h.r * h.r) {
          if (h.isSentence && onTokenSelect) {
            onTokenSelect(h.token);
          }
          return;
        }
      }
    };

    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [onTokenSelect]);

  // Hover handler for tooltips
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

              let found = null;
        for (const h of hitAreas.current) {
          const dx = mx - h.x, dy = my - h.y;
          if (dx * dx + dy * dy <= h.r * h.r) {
            // Find the actual data coordinates
            let dataX, dataY;
            if (h.isSentence) {
              const sentencePoint = sentencePoints.find(sp => sp.token === h.token);
              if (sentencePoint) {
                dataX = sentencePoint.x;
                dataY = sentencePoint.y;
              }
            } else {
              // For neighbor points, find in fullVocabData
              const vocabPoint = fullVocabData.find(vp => vp.token === h.token);
              if (vocabPoint) {
                dataX = vocabPoint.x;
                dataY = vocabPoint.y;
              }
            }
            
            found = {
              token: h.token,
              similarity: h.similarity,
              x: e.clientX,
              y: e.clientY,
              dataX,
              dataY
            };
            break;
          }
        }
      setHoveredPoint(found);
    };

    const onMouseLeave = () => setHoveredPoint(null);

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);
    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  // Zoom handler
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.85 : 1.15; // Stronger zoom steps
      
      // Only allow manual zoom if no token is selected (to preserve auto-zoom)
      if (!selectedToken) {
        setZoom(prev => Math.max(0.3, Math.min(8, prev * delta))); // Wider zoom range
      }
    };

    el.addEventListener("wheel", onWheel);
    return () => el.removeEventListener("wheel", onWheel);
  }, [selectedToken]);

  // Pan handlers
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) { // Left click only
        setIsDragging(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - lastMousePos.x;
        const dy = e.clientY - lastMousePos.y;
        
        // Only allow panning if no token is selected (to preserve auto-zoom view)
        if (!selectedToken) {
          // Apply pan with zoom scaling
          setPanX(prev => prev + dx / zoom);
          setPanY(prev => prev + dy / zoom);
        }
        
        setLastMousePos({ x: e.clientX, y: e.clientY });
      }
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseup", onMouseUp);
    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, lastMousePos, selectedToken]);

  const resetView = () => {
    // Set flag to prevent auto-zoom
    setIsResetting(true);
    
    // Reset view to overview
    setZoom(1);
    setPanX(0);
    setPanY(0);
    
    // Clear flag after animation would have finished
    setTimeout(() => {
      setIsResetting(false);
    }, 1000);
  };

  return (
    <div className={className} style={{ position: "relative" }}>
      {/* Zoom controls */}
      <div style={{ 
        position: "absolute", 
        top: 10, 
        left: 10, 
        zIndex: 10,
        background: "rgba(255, 255, 255, 0.9)",
        padding: "8px 12px",
        borderRadius: "6px",
        fontSize: "12px",
        display: "flex",
        gap: "8px",
        alignItems: "center"
      }}>
        <span>Zoom: {Math.round(zoom * 100)}%</span>
        <button 
          onClick={resetView}
          style={{
            padding: "4px 8px",
            fontSize: "11px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            background: "white",
            cursor: "pointer"
          }}
        >
          Reset View
        </button>
      </div>

      {/* Neighbors overlay panel */}
      {selectedToken && activeTokenNeighbors.length > 0 && (
        <div style={{
          position: "absolute",
          top: 10,
          right: 17,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          padding: "16px",
          minWidth: "200px",
          zIndex: 10,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
        }}>
          <div style={{ 
            fontWeight: "bold", 
            marginBottom: "12px", 
            fontSize: "14px",
            color: "#333"
          }}>
            Räumliche Nachbarn von "{selectedToken}"
          </div>
          {activeTokenNeighbors.map((neighbor, index) => (
            <div key={index} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "4px",
              fontSize: "13px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {/* Colored dot with unique color for each neighbor */}
                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: getNeighborColor(index),
                  flexShrink: 0
                }} />
                <span style={{ fontFamily: "monospace" }}>{neighbor.token}</span>
              </div>
              <span style={{ 
                color: "#666", 
                fontSize: "12px",
                fontFamily: "monospace"
              }}>
                {neighbor.similarity.toFixed(3)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tooltip */}
      {hoveredPoint && (
        <div
          ref={tooltipRef}
          style={{
            position: "fixed",
            left: hoveredPoint.x + 10,
            top: hoveredPoint.y - 10,
            background: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            pointerEvents: "none",
            zIndex: 1000,
            fontFamily: "monospace"
          }}
        >
          <div>{hoveredPoint.token}</div>
          {hoveredPoint.similarity !== undefined && (
            <div style={{ opacity: 0.8, fontSize: "11px" }}>
              Similarity: {hoveredPoint.similarity.toFixed(3)}
            </div>
          )}
          {hoveredPoint.dataX !== undefined && hoveredPoint.dataY !== undefined && (
            <div style={{ opacity: 0.8, fontSize: "11px" }}>
              Data: ({hoveredPoint.dataX.toFixed(3)}, {hoveredPoint.dataY.toFixed(3)})
            </div>
          )}
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          cursor: isDragging ? "grabbing" : "grab"
        }}
      />


    </div>
  );
} 