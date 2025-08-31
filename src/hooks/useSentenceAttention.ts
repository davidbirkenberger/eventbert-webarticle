"use client";
import { useEffect, useState } from "react";

export type SentenceAttentionData = {
  sentence: string;
  words: string[];
  tokens: string[];
  word_to_subword: number[][];
  layers: number;
  total_heads: number;
  target_layer_heads: number[][];
  attention_matrices: Record<string, {
    layer: number;
    head: number;
    token_attention: number[][];
    word_attention: number[][];
    word_attention_shape: number[];
  }>;
};

export function useSentenceAttention() {
  const [data, setData] = useState<SentenceAttentionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/sentence_attention.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch sentence attention data");
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
