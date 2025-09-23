import React, { useState } from 'react';
import LabeledContainer from './LabeledContainer';

interface ModelCardProps {
  className?: string;
}

const ModelCard: React.FC<ModelCardProps> = ({ className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`model-card ${className}`}>
      <div 
        className="flex items-center justify-between cursor-pointer py-4 border-b border-gray-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="m-0 text-xl font-semibold text-gray-700">
          Model Card: Event-BERT
        </h3>
        <div 
          className={`text-lg text-gray-500 transition-transform duration-200 ease-in-out ${
            isExpanded ? 'rotate-180' : 'rotate-0'
          }`}
        >
          ▼
        </div>
      </div>

      {isExpanded && (
        <div className="pt-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            {/* Left Column */}
            <div className="flex flex-col gap-4">
              <LabeledContainer label="Modell-Details">
                <div className="text-sm text-gray-500 space-y-1">
                  <div><strong>Modellname:</strong> Event-BERT</div>
                  <div><strong>Architektur:</strong> BERT Base German Uncased (dbmdz)</div>
                  <div><strong>Basis:</strong> dbmdz/bert-base-german-uncased</div>
                </div>
              </LabeledContainer>

              <LabeledContainer label="Beabsichtigte Nutzung">
                <div className="text-sm text-gray-500 space-y-1">
                  <div><strong>Hauptzweck:</strong> Automatisierte Multi-Label-Klassifikation deutscher Unternehmenswebseiten der Eventwirtschaft in zehn Cluster</div>
                  <div><strong>Zielgruppen:</strong> Forschende, Analyst:innen, Studierende</div>
                  <div><strong>Nicht empfohlen:</strong> Nutzung außerhalb der Eventwirtschaft oder auf nicht-deutschen Websites ohne erneute Validierung; politische oder finanzielle Entscheidungen ohne menschliche Kontrolle</div>
                </div>
              </LabeledContainer>

              <LabeledContainer label="Trainingsdaten">
                <div className="text-sm text-gray-500 space-y-1">
                  <div><strong>Basismodell (dbmdz):</strong> Wikipedia Dump, EU Bookshop, Open Subtitles, CommonCrawl, ParaCrawl, News Crawl</div>
                  <div><strong>Finetuning:</strong> 198 Unternehmenswebseiten (Indexseite + ggf. &quot;Über uns&quot;-Seite)</div>
                  <div><strong>Labels:</strong> 10 Cluster nach Veranstaltungslandkarte für Deutschland (Zanger & Klaus, 2021)</div>
                </div>
              </LabeledContainer>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-4">
              <LabeledContainer label="Metriken">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-gray-100 rounded-md">
                    <div className="text-lg font-semibold text-gray-700">0.85</div>
                    <div className="text-xs text-gray-500">Mikro-F1</div>
                  </div>
                  <div className="text-center p-3 bg-gray-100 rounded-md">
                    <div className="text-lg font-semibold text-gray-700">0.84</div>
                    <div className="text-xs text-gray-500">Makro-F1</div>
                  </div>
                  <div className="text-center p-3 bg-gray-100 rounded-md">
                    <div className="text-lg font-semibold text-gray-700">0.87</div>
                    <div className="text-xs text-gray-500">Mikro-Precision</div>
                  </div>
                  <div className="text-center p-3 bg-gray-100 rounded-md">
                    <div className="text-lg font-semibold text-gray-700">0.84</div>
                    <div className="text-xs text-gray-500">Mikro-Recall</div>
                  </div>
                </div>
              </LabeledContainer>

              <LabeledContainer label="Evaluationsdaten">
                <div className="text-sm text-gray-500 space-y-1">
                  <div><strong>Korpus:</strong> 198 Unternehmenswebseiten der deutschen Eventwirtschaft</div>
                  <div><strong>Aufteilung:</strong> Training / Validierung / Test mit iterativer Multi-Label-Stratifizierung</div>
                  <div><strong>Annotation:</strong> Manuelle Label-Zuweisung basierend auf den Clusterbeschreibungen der ZÄHL-DAZU-Studie</div>
                </div>
              </LabeledContainer>
            </div>
          </div>

          {/* Bottom Row - Full Width */}
          <div className="grid gap-4">
            <LabeledContainer label="Ethische Überlegungen & Einschränkungen">
              <div className="text-sm text-gray-500">
                <ul className="m-0 pl-5 space-y-1">
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
