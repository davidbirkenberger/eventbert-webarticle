import React from "react";

interface TransformerBlockChartProps {
  selected: "attention" | "feedforward" | "addnorm" | "addnorm2";
  onSelect: (block: "attention" | "feedforward" | "addnorm" | "addnorm2") => void;
  currentLayer: number;
  onLayerChange: (layer: number) => void;
}

export default function TransformerBlockChart({ selected, onSelect, currentLayer, onLayerChange }: TransformerBlockChartProps) {
  // Layout variables for easy customization
  const width = 270;
  const height = 450;
  const blockWidth = 100;
  const blockHeight = 40;
  const blockRadius = 3.5;
  const strokeWidth = 1;
  const selectedStrokeWidth = 2;
  
  // Positions
  const leftBlockX = 15;
  const rightBlockX = 155;

  const attentionY = 80;
  const firstAddNormY = 150;
  const feedforwardY = 280;
  const secondAddNormY = 350;
  
  // Colors
  const defaultFill = "#f0f0f0";
  const selectedFill = "#e3edff";
  const defaultStroke = "#dee2e6";
  const selectedStroke = "#1e64ff";
  const textColor = "#666";
  const selectedTextColor = "#1e64ff";
  
  // Font sizes
  const fontSize = 12;
  const fontWeight = "bold";
  
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 20 }}>
      {/* Vertical Layer Selector - Elevator Style */}
      <div style={{ 
        display: "flex", 
        flexDirection: "column",
        gap: 4,
        padding: "10px 8px",
        alignItems: "center"
      }}>
        <div style={{ 
          textAlign: "center",
          fontSize: 14,
          fontWeight: "bold",
          color: "#444",
          marginBottom: 8
        }}>
          Layer
        </div>
        {Array.from({ length: 12 }, (_, i) => (
          <button
            key={i}
            onClick={() => onLayerChange(i)}
            style={{
              width: 28,
              height: 28,
              border: "none",
              borderRadius: "50%",
              backgroundColor: currentLayer === i ? "#1e64ff" : "#f0f0f0",
              color: currentLayer === i ? "white" : "#666",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: "bold",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            onMouseEnter={(e) => {
              if (currentLayer !== i) {
                e.currentTarget.style.backgroundColor = "#e0e0e0";
              }
            }}
            onMouseLeave={(e) => {
              if (currentLayer !== i) {
                e.currentTarget.style.backgroundColor = "#f0f0f0";
              }
            }}
          >
            {i}
          </button>
        ))}
      </div>
      
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Define arrow marker */}
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="4" 
            refX="5" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="black" />
          </marker>
        </defs>
        
        {/* Main block outline and lines */}
        <rect x="0.5" y="19.5" width={width - 1} height={height - 40} rx="4.5" stroke="#B8B8B8" strokeWidth="2" strokeDasharray="4 4" />
        
        
        {/* Main vertical line */}
        <line x1={leftBlockX + blockWidth/2} y1="0" x2={leftBlockX + blockWidth/2} y2={height} stroke="#666" strokeWidth={2} markerEnd="url(#arrowhead)" />

        {/* Connection from left block to Attention */}
        <line x1={leftBlockX + blockWidth/2} y1={attentionY - blockHeight} x2={rightBlockX + blockWidth/2} y2={attentionY - blockHeight} stroke="#666" strokeWidth={2}/>
        <line x1={rightBlockX + blockWidth/2} y1={attentionY - blockHeight} x2={rightBlockX + blockWidth/2} y2={firstAddNormY + blockHeight/2} stroke="#666" strokeWidth={2} />

        {/* Att to add norm */}
        <line x1={rightBlockX + blockWidth/2} y1={attentionY + blockHeight} x2={rightBlockX + blockWidth/2} y2={firstAddNormY + blockHeight/2} stroke="#666" strokeWidth={2} />
        <line x1={rightBlockX + blockWidth/2} y1={firstAddNormY + blockHeight/2} x2={leftBlockX + blockWidth} y2={firstAddNormY + blockHeight/2} stroke="#666" strokeWidth={2} markerEnd="url(#arrowhead)"/>
        
        {/* Connection from left line to ff */}
        <line x1={leftBlockX + blockWidth/2} y1={feedforwardY - blockHeight} x2={rightBlockX + blockWidth/2} y2={feedforwardY - blockHeight} stroke="#666" strokeWidth={2}/>
        <line x1={rightBlockX + blockWidth/2} y1={feedforwardY - blockHeight} x2={rightBlockX + blockWidth/2} y2={feedforwardY} stroke="#666" strokeWidth={2}/>

        {/* Connection from ff to addnorm2*/}
        <line x1={rightBlockX + blockWidth/2} y1={feedforwardY + blockHeight} x2={rightBlockX + blockWidth/2} y2={secondAddNormY + blockHeight/2} stroke="#666" strokeWidth={2} />
        <line x1={rightBlockX + blockWidth/2} y1={secondAddNormY + blockHeight/2} x2={leftBlockX + blockWidth} y2={secondAddNormY + blockHeight/2} stroke="#666" strokeWidth={2} markerEnd="url(#arrowhead)" />


        {/* Interactive Add & Norm (first) */}
        <g style={{ cursor: "pointer" }} onClick={() => onSelect("addnorm") }>
          <rect x={leftBlockX} y={firstAddNormY} width={blockWidth} height={blockHeight} rx={blockRadius} 
            fill={selected === "addnorm" ? selectedFill : defaultFill}
            stroke={selected === "addnorm" ? selectedStroke : defaultStroke}
            strokeWidth={selected === "addnorm" ? selectedStrokeWidth : strokeWidth}
          />
          <text x={leftBlockX + blockWidth/2} y={firstAddNormY + blockHeight/2 + 5} textAnchor="middle" fontSize={fontSize} fontWeight={fontWeight} fill={selected === "addnorm" ? selectedTextColor : textColor}>Add & Norm</text>
        </g>
        {/* Interactive Add & Norm (second) */}
        <g style={{ cursor: "pointer" }} onClick={() => onSelect("addnorm2") }>
          <rect x={leftBlockX + 3} y={secondAddNormY} width={blockWidth} height={blockHeight} rx={blockRadius} 
            fill={selected === "addnorm2" ? selectedFill : defaultFill}
            stroke={selected === "addnorm2" ? selectedStroke : defaultStroke}
            strokeWidth={selected === "addnorm2" ? selectedStrokeWidth : strokeWidth}
          />
          <text x={leftBlockX + 3 + blockWidth/2} y={secondAddNormY + blockHeight/2 + 5} textAnchor="middle" fontSize={fontSize} fontWeight={fontWeight} fill={selected === "addnorm2" ? selectedTextColor : textColor}>Add & Norm</text>
        </g>
        {/* Interactive Multi-Head Attention */}
        <g style={{ cursor: "pointer" }} onClick={() => onSelect("attention") }>
          <rect x={rightBlockX} y={attentionY} width={blockWidth} height={blockHeight} rx={blockRadius}
            fill={selected === "attention" ? selectedFill : defaultFill}
            stroke={selected === "attention" ? selectedStroke : defaultStroke}
            strokeWidth={selected === "attention" ? selectedStrokeWidth : strokeWidth}
          />
          <text x={rightBlockX + blockWidth/2} y={attentionY + blockHeight/2 - 4} textAnchor="middle" fontSize={fontSize} fontWeight={fontWeight} fill={selected === "attention" ? selectedTextColor : textColor}>Multi-Head</text>
          <text x={rightBlockX + blockWidth/2} y={attentionY + blockHeight/2 + 12} textAnchor="middle" fontSize={fontSize} fontWeight={fontWeight} fill={selected === "attention" ? selectedTextColor : textColor}>Attention</text>
        </g>
        {/* Interactive Feed-Forward */}
        <g style={{ cursor: "pointer" }} onClick={() => onSelect("feedforward") }>
          <rect x={rightBlockX} y={feedforwardY} width={blockWidth} height={blockHeight} rx={blockRadius}
            fill={selected === "feedforward" ? selectedFill : defaultFill}
            stroke={selected === "feedforward" ? selectedStroke : defaultStroke}
            strokeWidth={selected === "feedforward" ? selectedStrokeWidth : strokeWidth}
          />
          <text x={rightBlockX + blockWidth/2} y={feedforwardY + blockHeight/2 + 5} textAnchor="middle" fontSize={fontSize} fontWeight={fontWeight} fill={selected === "feedforward" ? selectedTextColor : textColor}>Feed-Forward</text>
        </g>

      </svg>
    </div>
  );
} 