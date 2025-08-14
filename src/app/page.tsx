"use client";
import React, { useEffect, useState } from "react";
import { useClsConnectionsData } from "@/hooks/useClsConnectionsData";
import ClsToOutputViz from "../components/ClsToOutputViz";
import SpecializedHeadViz from "../components/SpecializedHeadViz";
import TokenEmbeddingsPanel from "../components/TokenEmbeddingsPanel";
import AttentionMatrixViz from "../components/AttentionMatrixViz";
import EmbeddingSpaceMap from "../components/EmbeddingSpaceMap";
import TransformerBlockWrapper from "../components/TransformerBlockWrapper";

// Helper component for the raw text card
const RawTextCard: React.FC = () => {
  const [text, setText] = useState<string>("");

  useEffect(() => {
    fetch("/token_embeddings_raw.json")
      .then((res) => res.json())
      .then((data) => {
        if (data.text) setText(data.text);
        else setText("Wir sind das Kompetenzteam für beeindruckende Veranstaltungen im historischen Getreidespeicher im Osthafen. In unseren liebevoll ausgestatteten Eventlocations treffen im Spreespeicher moderne Design-Elemente auf alten Industrie-Charme.");
      })
      .catch(() => setText("Wir sind das Kompetenzteam für beeindruckende Veranstaltungen im historischen Getreidespeicher im Osthafen. In unseren liebevoll ausgestatteten Eventlocations treffen im Spreespeicher moderne Design-Elemente auf alten Industrie-Charme."));
  }, []);

  return (
    <div style={{
      border: "1px solid #eee",
      borderRadius: 6,
      background: "#fafafa",
      boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
      padding: 32,
      minWidth: 600,
      maxWidth: 800,
      flex: 1,
      display: "flex",
      flexDirection: "column",
      minHeight: 220,
      justifyContent: "space-between",
    }}>
      <div style={{ fontSize: 28, color: "#222", lineHeight: 1.6, fontWeight: "bold" }}>{text}</div>
      <div style={{
        borderTop: "1px solid #eee",
        padding: "8px 0 0 0",
        display: "flex",
        gap: 16,
        color: "#888",
        fontSize: 22,
        alignItems: "center",
        marginTop: 16,
      }}>
        <span style={{ cursor: "pointer" }}>&larr;</span>
        <span style={{ cursor: "pointer" }}>&rarr;</span>
      </div>
    </div>
  );
};

// Helper for rotated section titles
const RotatedSectionTitle: React.FC<{ label: string }> = ({ label }) => (
  <div
    style={{
      writingMode: "vertical-rl",
      textOrientation: "mixed",
      fontWeight: "bold",
      fontSize: 24,
      color: "#555",
      marginRight: 16,
      display: "flex",
      alignItems: "center",
      letterSpacing: 1,
      minWidth: 32,
    }}
  >
    {label}
  </div>
);

// Tokenized sentence component with same styling as TokenEmbeddingsPanel
const TokenizedSentence: React.FC = () => {
  const [tokens, setTokens] = useState<string[]>([]);

  useEffect(() => {
    fetch("/token_embeddings_raw.json")
      .then((res) => res.json())
      .then((data) => {
        if (data.tokens) {
          setTokens(data.tokens);
        }
      })
      .catch(() => {
        // Fallback tokens if fetch fails
        setTokens(["[CLS]", "mit", "unseren", "sna", "##cks", "bieten", "wir", "das", "beste", "cater", "##ing", ".", "[SEP]"]);
      });
  }, []);

  return (
    <div style={{ fontFamily: "monospace", fontSize: 22 }}>
      <div style={{ marginBottom: "1em" }}>
        {tokens.map((token, i) => (
          <span
            key={i}
            style={{
              marginRight: 12,
              fontWeight: token === "[CLS]" ? "bold" : "normal",
              fontSize: token === "[CLS]" ? 36 : 18,
              opacity: token === "[CLS]" ? 1 : 0.4,
            }}
          >
            {token}
          </span>
        ))}
      </div>
    </div>
  );
};

// Layer selector component for transformer block
const LayerSelector: React.FC<{ 
  selectedIndex: number; 
  onSelect: (index: number) => void; 
}> = ({ selectedIndex, onSelect }) => {
  const layerCount = 12; // Assuming 12 layers based on typical BERT architecture
  
  return (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      marginBottom: 16,
      gap: 8 
    }}>
      <span style={{ fontSize: 16, color: "#666", marginRight: 8 }}>Layer:</span>
      <div style={{ 
        display: "flex", 
        gap: 4, 
        alignItems: "center",
        flexWrap: "wrap"
      }}>
        {Array.from({ length: layerCount }, (_, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            style={{
              padding: "4px 8px",
              border: "1px solid #ddd",
              borderRadius: 4,
              background: i === selectedIndex ? "#e3f2fd" : "#fff",
              color: i === selectedIndex ? "#1976d2" : "#666",
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
              border: "1px solid #ddd",
              borderRadius: 4,
              background: i === selectedIndex ? "#e3f2fd" : "#fff",
              color: i === selectedIndex ? "#1976d2" : "#666",
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

// Token selector component for transformer block
const TokenSelector: React.FC<{ 
  tokens: string[]; 
  selectedIndex: number; 
  onSelect: (index: number) => void; 
}> = ({ tokens, selectedIndex, onSelect }) => {
  return (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      marginBottom: 24,
      gap: 8 
    }}>
      <button 
        onClick={() => onSelect((selectedIndex - 1 + tokens.length) % tokens.length)}
        style={{ 
          fontSize: 22, 
          border: "none", 
          background: "none", 
          cursor: "pointer", 
          color: "#888",
          padding: "8px 12px",
          borderRadius: 4
        }}
      >
        &larr;
      </button>
      <div style={{ 
        display: "flex", 
        gap: 8, 
        alignItems: "center",
        fontFamily: "monospace",
        fontSize: 18
      }}>
        {tokens.map((token, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            style={{
              padding: "6px 12px",
              border: "1px solid #ddd",
              borderRadius: 4,
              background: i === selectedIndex ? "#e3f2fd" : "#fff",
              color: i === selectedIndex ? "#1976d2" : "#666",
              fontWeight: i === selectedIndex ? "bold" : "normal",
              cursor: "pointer",
              fontSize: 14,
              fontFamily: "monospace",
            }}
          >
            {token}
          </button>
        ))}
      </div>
      <button 
        onClick={() => onSelect((selectedIndex + 1) % tokens.length)}
        style={{ 
          fontSize: 22, 
          border: "none", 
          background: "none", 
          cursor: "pointer", 
          color: "#888",
          padding: "8px 12px",
          borderRadius: 4
        }}
      >
        &rarr;
      </button>
    </div>
  );
};

export default function Page() {
  // Fetch tokens and attention for the attention viz
  const [attentionData, setAttentionData] = useState<{ tokens: string[]; attention: number[][] } | null>(null);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number>(0);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0);
  const [selectedHeadIndex, setSelectedHeadIndex] = useState<number>(0);
  
  useEffect(() => {
    fetch("/token_embeddings_raw.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        if (data.tokens && data.attentions) {
          // Extract selected layer and head for visualization
          const matrix =
            Array.isArray(data.attentions) &&
            Array.isArray(data.attentions[selectedLayerIndex]) &&
            Array.isArray(data.attentions[selectedLayerIndex][selectedHeadIndex])
              ? data.attentions[selectedLayerIndex][selectedHeadIndex]
              : null;
          if (matrix) {
            setAttentionData({ tokens: data.tokens, attention: matrix });
          }
        }
      })
      .catch(() => {});
  }, [selectedLayerIndex, selectedHeadIndex]);

  // State for embedding 2D map
  const [embedding2d, setEmbedding2d] = useState<any[]>([]);
  const [hoveredToken, setHoveredToken] = useState<string | null>(null);

  // Fetch 2D embedding CSV
  useEffect(() => {
    fetch("/bert_vocab_embedding_2d.csv")
      .then((res) => res.text())
      .then((csv) => {
        const lines = csv.trim().split("\n");
        const header = lines[0].split(",");
        const data = lines.slice(1).map((line) => {
          const [token, x, y] = line.split(",");
          return { token, x: +x, y: +y };
        })
        .filter(d => Number.isFinite(d.x) && Number.isFinite(d.y));
        setEmbedding2d(data);
      });
  }, []);
  return (
    <main style={{ padding: '56px 80px', boxSizing: 'border-box', maxWidth: 1600, margin: '0 auto' }}>
      {/* Title and subtitle */}
      <div style={{ marginBottom: 64 }}>
        <h1 style={{ fontSize: 56, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>Ein Blick in die Blackbox:</h1>
        <div style={{ fontSize: 24, color: '#444', marginTop: 10, fontWeight: 400 }}>
        Wie BERT Website-Texte der Eventbranche versteht
        </div>
                  <div style={{ fontSize: 14, color: '#666', marginTop: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
            <span>Autor: David Birkenberger</span>
            <span>•</span>
            <span>Oktober 2025</span>
            <span>•</span>
            <a href="https://github.com/davidbirkenberger/mechinterp_article" style={{ color: '#666', textDecoration: 'none' }}>
              GitHub
            </a>
          </div>
          <div style={{ borderTop: "1px solid #eee", marginTop: 32, marginBottom: 32 }}></div>
          
        </div>
      {/* Outline and content layout */}
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {/* Outline sidebar */}
        <nav style={{ minWidth: 240, marginRight: 56, position: 'sticky', top: 56 }}>
          <div style={{ fontWeight: 700, fontSize: 24, marginBottom: 24, color: '#555' }}>Inhalt</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 18, color: '#444' }}>
            <li style={{ marginBottom: 16 }}><a href="#unternehmenstext" style={{ color: '#444', textDecoration: 'none' }}>Unternehmenstext</a></li>
            <li style={{ marginBottom: 16 }}><a href="#embeddings" style={{ color: '#444', textDecoration: 'none' }}>Embeddings</a></li>
            <li style={{ marginBottom: 16 }}><a href="#cls-token" style={{ color: '#444', textDecoration: 'none' }}>CLS-Token</a></li>
            <li style={{ marginBottom: 16 }}><a href="#transformer-block" style={{ color: '#444', textDecoration: 'none' }}>Transformer Block</a></li>
            <li style={{ marginBottom: 16 }}><a href="#specialized-components" style={{ color: '#444', textDecoration: 'none' }}>Specialized Components</a></li>
            <li style={{ marginBottom: 16 }}><a href="#klassifizierung" style={{ color: '#444', textDecoration: 'none' }}>Klassifizierung</a></li>
          </ul>
        </nav>
        {/* Main content */}
        <div style={{ flex: 1 }}>
          <p style={{ marginBottom: 32}}>In diesem Artikel schauen wir tief in die Black Box eines <a href="https://github.com/davidbirkenberger/bert-event-classifier" style={{ color: '#1e64ff', textDecoration: 'none' }}>feinabgestimmten deutschen BERT-Modells</a> – und folgen einem einzelnen Satz auf seinem Weg durch das neuronale Netz. Dabei beobachten wir, wie aus rohen Token Vektoren werden, wie sich Bedeutung im sogenannten CLS-Raum formt, und wie am Ende eine Multi-Label-Klassifikation zustande kommt.</p>
                      <section id="unternehmenstext">
              <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 160 }}>
                <RotatedSectionTitle label="Unternehmenstext" />
                <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                  <RawTextCard />
                </div>
              </div>
                        </section>
            <div style={{ height: 160 }} />
            <section id="embeddings">
            <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 160 }}>
              <RotatedSectionTitle label="Embeddings" />
              <div style={{ flex: 1 }}>
                <p>Der erste Schritt jeder BERT-Verarbeitung: Der Satz wird in Subword-Tokens zerlegt. Jedes Token erhält ein eigenes Embedding, das seine Bedeutung in einem hochdimensionalen Raum kodiert – angereichert mit Positionsinformationen.</p>
                <p>Im folgenden interaktiven Diagramm kannst du über die einzelnen Tokens hovern, um ihre eingebetteten Vektoren zu sehen – dargestellt im zweidimensionalen Raum der PCA-Projektion.</p>
                <div style={{ 
                  border: "1px solid #ddd", 
                  borderRadius: 8, 
                  background: "#fff",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                  padding: 24,
                  marginTop: 32
                }}>
                  <div style={{ fontSize: 12, color: "#999", marginBottom: 8 }}>Tokenized Satz</div>
                  <TokenEmbeddingsPanel
                    hoveredToken={hoveredToken}
                    onHover={setHoveredToken}
                  />
                  {/* Embedding space map */}
                  <div style={{ marginTop: 32 }}>
                    <div style={{ fontSize: 12, color: "#999", marginBottom: 8 }}>PCA-Projektion der Token-Embeddings</div>
                    <EmbeddingSpaceMap
                      data={embedding2d}
                      selectedToken={hoveredToken || undefined}
                      onHover={setHoveredToken}
                    />
                  </div>
                </div>
              </div>
            </div>
                      </section>
            <section id="cls-token">
            <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 160 }}>
              <RotatedSectionTitle label="CLS-Token" />
              <div style={{ flex: 1 }}>
                <p>Zusätzlich zu den Tokens des Satzes wird ein spezieller Token eingefügt: [CLS]. Er steht am Anfang der Sequenz und dient als zusammenfassende Repräsentation des gesamten Textes.</p>
                <div style={{ marginTop: 32 }}>
                  <TokenizedSentence />
                </div>
                <p style={{ marginTop: 32}}>Anfangs ist der CLS-Vektor nur eine zufällige Kombination von Werten – aber im Verlauf des Modells wird er mit Kontext angereichert und am Ende für die Klassifikation verwendet.</p>
              </div>
            </div>
          </section>
          {/* Transformer Block visualization as a top-level section */}
          <section id="transformer-block">
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 160 }}>
              <RotatedSectionTitle label="Transformer Block" />
              <div style={{ flex: 1 }}>
                <p>Der Text – inklusive [CLS] – wird nun durch mehrere identische Transformer-Blöcke geschickt. <br/> Jeder Block führt vier Schritte aus:</p>
                {attentionData ? (
                  <>
                    <div style={{ marginTop: 32, marginBottom: 32 }}>
                      <TokenSelector 
                        tokens={attentionData.tokens} 
                        selectedIndex={selectedTokenIndex} 
                        onSelect={setSelectedTokenIndex} 
                      />
                    </div>
                    <TransformerBlockWrapper 
                      attentionTokens={attentionData.tokens} 
                      attentionMatrix={attentionData.attention}
                      selectedTokenIndex={selectedTokenIndex}
                      selectedLayerIndex={selectedLayerIndex}
                      selectedHeadIndex={selectedHeadIndex}
                      onHeadSelect={setSelectedHeadIndex}
                    />
                    <div style={{ marginTop: 32, marginBottom: 16 }}>
                      <p>Dieser Block wiederholt sich mehrfach – bei BERT-base sind es insgesamt 12 Schichten. Mit jeder weiteren Ebene verändert sich der Informationsgehalt der Token-Repräsentationen, besonders im CLS-Vektor, immer weiter.</p>
                    </div>
                    <LayerSelector 
                      selectedIndex={selectedLayerIndex} 
                      onSelect={setSelectedLayerIndex} 
                    />
                  </>
                ) : (
                  <div>Lade Attention-Daten…</div>
                )}
              </div>
            </div>
          </section>
          <section id="specialized-components">
            <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 160 }}>
              <RotatedSectionTitle label="Specialized Components" />
              <div style={{ flex: 1 }}>
                <p>Aber warum braucht es so viele sich ähnelnde, wiederholte Komponenten?</p>
                <p>Sprachverstehen lässt sich als Zusammenspiel vieler Teilaufgaben denken: zum Beispiel zu erkennen, auf welches Nomen sich ein Adjektiv bezieht oder welche Entität mit einem Pronomen gemeint ist. Interessanterweise wurden in BERT bereits spezialisierte Komponenten gefunden, die genau solche Aufgaben übernehmen.</p>

                <SpecializedHeadViz 
                  headTitle="Nomen-Modifikator-Head"
                  description="Nomen-Modifikatoren (z.B. Artikel) richten ihre Aufmerksamkeit auf ihr Nomen"
                  examples={[
                    {
                      sentence: "The complicated language in the huge new law has muddied the fight.",
                      tokens: ["[CLS]", "The", "complicated", "language", "in", "the", "huge", "new", "law", "has", "muddied", "the", "fight", "[SEP]"],
                      attentionMatrix: [
                        [0.8, 0.05, 0.05, 0.05, 0.05, 0, 0, 0, 0, 0, 0, 0, 0, 0],  // CLS -> CLS
                        [0, 0.1, 0.05, 0.05, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1], // The -> distributed
                        [0, 0, 0.8, 0.05, 0.02, 0.02, 0.02, 0.02, 0.02, 0, 0, 0, 0, 0],  // complicated -> language
                        [0, 0, 0, 0.8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  // language -> language
                        [0, 0, 0, 0, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1], // in -> distributed
                        [0, 0, 0, 0, 0, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1], // the -> distributed
                        [0, 0, 0, 0, 0, 0, 0.1, 0.1, 0.8, 0, 0, 0, 0, 0],  // huge -> law
                        [0, 0, 0, 0, 0, 0, 0, 0.1, 0.8, 0, 0, 0, 0, 0],  // new -> law
                        [0, 0, 0, 0, 0, 0, 0, 0, 0.8, 0, 0, 0, 0, 0],  // law -> law
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0.1, 0.1, 0.1, 0.1, 0.1], // has -> distributed
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.1, 0.1, 0.8, 0],  // muddied -> fight
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.1, 0.1, 0.1], // the -> distributed
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.8, 0],  // fight -> fight
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.8]   // SEP -> SEP
                      ],
                      highlightedConnections: [
                        {from: 2, to: 3},   // "complicated" -> "language"
                        {from: 6, to: 8},   // "huge" -> "law"
                        {from: 7, to: 8},   // "new" -> "law"
                        {from: 10, to: 12}  // "muddied" -> "fight"
                      ]
                    },
                    {
                      sentence: "The 45-year-old former General Electric Co. executive figures it will be easier this time.",
                      tokens: ["[CLS]", "The", "45-year-old", "former", "General", "Electric", "Co.", "executive", "figures", "it", "will", "be", "easier", "this", "time", "[SEP]"],
                      attentionMatrix: [
                        [0.8, 0.05, 0.05, 0.05, 0.05, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  // CLS -> CLS
                        [0, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.8, 0, 0, 0, 0, 0, 0, 0, 0], // The -> executive
                        [0, 0, 0.1, 0.1, 0.1, 0.1, 0.1, 0.8, 0, 0, 0, 0, 0, 0, 0, 0],  // 45-year-old -> executive
                        [0, 0, 0, 0.1, 0.1, 0.1, 0.1, 0.8, 0, 0, 0, 0, 0, 0, 0, 0],  // former -> executive
                        [0, 0, 0, 0, 0.1, 0.1, 0.1, 0.8, 0, 0, 0, 0, 0, 0, 0, 0],  // General -> executive
                        [0, 0, 0, 0, 0, 0.1, 0.1, 0.8, 0, 0, 0, 0, 0, 0, 0, 0],  // Electric -> executive
                        [0, 0, 0, 0, 0, 0, 0.1, 0.8, 0, 0, 0, 0, 0, 0, 0, 0],  // Co. -> executive
                        [0, 0, 0, 0, 0, 0, 0, 0.8, 0, 0, 0, 0, 0, 0, 0, 0],  // executive -> executive
                        [0, 0, 0, 0, 0, 0, 0, 0, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1], // figures -> distributed
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0.1, 0.1, 0.1, 0.1, 0.1, 0.8, 0], // it -> time
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1], // will -> distributed
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.1, 0.1, 0.1, 0.1, 0.1], // be -> distributed
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.1, 0.1, 0.1, 0.1], // easier -> distributed
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.1, 0.8, 0],  // this -> time
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.8, 0],  // time -> time
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.8]   // SEP -> SEP
                      ],
                      highlightedConnections: [
                        {from: 2, to: 7},   // "45-year-old" -> "executive"
                        {from: 3, to: 7},   // "former" -> "executive"
                        {from: 4, to: 7},   // "General" -> "executive"
                        {from: 5, to: 7},   // "Electric" -> "executive"
                        {from: 6, to: 7},   // "Co." -> "executive"
                        {from: 13, to: 14}  // "this" -> "time"
                      ]
                    }
                  ]}
                />
                <p style={{ marginTop: 20}}>Jede dieser Komponenten trägt zur schrittweisen Bedeutungsbildung bei. Gemeinsam erzeugen sie eine strukturierte Repräsentation – viele kleine Entscheidungen, die nach und nach im CLS-Vektor verdichtet werden.</p>
              </div>
            </div>
          </section>
          <section id="klassifizierung">
            <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 160 }}>
              <RotatedSectionTitle label="Klassifizierung" />
              <div style={{ flex: 1 }}>
                <p style={{ marginBottom: 32}}>Am Ende betrachten wir nur noch den CLS-Vektor aus dem letzten Layer. Dieser enthält alle Informationen, die das Modell aus dem Satz extrahiert hat.
                  Doch wie gelangt das Modell nun von einem Vektor mit z. B. 768 Dimensionen zu einer Entscheidung über 10 mögliche Labels wie „Catering“, „Location“ oder „Veranstaltungstechnik“?
                  Die Antwort: Eine einfache lineare Projektion. Für jedes Label existiert ein eigener Gewichtungsvektor, der überprüft, ob der CLS-Vektor „in die richtige Richtung zeigt“. In der nächsten Ansicht zeigen wir, welche semantischen Richtungen das Modell gelernt hat – und wie der CLS-Vektor eines Textes mit diesen Richtungen in Beziehung steht.
                  </p>
                <div style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  background: "#fff",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                  padding: 24,
                  position: "relative"
                }}>
                  <div style={{
                    fontSize: 12,
                    color: "#999",
                    position: "absolute",
                    top: -8,
                    left: 12,
                    background: "#fff",
                    padding: "0 8px"
                  }}>Classification Layer</div>
                  <ClsToOutputViz />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
} 