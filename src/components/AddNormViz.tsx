import React from "react";
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface AddNormVizProps {
  selectedTokenIndex?: number;
}

export default function AddNormViz({ selectedTokenIndex = 0 }: AddNormVizProps) {
  const width = 800;
  const height = 400;
  const boxWidth = 200;
  const boxHeight = 60;
  const headBoxWidth = 80;
  const headBoxHeight = 40;
  
  // Positions
  const inputX = 0;
  const inputY = 20;
  const headsStartX = 220;
  const headsY = 120;
  const residualX = inputX;
  const residualY = 220;
  const normX = inputX;
  const normY = 330;

  return (
    <div style={{ width, height, margin: "0 auto", position: "relative" }}>
      <svg width={width} height={height}>
        {/* Define arrow marker */}
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="4" 
            refX="5" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="#666" />
          </marker>
        </defs>
        {/* Input Box */}
        <rect 
          x={inputX} y={inputY} width={boxWidth} height={boxHeight} rx={8}
          fill="#f5f5f5" stroke="#ccc" strokeWidth={2}
        />
        <text x={inputX + boxWidth/2} y={inputY + 20} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#666">
          Eingabe (Residual)
        </text>
        <foreignObject x={inputX + 10} y={inputY + 30} width={boxWidth - 20} height={30}>
          <div style={{ fontSize: '16px', textAlign: 'center', fontFamily: 'serif' }}>
            <InlineMath math="x_{in}" />
          </div>
        </foreignObject>

        {/* Attention Heads */}
        <rect 
          x={headsStartX} y={headsY} width={headBoxWidth} height={headBoxHeight} rx={6}
          fill="#e3f2fd" stroke="#1976d2" strokeWidth={2}
        />
        <text x={headsStartX + headBoxWidth/2} y={headsY + 15} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#1976d2">
          Attention-Head
        </text>
        <foreignObject x={headsStartX + 10} y={headsY + 20} width={headBoxWidth - 20} height={20}>
          <div style={{ fontSize: '12px', textAlign: 'center', fontFamily: 'serif' }}>
            <InlineMath math="h_0" />
          </div>
        </foreignObject>

        <rect 
          x={headsStartX + headBoxWidth + 20} y={headsY} width={headBoxWidth} height={headBoxHeight} rx={6}
          fill="#e3f2fd" stroke="#1976d2" strokeWidth={2}
        />
        <text x={headsStartX + headBoxWidth + 20 + headBoxWidth/2} y={headsY + 15} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#1976d2">
          Attention-Head
        </text>
        <foreignObject x={headsStartX + headBoxWidth + 20 + 10} y={headsY + 20} width={headBoxWidth - 20} height={20}>
          <div style={{ fontSize: '12px', textAlign: 'center', fontFamily: 'serif' }}>
            <InlineMath math="h_1" />
          </div>
        </foreignObject>

        <rect 
          x={headsStartX + 2 * (headBoxWidth + 20)} y={headsY} width={headBoxWidth} height={headBoxHeight} rx={6}
          fill="#e3f2fd" stroke="#1976d2" strokeWidth={2}
        />
        <text x={headsStartX + 2 * (headBoxWidth + 20) + headBoxWidth/2} y={headsY + 15} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#1976d2">
          Attention-Head
        </text>
        <text x={headsStartX + 2 * (headBoxWidth + 20) + headBoxWidth/2} y={headsY + 30} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#1976d2">
          ...
        </text>

        {/* Residual + New Information Box */}
        <rect 
          x={residualX} y={residualY} width={boxWidth} height={boxHeight} rx={8}
          fill="#f5f5f5" stroke="#ccc" strokeWidth={2}
        />
        <text x={residualX + boxWidth/2} y={residualY + 15} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#666">
          Residual + neue Information
        </text>
        <foreignObject x={residualX + 10} y={residualY + 25} width={boxWidth - 20} height={30}>
          <div style={{ fontSize: '12px', textAlign: 'center', fontFamily: 'serif' }}>
            <InlineMath math="x_{add} = x_{in} + \sum_{h \in H_i} h(x_{in})" />
          </div>
        </foreignObject>

        {/* Scaling & Centering Box */}
        <rect 
          x={normX} y={normY} width={boxWidth} height={boxHeight} rx={8}
          fill="#f5f5f5" stroke="#ccc" strokeWidth={2}
        />
        <text x={normX + boxWidth/2} y={normY + 15} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#666">
          Skalierung & Zentrierung
        </text>
        <foreignObject x={normX + 10} y={normY + 25} width={boxWidth - 20} height={30}>
          <div style={{ fontSize: '12px', textAlign: 'center', fontFamily: 'serif' }}>
            <InlineMath math="x_{out} = \text{LayerNorm}(x_{add})" />
          </div>
        </foreignObject>

        {/* Connections */}
        {/* Input to Attention Heads */}
        <line x1={inputX + boxWidth} y1={inputY + boxHeight/2} x2={headsStartX + 2 * (headBoxWidth + 20) + headBoxWidth/2} y2={inputY + boxHeight/2} stroke="#666" strokeWidth={2}/>
        
        <line x1={headsStartX + headBoxWidth/2} y1={inputY + boxHeight/2} x2={headsStartX + headBoxWidth/2} y2={headsY} stroke="#666" strokeWidth={2} markerEnd="url(#arrowhead)" />
        <line x1={headsStartX + (headBoxWidth + 20) + headBoxWidth/2} y1={inputY + boxHeight/2} x2={headsStartX + (headBoxWidth + 20) + headBoxWidth/2} y2={headsY} stroke="#666" strokeWidth={2} markerEnd="url(#arrowhead)" />
        <line x1={headsStartX + 2*(headBoxWidth + 20) + headBoxWidth/2} y1={inputY + boxHeight/2} x2={headsStartX + 2*(headBoxWidth + 20) + headBoxWidth/2} y2={headsY} stroke="#666" strokeWidth={2} markerEnd="url(#arrowhead)" />
        
        {/* Input to Residual */}
        <line x1={inputX + boxWidth/2} y1={inputY + boxHeight} x2={residualX + boxWidth/2} y2={residualY} stroke="#666" strokeWidth={2} markerEnd="url(#arrowhead)" />

        {/* Attention Heads to Residual */}
        <line x1={headsStartX + 2 * (headBoxWidth + 20) + headBoxWidth/2} y1={residualY + boxHeight/2} x2={inputX + boxWidth} y2={residualY + boxHeight/2} stroke="#666" strokeWidth={2} markerEnd="url(#arrowhead)" />

        <line x1={headsStartX + headBoxWidth/2} y1={headsY + headBoxHeight} x2={headsStartX + headBoxWidth/2} y2={residualY + boxHeight/2} stroke="#666" strokeWidth={2} />
        <line x1={headsStartX + headBoxWidth + 20 + headBoxWidth/2} y1={headsY + headBoxHeight} x2={headsStartX + headBoxWidth + 20 + headBoxWidth/2} y2={residualY + boxHeight/2} stroke="#666" strokeWidth={2}/>
        <line x1={headsStartX + 2 * (headBoxWidth + 20) + headBoxWidth/2} y1={headsY + headBoxHeight} x2={headsStartX + 2 * (headBoxWidth + 20) + headBoxWidth/2} y2={residualY + boxHeight/2} stroke="#666" strokeWidth={2}/>

        {/* Residual to Norm */}
        <line x1={residualX + boxWidth/2} y1={residualY + boxHeight} x2={normX + boxWidth/2} y2={normY} stroke="#666" strokeWidth={2} markerEnd="url(#arrowhead)" />

      </svg>
    </div>
  );
} 