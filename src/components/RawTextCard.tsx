"use client";
import React from "react";
import { useModelData } from "@/hooks/useModelData";
import LoadingSpinner from "./LoadingSpinner";

const RawTextCard: React.FC = () => {
  const { data, loading } = useModelData();
  
  if (loading) {
    return (
      <div className="border-none rounded-xl bg-gray-50 shadow-none p-6 min-w-[500px] max-w-[700px] flex-1 flex flex-col min-h-[120px] justify-center relative">
        <LoadingSpinner size="md" text="Lade Text..." />
      </div>
    );
  }
  
  const text = data?.text || "Wir bieten elegantes Catering und exklusive Locations für unvergessliche Veranstaltungen.";

  return (
    <div className="border-none rounded-xl bg-gray-50 shadow-none p-6 min-w-[500px] max-w-[700px] flex-1 flex flex-col min-h-[120px] justify-center relative">
      <div className="text-2xl text-gray-600 leading-relaxed font-medium font-mono">
        {text}
      </div>
    </div>
  );
};

export default RawTextCard;
