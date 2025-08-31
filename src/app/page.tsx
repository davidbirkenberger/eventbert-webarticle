"use client";
import React, { useEffect, useState } from "react";
import { useModelData } from "@/hooks/useModelData";
import { useVocabNeighbors } from "../hooks/useVocabNeighbors";
import { useSentenceAttention } from "../hooks/useSentenceAttention";
import ClsToOutputViz from "../components/ClsToOutputViz";
import SpecializedHeadViz from "../components/SpecializedHeadViz";
import TokenEmbeddingsPanel from "../components/TokenEmbeddingsPanel";
import AttentionMatrixViz from "../components/AttentionMatrixViz";

import TransformerBlockWrapper from "../components/TransformerBlockWrapper";
import LabeledContainer from "../components/LabeledContainer";
import VocabNeighborsViz from "../components/VocabNeighborsViz";
import ModelCard from "../components/ModelCard";

// Helper component for the raw text card
const RawTextCard: React.FC = () => {
  const { data, loading } = useModelData();
  
  if (loading) return <div>Loading...</div>;
  
  const text = data?.text || "Wir bieten elegantes Catering und exklusive Locations für unvergessliche Veranstaltungen.";

  return (
    <div className="border-none rounded-xl bg-gray-50 shadow-none p-6 min-w-[500px] max-w-[700px] flex-1 flex flex-col min-h-[120px] justify-center relative">
      <div className="text-2xl text-gray-600 leading-relaxed font-medium font-mono">{text}</div>
    </div>
  );
};

// Helper for rotated section titles
const RotatedSectionTitle: React.FC<{ label: string }> = ({ label }) => (
  <div className="writing-vertical-rl text-orientation-mixed font-bold text-2xl text-gray-600 mr-4 flex items-center tracking-wide min-w-8">
    {label}
  </div>
);

// Tokenized sentence component with same styling as TokenEmbeddingsPanel
const TokenizedSentence: React.FC = () => {
  const { data, loading } = useModelData();
  
  if (loading) return <div>Loading...</div>;
  
  const tokens = data?.tokens || ["[CLS]", "mit", "unseren", "sna", "##cks", "bieten", "wir", "das", "beste", "cater", "##ing", ".", "[SEP]"];

  return (
    <div className="font-mono text-xl">
      <div className="mb-4 flex gap-2">
        {tokens.slice(0, 10).map((token, i) => (
          <span
            key={i}
            className={`inline-block align-bottom leading-[50px] ${
              token === "[CLS]" 
                ? "font-bold text-4xl opacity-100" 
                : "font-normal text-xl opacity-40"
            }`}
          >
            {token}
          </span>
        ))}
        {tokens.length > 10 && (
          <span className="text-xl opacity-40 align-bottom leading-[50px]">...</span>
        )}
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
    <div className="flex items-center justify-center mb-4 gap-2">
      <span className="text-base text-gray-600 mr-2">Layer:</span>
      <div className="flex gap-1 items-center flex-wrap">
        {Array.from({ length: layerCount }, (_, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`px-2 py-1 border border-gray-300 rounded text-xs font-mono cursor-pointer transition-colors ${
              i === selectedIndex 
                ? "bg-blue-50 text-blue-700 font-bold" 
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
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
    <div className="flex items-center justify-center mb-4 gap-2">
      <span className="text-base text-gray-600 mr-2">Head:</span>
      <div className="flex gap-1 items-center flex-wrap">
        {Array.from({ length: headCount }, (_, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`px-2 py-1 border border-gray-300 rounded text-xs font-mono cursor-pointer transition-colors ${
              i === selectedIndex 
                ? "bg-blue-50 text-blue-700 font-bold" 
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
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
    <div className="flex items-center justify-center mb-6 gap-2">
      <button 
        onClick={() => onSelect((selectedIndex - 1 + tokens.length) % tokens.length)}
        className="text-2xl border-none bg-transparent cursor-pointer text-gray-600 p-2 rounded-md"
      >
        &larr;
      </button>
      <div className="flex gap-2 items-center font-mono text-lg">
        {tokens.map((token, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`px-3 py-1 border border-gray-300 rounded text-sm font-mono transition-colors ${
              i === selectedIndex 
                ? "bg-blue-50 text-blue-700 font-bold" 
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {token}
          </button>
        ))}
      </div>
      <button 
        onClick={() => onSelect((selectedIndex + 1) % tokens.length)}
        className="text-2xl border-none bg-transparent cursor-pointer text-gray-600 p-2 rounded-md"
      >
        &rarr;
      </button>
    </div>
  );
};

export default function Page() {
  // Use the new consolidated data hook
  const { data: modelData, loading, error } = useModelData();
  const { data: vocabNeighbors, loading: vocabLoading, error: vocabError, fullVocabData, neighborsByToken } = useVocabNeighbors();
  const { data: sentenceAttentionData, loading: sentenceAttentionLoading, error: sentenceAttentionError } = useSentenceAttention();
  

  
  // State for attention visualization
  const [attentionData, setAttentionData] = useState<{ tokens: string[]; attention: number[][] } | null>(null);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number>(0);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0);
  const [selectedHeadIndex, setSelectedHeadIndex] = useState<number>(0);
  
  // State for embedding 2D map
  const [embedding2d, setEmbedding2d] = useState<any[]>([]);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  
  // Debug logging
  console.log("Page: vocabNeighbors:", vocabNeighbors);
  console.log("Page: vocabLoading:", vocabLoading);
  console.log("Page: vocabError:", vocabError);
  console.log("Page: embedding2d:", embedding2d);
  console.log("Page: modelData:", modelData);

  // Process attention data when model data changes
  useEffect(() => {
    if (modelData && modelData.attention_data) {
      const layerKey = `layer_${selectedLayerIndex}`;
      const headKey = `head_${selectedHeadIndex}`;
      
      if (modelData.attention_data[layerKey] && modelData.attention_data[layerKey][headKey]) {
        const matrix = modelData.attention_data[layerKey][headKey];
        setAttentionData({ tokens: modelData.tokens, attention: matrix });
      }
    }
  }, [modelData, selectedLayerIndex, selectedHeadIndex]);

  // Process 2D embeddings when model data changes
  useEffect(() => {
    if (modelData && modelData.token_embeddings["2d"]) {
      const data = Object.entries(modelData.token_embeddings["2d"]).map(([token, coords]) => ({
        token,
        x: coords.x,
        y: coords.y
      }));
      setEmbedding2d(data);
    }
  }, [modelData]);
    return (
    <main className="px-16 py-16 box-border max-w-7xl mx-auto overflow-x-hidden">
      {/* Title and subtitle */}
      <div className="mb-16">
        <h1 className="text-5xl font-bold leading-tight mb-4">Ein Blick in die Blackbox</h1>
        <div className="text-lg text-gray-600 mt-4 font-normal">
        Wie BERT Website-Texte der Eventbranche versteht
        </div>
        <div className="text-sm text-gray-600 mt-4 flex gap-4 items-center">
          <span>Autor: David Birkenberger</span>
          <span>•</span>
          <span>Oktober 2025</span>
          <span>•</span>
          <a href="https://github.com/davidbirkenberger/mechinterp_article" className="text-gray-600 no-underline hover:underline">
            GitHub
          </a>
        </div>
        <div className="border-t border-gray-200 mt-8 mb-8"></div>
      </div>

      {/* Outline and content layout */}
      <div className="flex gap-10">
        {/* Outline sidebar - Sticky Navigation */}
        <nav className="sticky top-20 w-52 h-fit-content flex-shrink-0 bg-transparent p-5">
          <div className="font-bold text-3xl mb-6 text-gray-600">Inhalt</div>
          <ul className="list-none p-0 m-0 text-lg text-gray-600">
            <li className="mb-4"><a href="#model-card" className="text-gray-600 no-underline hover:underline">Model Card</a></li>
            <li className="mb-4"><a href="#unternehmenstext" className="text-gray-600 no-underline hover:underline">Website-Text</a></li>
            <li className="mb-4"><a href="#embeddings" className="text-gray-600 no-underline hover:underline">Embeddings</a></li>
            <li className="mb-4"><a href="#vocab-neighbors" className="text-gray-600 no-underline hover:underline">Vocabulary Neighbors</a></li>
            <li className="mb-4"><a href="#cls-token" className="text-gray-600 no-underline hover:underline">CLS-Token</a></li>
            <li className="mb-4"><a href="#transformer-block" className="text-gray-600 no-underline hover:underline">Transformer Block</a></li>
            <li className="mb-4"><a href="#specialized-components" className="text-gray-600 no-underline hover:underline">Specialized Components</a></li>
            <li className="mb-4"><a href="#klassifizierung" className="text-gray-600 no-underline hover:underline">Klassifizierung</a></li>
          </ul>
        </nav>

        {/* Main content */}
        <div className="flex-1 min-w-0 max-w-full">
          <section className="mb-12">
            <p className="text-base text-gray-700 mb-6">
              Wie versteht ein Sprachmodell eigentlich Texte, die wir im Alltag schreiben – zum Beispiel die Selbstdarstellung eines Unternehmens auf seiner Website? Traditionell versucht man, solche Informationen über Interviews, Umfragen oder Experteneinschätzungen zu erfassen. In unserem Projekt gehen wir einen anderen Weg: Wir setzen ein feinabgestimmtes BERT-Modell ein, das Texte der Eventbranche automatisch in Kategorien einordnet – etwa ob ein Unternehmen Catering anbietet oder Veranstaltungsräume bereitstellt.
            </p>
            <p className="text-base text-gray-700 mb-6">
              Doch damit betreten wir eine Welt, die leicht als undurchdringlich erscheint. Ein Modell mit Hunderten Millionen Parametern trifft Entscheidungen, ohne dass unmittelbar klar wird, wie es zu diesen kommt. Die „Blackbox“ wirkt bedrohlich, weil sie einerseits erstaunlich gut funktioniert, andererseits aber nur schwer durchschaubar scheint.
            </p>
            <p className="text-base text-gray-700 mb-6">
              In diesem Artikel lüften wir den Deckel ein Stück weit. Wir begleiten einen einzelnen Satz auf seiner Reise durch BERT: vom rohen Text über die ersten Vektorabbildungen bis hin zur finalen Klassifikation. Dabei zeigen wir, wie sich Bedeutung schrittweise im Modell aufbaut, welche spezialisierten Komponenten sich herausgebildet haben und wie am Ende eine klare Entscheidung zustande kommt. Ziel ist es, ein Gefühl dafür zu vermitteln, dass hinter der Blackbox keine Magie steckt, sondern eine Vielzahl kleiner, nachvollziehbarer Transformationen – zusammengenommen mächtig, aber im Kern erklärbar.
            </p>
          </section>
                                <section id="unternehmenstext">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-8">
                Website-Text als Ausgangspunkt
              </h2>
              <p className="text-base text-gray-700 mb-6">
                Als Grundlage dienen Texte, die wir von frei zugänglichen Unternehmenswebsites beziehen. Dort beschreiben Firmen selbst, welche Leistungen sie anbieten – sei es Catering, die Bereitstellung von Räumen oder technische Services. Für unser Modell sind diese Texte die zentrale Informationsquelle.
              </p>
              
              <p className="text-base text-gray-700 mb-8">
                Solche Webseitentexte sind inhaltlich oft dicht, aber sprachlich frei formuliert. Sie unterscheiden sich damit von klassischen Fragebögen oder Interviewdaten: Statt vordefinierter Kategorien liegt hier unstrukturierter Text vor, den das Modell interpretieren muss.
              </p>


              <div className="flex justify-center">
                <RawTextCard />
              </div>
              <p className="text-base text-gray-700 mb-8 mt-8">
                Um nachvollziehbar zu machen, wie dieser Prozess funktioniert, betrachten wir im Folgenden exemplarisch einen einzelnen Satz. Er begleitet uns durch alle Stationen der Modellverarbeitung – von der Tokenisierung bis hin zur finalen Klassifikation.
              </p>
            </div>
          </section>
            <section id="embeddings">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-8">
                Embeddings
              </h2>
              <p className="text-base text-gray-700 mb-6">
                Bevor der Satz verarbeitet werden kann, zerlegt das Modell ihn in kleinere Einheiten, sogenannte Tokens. 
                Diese Tokens müssen in Zahlen übersetzt werden, damit das neuronale Netz damit arbeiten kann.
                Jedes Token erhält ein Embedding – einen Vektor im hochdimensionalen Raum. 
                Darin ist eine abstrakte Vorstellung seiner Bedeutung kodiert, ergänzt um Informationen über die Position im Satz.
              </p>
              
              <p className="text-base text-gray-700 mb-8">
                Dabei liegen semantisch ähnliche Wörter im hochdimensionalen Embedding-Raum nah beieinander.
                Um das zu veranschaulichen können wir den Raum in zwei Dimensionen projizieren und uns die Tokens unseres Beispielsatzes anschauen.
              </p>
              
                              <LabeledContainer 
                  label="Tokenized Satz"
                >
                <TokenEmbeddingsPanel
                  selectedToken={selectedToken}
                  onTokenSelect={setSelectedToken}
                />
                {/* Vocabulary space map */}
                <div className="mt-8">
                  <div className="text-sm text-gray-600 mb-2">t-SNE Visualisierung des Vokabulars</div>
                  {vocabNeighbors ? (
                    <VocabNeighborsViz
                      vocabNeighbors={vocabNeighbors}
                      fullVocabData={fullVocabData}
                      neighborsByToken={neighborsByToken}
                      selectedToken={selectedToken}
                      onTokenSelect={setSelectedToken}
                      width={900}
                      height={520}
                    />
                  ) : (
                    <div className="text-center py-10 text-gray-600">
                      {vocabLoading || !modelData ? 'Loading vocabulary data...' : 'Vocabulary data not available'}
                    </div>
                  )}
       
                </div>

              </LabeledContainer>
              <p className="text-base text-gray-700 mb-6 mt-8">
                  Damit zeigt sich: Noch bevor der eigentliche Modellprozess beginnt, ist ein Großteil der semantischen Struktur bereits in den Embeddings angelegt. 
                  Das Modell „weiß“ also schon auf dieser frühen Ebene, dass Wörter wie Service, Kellner oder Zimmerservice enger zusammenhängen als völlig andere Begriffe.
                  </p>

                <p className="text-base text-gray-700">Zusätzlich zu den eigentlichen Satz-Token fügt BERT am Anfang der Sequenz ein spezielles Symbol ein: [CLS].

Dieses Token hat keine eigene Bedeutung im Sprachsinn. Stattdessen dient es als Sammelpunkt: Während der Verarbeitung fließt nach und nach Information von allen anderen Tokens in den [CLS]-Vektor ein.</p>
                <div className="mt-8">
                  <TokenizedSentence />
                </div>
                <p className="text-base text-gray-700 mt-8 mb-6">
                  Am Anfang ist dieser Vektor lediglich eine zufällige Zahlenkombination. Mit jeder Schicht des Modells reichert er sich jedoch mit Kontext an – bis er am Ende eine verdichtete Repräsentation des gesamten Satzes darstellt.
                </p>
                
                <p className="text-base text-gray-700 mb-8">
                  Für die Klassifikation betrachten wir ausschließlich diesen finalen [CLS]-Vektor. Er fasst das Gelernte über den gesamten Text in einer kompakten Form zusammen und bildet damit die Grundlage für die Entscheidung des Modells.
                </p>
              </div>
          </section>
          
          {/* Transformer Block visualization as a top-level section */}
          <section id="transformer-block">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-8">
                Transformer Block
              </h2>
              <p className="text-base text-gray-700 mb-6">
                Nun beginnt der eigentliche Kern des Modells: Die Verarbeitung durch eine Abfolge von Transformer-Blöcken.
                Jeder Block besteht aus denselben Bausteinen – Multi-Head Attention, Feed-Forward-Netzwerk und Normalisierungsschritte. 
              </p>
              
              <p className="text-base text-gray-700 mb-8">
                Bei BERT werden insgesamt 12 solcher Blöcke durchlaufen. Jeder einzelne fügt ein weiteres Stück Verarbeitung hinzu – kleine Veränderungen, die sich im Laufe der Schichten zu einem tiefen Sprachverständnis summieren.
              </p>
                {attentionData ? (
                  <>

                    <TransformerBlockWrapper 
                      attentionTokens={attentionData.tokens} 
                      attentionMatrix={attentionData.attention}
                      selectedTokenIndex={selectedTokenIndex}
                      selectedLayerIndex={selectedLayerIndex}
                      selectedHeadIndex={selectedHeadIndex}
                      onHeadSelect={setSelectedHeadIndex}
                      onTokenSelect={setSelectedTokenIndex}
                      onLayerChange={setSelectedLayerIndex}
                    />
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-600">Lade Attention-Daten…</div>
                )}
            </div>
          </section>
          <section id="specialized-components">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-8">
              Viele Schichten – viele Rollen
              </h2>
              
              <p className="text-base text-gray-700 mb-6">Aber warum braucht es so viele sich ähnelnde, wiederholte Komponenten?
              Sprachverstehen lässt sich als Zusammenspiel vieler Teilaufgaben denken – etwa zu erkennen, auf welches Nomen sich ein Adjektiv bezieht oder welche Entität mit einem Pronomen gemeint ist.</p>
              <p className="text-base text-gray-700 mb-8">Analysen haben gezeigt, dass in BERT-Modellen spezialisierte Attention-Heads entstehen, die genau solche Aufgaben übernehmen. Auch in unserem Modell lassen sich diese Spezialisierungen beobachten: So verdeutlichen L7-H10 und L7-H6, wie verschiedene Köpfe jeweils unterschiedliche Relationen zwischen Wörtern abbilden.</p>
                {sentenceAttentionData ? (
                  <SpecializedHeadViz 
                    headTitle="Spezialisierte Attention-Heads"
                    description=""
                    useWordLevelData={true}
                    sentenceAttentionData={sentenceAttentionData}
                    layerIndex={7}
                    headIndex={6}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-600">Lade Attention-Head-Daten…</div>
                )}
                <p className="text-base text-gray-700 mt-4">Jede dieser Komponenten trägt zur schrittweisen Bedeutungsbildung bei. Gemeinsam erzeugen sie eine strukturierte Repräsentation – viele kleine Entscheidungen, die nach und nach im CLS-Vektor verdichtet werden.</p>
                
                
            </div>
          </section>
          <section id="klassifizierung">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-8">
              Vom CLS zur Klassifikation
              </h2>
                <p className="text-base text-gray-700 mb-6">Am Ende der Verarbeitung steht der [CLS]-Vektor aus der letzten Schicht. Er enthält die verdichteten Informationen des gesamten Satzes – alles, was das Modell an Kontext und Bedeutung herausgearbeitet hat. 
                </p>
                <p className="text-base text-gray-700 mb-6">
                Für die eigentliche Klassifikation genügt nun ein einfacher Schritt: Der CLS-Vektor wird durch eine lineare Projektion auf die Zielkategorien abgebildet. Für jedes Label existiert ein Gewichtungsvektor, der prüft, ob der CLS-Vektor „in diese Richtung zeigt“. 
                </p>
                  <p className="text-base text-gray-700 mb-8">
                    So entsteht eine Wahrscheinlichkeit für jedes Label – zum Beispiel Catering, Locations und Räume oder Veranstaltungstechnik. Auf diese Weise wird aus einem hochdimensionalen Vektor eine konkrete Entscheidung, die für uns wieder unmittelbar verständlich ist.
                  </p>
                <LabeledContainer label="Classification Layer">
                  <ClsToOutputViz />
                </LabeledContainer>
                
                <p className="text-base text-gray-700 mb-6 mt-8">
                  Wir haben einen einzelnen Satz durch alle Stationen von BERT begleitet – vom Rohtext über Embeddings und Attention bis hin zur finalen Entscheidung. Was zunächst wie eine Blackbox erscheint, zeigt sich bei näherem Hinsehen als eine Abfolge klar strukturierter Schritte. Jede Schicht trägt ihren Teil dazu bei, bis im [CLS]-Vektor eine verdichtete Repräsentation entsteht, die für die Klassifikation genutzt wird.
                </p>
                <p className="text-base text-gray-700 mb-8">
                  Damit wird deutlich: Sprachmodelle arbeiten nicht magisch, sondern systematisch. Indem wir ihre Mechanismen sichtbar machen, können wir besser nachvollziehen, wie sie Bedeutung konstruieren – und zugleich Fragen stellen, wo sie an ihre Grenzen stoßen.
                </p>
                
                <p className="text-base text-gray-700 mb-8">
                  Das Modell, das wir hier analysiert haben, kann für eigene Anwendungen genutzt werden. Im folgenden Abschnitt finden Sie alle wichtigen technischen Details, Evaluationsergebnisse und Nutzungshinweise, die als Grundlage für die praktische Anwendung dienen können.
                </p>
            </div>
          </section>
          
          {/* Model Card section */}
          <section id="model-card" className="mt-16 pt-8 border-t border-gray-200">
            <ModelCard />
          </section>
        </div>
      </div>
      </main>
  );
} 