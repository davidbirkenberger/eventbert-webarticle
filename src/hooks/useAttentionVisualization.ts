"use client";
import { useState, useEffect } from "react";
import { useModelData } from "./useModelData";

export interface AttentionData {
  tokens: string[];
  attention: number[][];
}

export function useAttentionVisualization() {
  const { data: modelData } = useModelData();
  
  // State for attention visualization
  const [attentionData, setAttentionData] = useState<AttentionData | null>(null);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number>(0);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0);
  const [selectedHeadIndex, setSelectedHeadIndex] = useState<number>(0);
  
  // State for embedding 2D map
  const [selectedToken, setSelectedToken] = useState<string | null>(null);

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

  return {
    attentionData,
    selectedTokenIndex,
    selectedLayerIndex,
    selectedHeadIndex,
    selectedToken,
    setSelectedTokenIndex,
    setSelectedLayerIndex,
    setSelectedHeadIndex,
    setSelectedToken,
  };
}
