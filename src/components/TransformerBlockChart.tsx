import React from "react";

interface TransformerBlockChartProps {
  selected: "attention" | "feedforward" | "addnorm" | "addnorm2";
  onSelect: (block: "attention" | "feedforward" | "addnorm" | "addnorm2") => void;
}

export default function TransformerBlockChart({ selected, onSelect }: TransformerBlockChartProps) {
  // Layout variables for easy customization
  const width = 300;
  const height = 450;
  const blockWidth = 120;
  const blockHeight = 40;
  const blockRadius = 3.5;
  const strokeWidth = 1;
  const selectedStrokeWidth = 2;
  
  // Positions
  const leftBlockX = 10;
  const rightBlockX = 150;

  const attentionY = 80;
  const firstAddNormY = 150;
  const feedforwardY = 280;
  const secondAddNormY = 350;
  
  // Colors
  const defaultFill = "#fff";
  const selectedFill = "#e3edff";
  const defaultStroke = "#8E8E8E";
  const selectedStroke = "#1e64ff";
  const textColor = "#888";
  const selectedTextColor = "#444";
  
  // Font sizes
  const fontSize = 12;
  const fontWeight = "bold";
  
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main block outline and lines */}
      <rect x="0.5" y="19.5" width={width - 1} height={height - 40} rx="4.5" stroke="#B8B8B8" strokeWidth="2" strokeDasharray="4 4" />
      
      {/* Main vertical line */}
      <line x1={leftBlockX + blockWidth/2} y1="0" x2={leftBlockX + blockWidth/2} y2={height} stroke="black" strokeWidth={2} markerEnd="url(#arrowhead)" />

      {/* Connection from left block to Attention */}
      <line x1={leftBlockX + blockWidth/2} y1={attentionY - blockHeight} x2={rightBlockX + blockWidth/2} y2={attentionY - blockHeight} stroke="black" strokeWidth={2} />
      <line x1={rightBlockX + blockWidth/2} y1={attentionY - blockHeight} x2={rightBlockX + blockWidth/2} y2={firstAddNormY + blockHeight/2} stroke="black" strokeWidth={2} />


      {/* Att to add norm */}
      <line x1={rightBlockX + blockWidth/2} y1={attentionY + blockHeight} x2={rightBlockX + blockWidth/2} y2={firstAddNormY + blockHeight/2} stroke="black" strokeWidth={2} />
      <line x1={rightBlockX + blockWidth/2} y1={firstAddNormY + blockHeight/2} x2={leftBlockX + blockWidth} y2={firstAddNormY + blockHeight/2} stroke="black" strokeWidth={2} markerEnd="url(#arrowhead)"/>
      
      {/* Connection from left line to ff */}
      <line x1={leftBlockX + blockWidth/2} y1={feedforwardY - blockHeight} x2={rightBlockX + blockWidth/2} y2={feedforwardY - blockHeight} stroke="black" strokeWidth={2} />
      <line x1={rightBlockX + blockWidth/2} y1={feedforwardY - blockHeight} x2={rightBlockX + blockWidth/2} y2={feedforwardY} stroke="black" strokeWidth={2}/>


      {/* Connection from ff  to addnorm2*/}
      <line x1={rightBlockX + blockWidth/2} y1={secondAddNormY + blockHeight/2} x2={leftBlockX + blockWidth} y2={secondAddNormY + blockHeight/2} stroke="black" strokeWidth={2} markerEnd="url(#arrowhead)" />
      <line x1={rightBlockX + blockWidth/2} y1={feedforwardY + blockHeight/2} x2={rightBlockX + blockWidth/2} y2={secondAddNormY + blockHeight/2} stroke="black" strokeWidth={2}/>
      



      {/* Interactive Add & Norm (first) */}
      <g style={{ cursor: "pointer" }} onClick={() => onSelect("addnorm") }>
        <rect x={leftBlockX} y={firstAddNormY} width={blockWidth} height={blockHeight} rx={blockRadius} 
          fill={selected === "addnorm" ? selectedFill : defaultFill}
          stroke={selected === "addnorm" ? selectedStroke : defaultStroke}
          strokeWidth={selected === "addnorm" ? selectedStrokeWidth : strokeWidth}
        />
        <text x={leftBlockX + blockWidth/2} y={firstAddNormY + blockHeight/2 + 5} textAnchor="middle" fontSize={fontSize} fontWeight={fontWeight} fill={textColor}>Add & Norm</text>
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
        <text x={rightBlockX + blockWidth/2} y={attentionY + blockHeight/2 - 5} textAnchor="middle" fontSize={fontSize} fontWeight={fontWeight} fill={selectedTextColor}>Multi-Head</text>
        <text x={rightBlockX + blockWidth/2} y={attentionY + blockHeight/2 + 5} textAnchor="middle" fontSize={fontSize} fontWeight={fontWeight} fill={selectedTextColor}>Attention</text>
      </g>
      {/* Interactive Feed-Forward */}
      <g style={{ cursor: "pointer" }} onClick={() => onSelect("feedforward") }>
        <rect x={rightBlockX} y={feedforwardY} width={blockWidth} height={blockHeight} rx={blockRadius}
          fill={selected === "feedforward" ? selectedFill : defaultFill}
          stroke={selected === "feedforward" ? selectedStroke : defaultStroke}
          strokeWidth={selected === "feedforward" ? selectedStrokeWidth : strokeWidth}
        />
        <text x={rightBlockX + blockWidth/2} y={feedforwardY + blockHeight/2 + 5} textAnchor="middle" fontSize={fontSize} fontWeight={fontWeight} fill={selectedTextColor}>Feed-Forward</text>
      </g>

    </svg>
  );
} 