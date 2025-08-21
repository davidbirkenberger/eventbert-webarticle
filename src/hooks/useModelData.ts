"use client";
import { useEffect, useState } from "react";

export type ModelData = {
  text: string;
  tokens: string[];
  cls_embedding: number[];
  token_embeddings: {
    raw: Record<string, number[]>;
    "2d": Record<string, { x: number; y: number }>;
  };
  feedforward_layers: Array<{
    name: string;
    linear1: {
      weights: number[][];
      bias: number[];
      output_values: Record<string, number[]>;
    };
    gelu: {
      output_values: Record<string, number[]>;
    };
    linear2: {
      weights: number[][];
      bias: number[];
      output_values: Record<string, number[]>;
    };
  }>;
  attention_data: Record<string, Record<string, number[][]>>;
  cls_to_output_connections: Array<{
    class_id: number;
    class_name: string;
    weights: number[];
    bias: number;
    logit: number;
    probability: number;
    connection_strength: number;
  }>;
};

export function useModelData() {
  const [data, setData] = useState<ModelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/model_data.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch model data");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
} 