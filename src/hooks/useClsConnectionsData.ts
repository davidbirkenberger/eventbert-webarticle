"use client";
import { useEffect, useState } from "react";

export type ClsConnectionsData = {
  cls_embedding: number[]; // [CLS] embedding vector
  classifier_weight: number[][]; // [num_classes][embedding_dim]
  classifier_bias: number[]; // [num_classes]
  logits: number[]; // [num_classes]
  text?: string;
};

export function useClsConnectionsData() {
  const [data, setData] = useState<ClsConnectionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/cls_to_output_connections.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
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