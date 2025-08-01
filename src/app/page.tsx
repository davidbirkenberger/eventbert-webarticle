"use client";
import React, { useEffect, useState } from "react";
import { useClsConnectionsData } from "@/hooks/useClsConnectionsData";
import ClsToOutputViz from "../components/ClsToOutputViz";
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
    <div style={{ display: "flex", alignItems: "stretch", marginBottom: 32 }}>
      <div style={{
        writingMode: "vertical-rl",
        textOrientation: "mixed",
        fontWeight: "bold",
        fontSize: 22,
        color: "#555",
        marginRight: 16,
        display: "flex",
        alignItems: "center",
        letterSpacing: 1,
      }}>
        Unternehmenstext
      </div>
      <div style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        background: "#fff",
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
        padding: 24,
        minWidth: 420,
        maxWidth: 600,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 180,
        justifyContent: "space-between",
      }}>
        <div style={{ fontSize: 17, color: "#222" }}>{text}</div>
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
      fontSize: 22,
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

export default function Page() {
  // Fetch tokens and attention for the attention viz
  const [attentionData, setAttentionData] = useState<{ tokens: string[]; attention: number[][] } | null>(null);
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
          // Extract first layer and first head for visualization
          const matrix =
            Array.isArray(data.attentions) &&
            Array.isArray(data.attentions[0]) &&
            Array.isArray(data.attentions[0][0])
              ? data.attentions[0][0]
              : null;
          if (matrix) {
            setAttentionData({ tokens: data.tokens, attention: matrix });
          }
        }
      })
      .catch(() => {});
  }, []);

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
        <h1 style={{ fontSize: 56, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>Von Text zu Wahrscheinlichkeiten</h1>
        <div style={{ fontSize: 24, color: '#444', marginTop: 16, fontWeight: 400 }}>
          Interaktive Visualisierung von Token-Embeddings und Klassifizierung in neuronalen Netzen
        </div>
      </div>
      {/* Outline and content layout */}
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {/* Outline sidebar */}
        <nav style={{ minWidth: 240, marginRight: 56, position: 'sticky', top: 56 }}>
          <div style={{ fontWeight: 700, fontSize: 24, marginBottom: 24, color: '#555' }}>Inhalt</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 18, color: '#444' }}>
            <li style={{ marginBottom: 16 }}><a href="#unternehmenstext" style={{ color: '#444', textDecoration: 'none' }}>Unternehmenstext</a></li>
            <li style={{ marginBottom: 16 }}><a href="#embeddings" style={{ color: '#444', textDecoration: 'none' }}>Embeddings</a></li>
            <li style={{ marginBottom: 16 }}><a href="#attention" style={{ color: '#444', textDecoration: 'none' }}>Attention</a></li>
            <li style={{ marginBottom: 16 }}><a href="#klassifizierung" style={{ color: '#444', textDecoration: 'none' }}>Klassifizierung</a></li>
          </ul>
        </nav>
        {/* Main content */}
        <div style={{ flex: 1 }}>
          <section id="unternehmenstext">
            <RawTextCard />
          </section>
          <div style={{ height: 160 }} />
          <section id="embeddings">
            <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 160 }}>
              <RotatedSectionTitle label="Embeddings" />
              <div style={{ flex: 1 }}>
                <h2 style={{ marginTop: 0 }}>Token Embeddings Interaktiv</h2>
                <p>Fahre mit der Maus über ein Token, um die ID und einen Ausschnitt des Embeddings zu sehen.</p>
                <div style={{ marginTop: 32 }}>
                  <TokenEmbeddingsPanel
                    hoveredToken={hoveredToken}
                    onHover={setHoveredToken}
                  />
                </div>
                {/* Embedding space map */}
                <div style={{ marginTop: 48 }}>
                  <EmbeddingSpaceMap
                    data={embedding2d}
                    selectedToken={hoveredToken || undefined}
                    onHover={setHoveredToken}
                  />
                </div>
              </div>
            </div>
          </section>
          {/* Transformer Block visualization as a top-level section */}
          <section id="transformer-block">
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 160 }}>
              <RotatedSectionTitle label="Transformer Block" />
              <div style={{ flex: 1 }}>
                <h2 style={{ marginTop: 0 }}>Transformer Block Visualisierung</h2>
                <p>Visualisierung der wichtigsten Teiloperationen eines Transformer-Blocks. Wähle links einen Block aus, um die jeweilige Operation zu sehen.</p>
                {attentionData ? (
                  <TransformerBlockWrapper attentionTokens={attentionData.tokens} attentionMatrix={attentionData.attention} />
                ) : (
                  <div>Lade Attention-Daten…</div>
                )}
              </div>
            </div>
          </section>
          <section id="klassifizierung">
            <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 160 }}>
              <RotatedSectionTitle label="Klassifizierung" />
              <div style={{ flex: 1 }}>
                <h1 style={{ marginTop: 0 }}>Von 786 Zahlen zu 10 Wahrscheinlichkeiten</h1>
                <p>Visualisierung der letzten Schicht des Modells: CLS-Token zu Output-Klassen.</p>
                <ClsToOutputViz />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
} 