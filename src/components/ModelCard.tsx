import React, { useState } from 'react';
import LabeledContainer from './LabeledContainer';

interface ModelCardProps {
  className?: string;
}

const ModelCard: React.FC<ModelCardProps> = ({ className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`model-card ${className}`}>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        cursor: "pointer",
        padding: "16px 0",
        borderBottom: "1px solid #e5e7eb"
      }} onClick={() => setIsExpanded(!isExpanded)}>
        <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#374151" }}>
          Model Card: Event-BERT
        </h3>
        <div style={{ 
          fontSize: "18px", 
          color: "#6b7280",
          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s ease"
        }}>
          ▼
        </div>
      </div>

      {isExpanded && (
        <div style={{ paddingTop: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            {/* Left Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <LabeledContainer label="Modell-Details">
                <div style={{ fontSize: "14px", color: "#6b7280" }}>
                  <div><strong>Modellname:</strong> Event-BERT</div>
                  <div><strong>Architektur:</strong> BERT Base German Uncased (dbmdz)</div>
                  <div><strong>Basis:</strong> dbmdz/bert-base-german-uncased</div>
                </div>
              </LabeledContainer>

                             <LabeledContainer label="Beabsichtigte Nutzung">
                 <div style={{ fontSize: "14px", color: "#6b7280" }}>
                   <div><strong>Hauptzweck:</strong> Automatisierte Multi-Label-Klassifikation deutscher Unternehmenswebseiten der Eventwirtschaft in zehn Cluster</div>
                   <div><strong>Zielgruppen:</strong> Forschende, Analyst:innen, Studierende</div>
                   <div><strong>Nicht empfohlen:</strong> Nutzung außerhalb der Eventwirtschaft oder auf nicht-deutschen Websites ohne erneute Validierung; politische oder finanzielle Entscheidungen ohne menschliche Kontrolle</div>
                 </div>
               </LabeledContainer>

                             <LabeledContainer label="Trainingsdaten">
                 <div style={{ fontSize: "14px", color: "#6b7280" }}>
                   <div><strong>Basismodell (dbmdz):</strong> Wikipedia Dump, EU Bookshop, Open Subtitles, CommonCrawl, ParaCrawl, News Crawl</div>
                   <div><strong>Finetuning:</strong> 198 Unternehmenswebseiten (Indexseite + ggf. &quot;Über uns&quot;-Seite)</div>
                   <div><strong>Labels:</strong> 10 Cluster nach Veranstaltungslandkarte für Deutschland (Zanger & Klaus, 2021)</div>
                 </div>
               </LabeledContainer>
            </div>

            {/* Right Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                             <LabeledContainer label="Metriken">
                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                   <div style={{ textAlign: "center", padding: "12px", background: "#f3f4f6", borderRadius: "6px" }}>
                     <div style={{ fontSize: "18px", fontWeight: "600", color: "#374151" }}>0.85</div>
                     <div style={{ fontSize: "12px", color: "#6b7280" }}>Mikro-F1</div>
                   </div>
                   <div style={{ textAlign: "center", padding: "12px", background: "#f3f4f6", borderRadius: "6px" }}>
                     <div style={{ fontSize: "18px", fontWeight: "600", color: "#374151" }}>0.84</div>
                     <div style={{ fontSize: "12px", color: "#6b7280" }}>Makro-F1</div>
                   </div>
                   <div style={{ textAlign: "center", padding: "12px", background: "#f3f4f6", borderRadius: "6px" }}>
                     <div style={{ fontSize: "18px", fontWeight: "600", color: "#374151" }}>0.87</div>
                     <div style={{ fontSize: "12px", color: "#6b7280" }}>Mikro-Precision</div>
                   </div>
                   <div style={{ textAlign: "center", padding: "12px", background: "#f3f4f6", borderRadius: "6px" }}>
                     <div style={{ fontSize: "18px", fontWeight: "600", color: "#374151" }}>0.84</div>
                     <div style={{ fontSize: "12px", color: "#6b7280" }}>Mikro-Recall</div>
                   </div>
                 </div>
               </LabeledContainer>

                             <LabeledContainer label="Evaluationsdaten">
                 <div style={{ fontSize: "14px", color: "#6b7280" }}>
                   <div><strong>Korpus:</strong> 198 Unternehmenswebseiten der deutschen Eventwirtschaft</div>
                   <div><strong>Aufteilung:</strong> Training / Validierung / Test mit iterativer Multi-Label-Stratifizierung</div>
                   <div><strong>Annotation:</strong> Manuelle Label-Zuweisung basierend auf den Clusterbeschreibungen der ZÄHL-DAZU-Studie</div>
                 </div>
               </LabeledContainer>
            </div>
          </div>

          {/* Bottom Row - Full Width */}
          <div style={{ display: "grid", gap: "16px" }}>
                         <LabeledContainer label="Ethische Überlegungen & Einschränkungen">
               <div style={{ fontSize: "14px", color: "#6b7280" }}>
                 <ul style={{ margin: "0", paddingLeft: "20px" }}>
                   <li>Heterogenität der Webseiten (Struktur, Wortwahl, Umfang)</li>
                   <li>Uneinheitliche oder vage Leistungsbeschreibungen</li>
                   <li>Unterschiedliche Label-Spezifizität und Überlappungen (z. B. Agenturen ↔ Vermittlung/Management)</li>
                   <li>Kleine Stichprobe (198 Unternehmen) → potenziell eingeschränkte Generalisierbarkeit</li>
                   <li>Keine personenbezogenen Daten gezielt verwendet; Webseiten können dennoch Namen enthalten</li>
                   <li>Bias-Risiko durch selektive Datengrundlage (Unternehmen mit guter Online-Präsenz überrepräsentiert)</li>
                   <li>Unsicherheit der Labeldefinition (Clusterstruktur ist neu und noch nicht breit validiert)</li>
                   <li>Empfehlung: Erweiterung des Korpus, Kalibrierung label-spezifischer Schwellenwerte, regelmäßiges Retraining</li>
                 </ul>
               </div>
             </LabeledContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelCard;
