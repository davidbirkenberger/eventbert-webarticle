import React from "react";

interface TransformerBlockChartProps {
  selected: "attention" | "feedforward";
  onSelect: (block: "attention" | "feedforward") => void;
}

export default function TransformerBlockChart({ selected, onSelect }: TransformerBlockChartProps) {
  return (
    <svg width={112} height={253} viewBox="0 0 112 253" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main block outline and lines */}
      <rect x="0.5" y="19.5" width="111" height="187" rx="4.5" stroke="#B8B8B8" strokeDasharray="2 2" />
      <path d="M27 0V41V92.5" stroke="black" />
      <path d="M86.5 79.5V101.5H47.5M28.5 113.5V128.5M28.5 180.5V128.5M28.5 128.5H86.5V142.5M86.5 161.5V189H51M28.5 33.5H86.5V57" stroke="black" />
      <path d="M28.5 200.5V252.5" stroke="black" />
      {/* Add & Norm rectangles and labels */}
      <rect x="7.5" y="92.5" width="39" height="20" rx="3.5" stroke="#8E8E8E" fill="#fff" />
      <text x={27} y={105} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#888">Add & Norm</text>
      <rect x="10.5" y="180.5" width="39" height="20" rx="3.5" stroke="#8E8E8E" fill="#fff" />
      <text x={30} y={193} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#888">Add & Norm</text>
      {/* Interactive Multi-Head Attention */}
      <g style={{ cursor: "pointer" }} onClick={() => onSelect("attention") }>
        <rect x={65.5} y={58.5} width={39} height={20} rx={3.5}
          fill={selected === "attention" ? "#e3edff" : "#fff"}
          stroke={selected === "attention" ? "#1e64ff" : "#8E8E8E"}
          strokeWidth={selected === "attention" ? 2 : 1}
        />
        <text x={65.5 + 19.5} y={58.5 + 12} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#444">Multi-Head</text>
        <text x={65.5 + 19.5} y={58.5 + 19} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#444">Attention</text>
      </g>
      {/* Interactive Feed-Forward */}
      <g style={{ cursor: "pointer" }} onClick={() => onSelect("feedforward") }>
        <rect x={65.5} y={142.5} width={39} height={20} rx={3.5}
          fill={selected === "feedforward" ? "#e3edff" : "#fff"}
          stroke={selected === "feedforward" ? "#1e64ff" : "#8E8E8E"}
          strokeWidth={selected === "feedforward" ? 2 : 1}
        />
        <text x={65.5 + 19.5} y={142.5 + 14} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#444">Feed-Forward</text>
      </g>
      {/* 1 von 12 */}
      <text x={56} y={245} textAnchor="middle" fontSize={12} fill="#aaa">1 von 12</text>
    </svg>
  );
} 