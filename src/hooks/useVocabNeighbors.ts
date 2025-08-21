import { useEffect, useState } from "react";

export type Point = {
  token: string;
  x: number;
  y: number;
};

export type NeighborPoint = Point & {
  is_focus: boolean;
  similarity: number;
};

export type VocabNeighborsData = {
  topk: number;
  points: NeighborPoint[];
  note: string;
};

export type VocabFullPoint = {
  token_id: string;
  token: string;
  x: number;
  y: number;
};

export type NeighborByToken = {
  [token: string]: Array<{
    token_id: string;
    token: string;
    similarity: number;
  }>;
};

export function useVocabNeighbors() {
  const [data, setData] = useState<VocabNeighborsData | null>(null);
  const [fullVocabData, setFullVocabData] = useState<VocabFullPoint[]>([]);
  const [neighborsByToken, setNeighborsByToken] = useState<NeighborByToken>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/vocab_full_2d.csv").then(res => res.text()),
      fetch("/neighbors_by_token.json").then(res => res.json())
    ])
    .then(([csvText, fetchedNeighborsByToken]) => {
      // Parse vocab_full_2d.csv
      const lines = csvText.trim().split('\n');
      const vocabFullPoints: VocabFullPoint[] = [];
      
      for (let i = 1; i < lines.length; i++) { // Skip header
        const [token_id, token, x_str, y_str] = lines[i].split(',');
        const x = parseFloat(x_str);
        const y = parseFloat(y_str);
        
        vocabFullPoints.push({
          token_id,
          token,
          x,
          y
        });
      }

      // Create a simple VocabNeighborsData structure for compatibility
      const result: VocabNeighborsData = {
        topk: 40,
        points: [], // We'll populate this dynamically based on selected tokens
        note: "2D projection of vocabulary space with sentence tokens and neighbors."
      };

      setData(result);
      setFullVocabData(vocabFullPoints);
      setNeighborsByToken(fetchedNeighborsByToken);
      setLoading(false);
    })
    .catch(err => {
      setError(err.message);
      setLoading(false);
    });
  }, []);

  return { data, loading, error, fullVocabData, neighborsByToken };
}
