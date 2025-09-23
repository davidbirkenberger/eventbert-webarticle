import React, { useState } from "react";
import TransformerBlockChart from "./TransformerBlockChart";
import AttentionMatrixViz from "./AttentionMatrixViz";
import FeedForwardViz from "./FeedForwardViz";
import AddNormViz from "./AddNormViz";
import AddNormViz2 from "./AddNormViz2";

// Compact token selector dropdown
const TokenSelectorDropdown: React.FC<{ 
  tokens: string[]; 
  selectedIndex: number; 
  onSelect: (index: number) => void; 
}> = ({ tokens, selectedIndex, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative mb-4">
      {/* Token Dropdown */}
      <div className="relative inline-block">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-600 cursor-pointer text-sm font-mono min-w-[120px] flex items-center justify-between shadow-sm hover:bg-gray-50 transition-colors"
        >
          <span>{tokens[selectedIndex] || "[CLS]"}</span>
          <span className="text-xs ml-2">
            {isOpen ? "▲" : "▼"}
          </span>
        </button>
        
        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
            {tokens.map((token, i) => (
              <button
                key={i}
                onClick={() => {
                  onSelect(i);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 border-none text-left text-sm font-mono border-b border-gray-100 transition-colors ${
                  i === selectedIndex 
                    ? "bg-blue-50 text-blue-700" 
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {token}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Visual Arrow entfernt */}
    </div>
  );
};

// Head selector component for attention visualization
const HeadSelector: React.FC<{ 
  selectedIndex: number; 
  onSelect: (index: number) => void; 
}> = ({ selectedIndex, onSelect }) => {
  const headCount = 12; // Assuming 12 heads based on typical BERT architecture
  
  return (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      marginBottom: 16,
      gap: 8 
    }}>
      <span style={{ fontSize: 16, color: "#666", marginRight: 8 }}>Head:</span>
      <div style={{ 
        display: "flex", 
        gap: 4, 
        alignItems: "center",
        flexWrap: "wrap"
      }}>
        {Array.from({ length: headCount }, (_, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            style={{
              padding: "4px 8px",
              border: "1px solid #dee2e6",
              borderRadius: 4,
              background: i === selectedIndex ? "#e3edff" : "#f0f0f0",
              color: i === selectedIndex ? "#1e64ff" : "#666",
              fontWeight: i === selectedIndex ? "bold" : "normal",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "monospace",
            }}
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  );
};

// Info text component for each block type
const BlockInfoText: React.FC<{ blockType: string }> = ({ blockType }) => {
  const infoTexts = {
    attention: "<b>Multi-Head Attention</b> ist der Mechanismus, mit dem BERT Kontext versteht. Jedes Token bildet seine Repräsentation, indem es eine gewichtete Kombination aller anderen Tokens betrachtet. So kann es nicht nur direkte Nachbarn berücksichtigen, sondern den gesamten Satz einbeziehen.<br/><br/>Das Diagramm visualisiert diese Gewichtungen als Verbindungslinien zwischen Tokens. Die Stärke der Linie zeigt, wie stark ein Token die Information eines anderen berücksichtigt. Auf diese Weise lässt sich erkennen, welche Wörter das Modell in Beziehung setzt und wo es den Fokus legt.<br/><br/>Statt nur eine einzige Gewichtung zu verwenden, berechnet BERT mehrere Attention-Heads parallel. Jeder Head kann unterschiedliche Muster hervorheben. Zusammen entsteht so ein differenziertes Bild der Beziehungen zwischen Wörtern.",
    feedforward: "Nachdem die Tokens durch die Attention Kontextinformationen aufgenommen haben, werden sie einzeln weiterverarbeitet. Das geschieht im <b>Feed-Forward Network</b>, das aus zwei linearen Transformationen und einer nichtlinearen Aktivierung (GELU) besteht.<br/><br/>• <b>Linear1:</b> Erweitert die Dimension der Token-Repräsentation<br/>• <b>GELU:</b> Fügt Nichtlinearität hinzu und ermöglicht komplexere Muster<br/>• <b>Linear2:</b> Projiziert die Werte wieder zurück auf die ursprüngliche Dimension<br/><br/>Jedes Token wird dabei unabhängig von den anderen verarbeitet. Der Effekt: Die zuvor durch Attention angereicherten Informationen können nun in einer flexibleren Form dargestellt werden. So gewinnt das Modell zusätzliche Ausdruckskraft, bevor der nächste Add-&-Norm-Schritt folgt.",
    addnorm: "Nach der Attention folgt ein <b>Add & Norm</b>-Schritt, der die Verarbeitung stabilisiert. Die ursprüngliche Eingabe wird mit der neuen Information aus der Attention addiert (Residual Connection). So bleibt der Ausgangszustand erhalten, während zusätzliche Kontextinformationen ergänzt werden.<br/><br/>Anschließend wird das Ergebnis normalisiert. Dieser Schritt sorgt dafür, dass die Werte in einem stabilen Bereich bleiben und sich kleine Unterschiede zwischen den Tokens nicht unkontrolliert verstärken.<br/><br/>Auf diese Weise kann das Modell zuverlässig Schicht für Schicht neue Informationen hinzufügen, ohne dass frühere Repräsentationen verloren gehen.",
    addnorm2: "Nach dem Feed-Forward Network folgt ein weiterer <b>Add & Norm</b>-Schritt. Hier wird die ursprüngliche Attention-Ausgabe mit der Feed-Forward-Transformation kombiniert.<br/><br/>Diese zweite Residual Connection stellt sicher, dass die Informationen aus der Attention nicht verloren gehen, während die Feed-Forward-Verarbeitung neue Muster hinzufügt. Die Normalisierung sorgt erneut für stabile Werte, bevor der nächste Transformer-Block folgt."
  };

  return (
    <div 
      className="text-sm text-gray-600 leading-relaxed mb-2 p-4 bg-gray-50 rounded-lg border border-gray-200"
      dangerouslySetInnerHTML={{ __html: infoTexts[blockType as keyof typeof infoTexts] || "" }}
    />
  );
};

interface TransformerBlockWrapperProps {
  attentionTokens: string[];
  attentionMatrix: number[][];
  selectedTokenIndex?: number;
  selectedLayerIndex?: number;
  selectedHeadIndex?: number;
  onHeadSelect?: (index: number) => void;
  onTokenSelect?: (index: number) => void;
  onLayerChange: (layer: number) => void;
}

export default function TransformerBlockWrapper({ 
  attentionTokens, 
  attentionMatrix, 
  selectedTokenIndex = 0,
  selectedLayerIndex = 0,
  selectedHeadIndex = 0,
  onHeadSelect,
  onTokenSelect,
  onLayerChange
}: TransformerBlockWrapperProps) {
  const [selectedBlock, setSelectedBlock] = useState<"attention" | "feedforward" | "addnorm" | "addnorm2">("attention");

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Hauptbereich: Block-Diagramm + Visualisierung */}
      <div className="flex items-start gap-8 flex-wrap">
        {/* Linke Spalte: Transformer Block Diagram */}
        <div className="flex-none min-w-[280px]">
          {/* Transformer Block Chart */}
          <TransformerBlockChart 
            selected={selectedBlock} 
            onSelect={setSelectedBlock}
            currentLayer={selectedLayerIndex}
            onLayerChange={onLayerChange}
          />
        </div>

        {/* Rechte Spalte: Detaillierte Visualisierung */}
        <div className="flex-1 min-w-[400px] w-full">
          {selectedBlock === "attention" ? (
            <div className="border border-gray-300 rounded-xl bg-white shadow-sm p-6 relative w-full">
              <div className="text-xs text-gray-400 absolute -top-2 left-3 bg-white px-2">
                Multi-Head Attention
              </div>
              
              <HeadSelector selectedIndex={selectedHeadIndex} onSelect={onHeadSelect || (() => {})} />
              <AttentionMatrixViz tokens={attentionTokens} attention={attentionMatrix} selectedTokenIndex={selectedTokenIndex} />
            </div>
          ) : selectedBlock === "feedforward" ? (
            <div className="border border-gray-300 rounded-xl bg-white shadow-sm p-6 relative w-full">
              <div className="text-xs text-gray-400 absolute -top-2 left-3 bg-white px-2">
                Feed-Forward Network
              </div>
              
              {/* Token selector only for feedforward block */}
              <div className="flex flex-col items-center mb-6">
                <div className="text-sm text-gray-600 mb-2 font-medium">
                  Token auswählen:
                </div>
                <TokenSelectorDropdown 
                  tokens={attentionTokens}
                  selectedIndex={selectedTokenIndex}
                  onSelect={onTokenSelect || (() => {})}
                />
              </div>
              
              <FeedForwardViz selectedTokenIndex={selectedTokenIndex} selectedLayerIndex={selectedLayerIndex} />
            </div>
          ) : selectedBlock === "addnorm2" ? (
            <div className="border border-gray-300 rounded-xl bg-white shadow-sm p-6 relative w-full">
              <div className="text-xs text-gray-400 absolute -top-2 left-3 bg-white px-2">
                Add & Norm (MLP)
              </div>
              
              <AddNormViz2 selectedTokenIndex={selectedTokenIndex} />
            </div>
          ) : (
            <div className="border border-gray-300 rounded-xl bg-white shadow-sm p-6 relative w-full">
              <div className="text-xs text-gray-400 absolute -top-2 left-3 bg-white px-2">
                Add & Norm
              </div>
              
              <AddNormViz selectedTokenIndex={selectedTokenIndex} />
            </div>
          )}
        </div>
      </div>

      {/* Neuer Info-Text-Kasten unterhalb der beiden Container */}
      <BlockInfoText blockType={selectedBlock} />
    </div>
  );
} 