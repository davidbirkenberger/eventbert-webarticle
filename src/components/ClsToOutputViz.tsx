import React, { useRef, useEffect, useState } from "react";
import { useClsConnectionsData } from "../hooks/useClsConnectionsData";

const CLS_LABEL = "CLS Token";
const OUTPUT_LABELS = [
  "Veranstalter",
  "Locations und Räume",
  "Agenturen",
  "Messebau und Technik",
  "Vermittler und Management",
  "Catering",
  "Service",
  "Entertainment",
  "Kreative",
  "Hersteller",
];

function getWeightColor(weight: number) {
  if (weight > 0) return `rgba(30, 100, 255, 0.5)`;
  if (weight < 0) return `rgba(255, 60, 60, 0.5)`;
  return `rgba(120,120,120,0.2)`;
}

function getWeightWidth(weight: number, maxAbs: number) {
  const abs = Math.abs(weight);
  return 0.5 + (abs / maxAbs) * 2.5;
}

export default function ClsToOutputViz() {
  const { data, loading, error } = useClsConnectionsData();

  // Animation: Einmal abspielen, sobald Section sichtbar wird
  const [t, setT] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const animatingRef = useRef(false);

  useEffect(() => {
    if (!data) return;
    let frame: number;
    let start: number | null = null;
    let observer: IntersectionObserver | null = null;
    function animate(now: number) {
      if (start === null) start = now;
      const duration = 1200; // ms
      const elapsed = now - start;
      let progress = Math.min(1, elapsed / duration);
      setT(progress);
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        animatingRef.current = false;
        setT(1);
      }
    }
    function startAnimation() {
      if (!animatingRef.current) {
        animatingRef.current = true;
        start = null;
        frame = requestAnimationFrame(animate);
      }
    }
    function handleIntersect(entries: IntersectionObserverEntry[]) {
      if (entries[0].isIntersecting) {
        startAnimation();
      }
    }
    observer = new window.IntersectionObserver(handleIntersect, { threshold: 0 });
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
      // Sichtbarkeits-Check beim Mounten
      const rect = sectionRef.current.getBoundingClientRect();
      if (
        rect.bottom > 0 &&
        rect.top < window.innerHeight
      ) {
        startAnimation();
      }
    }
    return () => {
      if (observer && sectionRef.current) observer.unobserve(sectionRef.current);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [data]);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error || !data) {
    return <div>Error loading data</div>;
  }

  const cls_embedding = data.cls_embedding || [];
  const logits = data.logits || [];
  const classifier_weight = data.classifier_weight || [];

  const CLS_NEURON_COUNT = 20;
  const clsValues = cls_embedding.slice(0, CLS_NEURON_COUNT);
  const numOutputs = logits.length;

  // Layout constants
  const neuronRadius = 20; // increased size for both sides
  const clsX = 60;
  const outX = 520;
  const width = outX + neuronRadius * 2 + 380;
  const clsYStart = 60;
  const clsYStep = 48; // more buffer between neurons
  const outYStart = 60;
  const outYStep = Math.max((clsYStep * (CLS_NEURON_COUNT - 1)) / (numOutputs - 1), 44);
  const height = Math.max(
    clsYStart + CLS_NEURON_COUNT * clsYStep + neuronRadius * 2,
    outYStart + numOutputs * outYStep + neuronRadius * 2
  );

  // Find max absolute weight for normalization
  let maxAbsWeight = 1;
  if (classifier_weight && classifier_weight.length && classifier_weight[0].length) {
    maxAbsWeight = Math.max(
      ...classifier_weight.slice(0, numOutputs).flatMap(row => row.slice(0, CLS_NEURON_COUNT).map(Math.abs))
    );
    if (maxAbsWeight === 0) maxAbsWeight = 1;
  }

  // Optimierte Thresholds für jede Klasse
  const THRESHOLDS = [0.21, 0.76, 0.66, 0.21, 0.51, 0.11, 0.46, 0.11, 0.16, 0.26];

  // Hilfsfunktion für Sigmoid
  function sigmoid(z: number) {
    return 1 / (1 + Math.exp(-z));
  }

  return (
    <div ref={sectionRef} style={{ position: "relative", width, height, fontFamily: "sans-serif" }}>
      {/* SVG for lines and circles */}
      <svg width={width} height={height} style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}>
        {/* Draw all connections */}
        {Array.from({ length: numOutputs }).map((_, outIdx) =>
          clsValues.map((_, clsIdx) => {
            const weight =
              classifier_weight && classifier_weight[outIdx] && classifier_weight[outIdx][clsIdx] !== undefined
                ? classifier_weight[outIdx][clsIdx]
                : 0;
            // Start- und Endpunkte
            const x1 = clsX + neuronRadius;
            const y1 = clsYStart + clsIdx * clsYStep + neuronRadius;
            const x2 = outX + neuronRadius;
            const y2 = outYStart + outIdx * outYStep + neuronRadius;
            // Kontrollpunkte für Bezierkurve (S-Kurve)
            const dx = (x2 - x1) * 0.5;
            const c1x = x1 + dx;
            const c1y = y1;
            const c2x = x2 - dx;
            const c2y = y2;
            const pathD = `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`;

            // Hilfsfunktion: Länge einer Bezierkurve schätzen (numerisch)
            function cubicBezierLength(
              x1: number, y1: number,
              c1x: number, c1y: number,
              c2x: number, c2y: number,
              x2: number, y2: number,
              steps: number = 20
            ): number {
              let length = 0;
              let prev = { x: x1, y: y1 };
              for (let i = 1; i <= steps; i++) {
                const t = i / steps;
                const x =
                  (1 - t) ** 3 * x1 +
                  3 * (1 - t) ** 2 * t * c1x +
                  3 * (1 - t) * t ** 2 * c2x +
                  t ** 3 * x2;
                const y =
                  (1 - t) ** 3 * y1 +
                  3 * (1 - t) ** 2 * t * c1y +
                  3 * (1 - t) * t ** 2 * c2y +
                  t ** 3 * y2;
                length += Math.hypot(x - prev.x, y - prev.y);
                prev = { x, y };
              }
              return length;
            }
            const pathLength = cubicBezierLength(x1, y1, c1x, c1y, c2x, c2y, x2, y2);
            const fillLength = t * pathLength;

            return (
              <g key={`cls${clsIdx}-to-out${outIdx}`}>
                {/* Hintergrund-Linie */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={getWeightColor(weight)}
                  strokeWidth={getWeightWidth(weight, maxAbsWeight)}
                  opacity={0.15}
                />
                {/* Gefüllter Teil */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={getWeightColor(weight)}
                  strokeWidth={getWeightWidth(weight, maxAbsWeight)}
                  strokeDasharray={pathLength}
                  strokeDashoffset={pathLength - fillLength}
                  opacity={0.9}
                  style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                />
              </g>
            );
          })
        )}
        {/* Draw CLS neuron circles and values inside */}
        {clsValues.map((val, i) => (
          <g key={`cls-circle-${i}`}>
            <circle
              cx={clsX + neuronRadius}
              cy={clsYStart + i * clsYStep + neuronRadius}
              r={neuronRadius}
              fill="#fff"
              stroke="#aaa"
              strokeWidth={2}
            />
            <text
              x={clsX + neuronRadius}
              y={clsYStart + i * clsYStep + neuronRadius + 1}
              textAnchor="middle"
              alignmentBaseline="middle"
              fontWeight="normal"
              fontSize={13}
              fill="#222"
              style={{ userSelect: "none" }}
            >
              {val.toFixed(2)}
            </text>
          </g>
        ))}
        {/* Draw output neuron circles */}
        {OUTPUT_LABELS.slice(0, numOutputs).map((_, i) => (
          <circle
            key={`out-circle-${i}`}
            cx={outX + neuronRadius}
            cy={outYStart + i * outYStep + neuronRadius}
            r={neuronRadius}
            fill="#fff"
            stroke="#aaa"
            strokeWidth={2}
          />
        ))}
        {/* Draw logits inside output neuron circles */}
        {logits.slice(0, numOutputs).map((logit, i) => (
          <text
            key={`out-logit-${i}`}
            x={outX + neuronRadius}
            y={outYStart + i * outYStep + neuronRadius + 1}
            textAnchor="middle"
            alignmentBaseline="middle"
            fontWeight="normal"
            fontSize={13}
            fill="#222"
            style={{ userSelect: "none" }}
          >
            {logit !== undefined ? logit.toFixed(2) : ""}
          </text>
        ))}
      </svg>
      {/* CLS Token labels */}
      <div style={{ position: "absolute", left: 42, top: clsYStart - 40, width: clsX + neuronRadius * 2, zIndex: 1 }}>
        <div style={{ fontSize: 16, marginBottom: 4, fontWeight: "bold" }}>{CLS_LABEL}</div>
      </div>
      {/* Output classes - simplified with direct final values */}
      <div style={{ position: "absolute", left: outX + neuronRadius * 2 + 24, top: 0, zIndex: 1, height, width: 320, display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
        {logits.slice(0, numOutputs).map((logit, i) => {
          const sig = sigmoid(logit);
          const threshold = THRESHOLDS[i] ?? 0.5;
          const active = sig >= threshold;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                position: "absolute",
                top: outYStart + i * outYStep + neuronRadius - 18,
                left: 0,
                height: 36,
                fontSize: 15,
                lineHeight: 1.1,
                opacity: 1,
                width: 300,
              }}
            >
              {/* Label */}
              <span style={{
                fontWeight: 600,
                color: active ? "#222" : "#aaa",
                opacity: active ? 1 : 0.35,
                fontSize: 17,
                letterSpacing: 0.1,
                transition: "opacity 0.2s, color 0.2s",
                textShadow: active ? "0 1px 2px #fff8" : undefined,
                whiteSpace: "nowrap",
                minWidth: 160,
                display: "inline-block"
              }}>{OUTPUT_LABELS[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
