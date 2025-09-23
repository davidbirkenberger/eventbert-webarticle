"use client";
import React from "react";
import LoadingSpinner from "./LoadingSpinner";

interface DataErrorBoundaryProps {
  children: React.ReactNode;
  error?: string | null;
  loading?: boolean;
  fallback?: React.ReactNode;
}

const DataErrorBoundary: React.FC<DataErrorBoundaryProps> = ({
  children,
  error,
  loading = false,
  fallback,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" text="Lade Daten..." />
      </div>
    );
  }

  if (error) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Fehler beim Laden der Daten
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="text-sm font-medium text-red-800 hover:text-red-900 underline"
              >
                Seite neu laden
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default DataErrorBoundary;
