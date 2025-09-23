"use client";
import React from "react";
import LoadingSpinner from "./LoadingSpinner";

interface DataLoadingStateProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
  className?: string;
}

const DataLoadingState: React.FC<DataLoadingStateProps> = ({
  message = "Lade Daten...",
  showProgress = false,
  progress = 0,
  className = ""
}) => {
  return (
    <div className={`bg-gray-50 rounded-lg border border-gray-200 p-8 ${className}`}>
      <div className="text-center">
        <LoadingSpinner size="lg" text="" />
        
        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {message}
          </h3>
          
          {showProgress && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              ></div>
            </div>
          )}
          
          <p className="text-sm text-gray-600">
            Bitte warten Sie, während die Daten verarbeitet werden...
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataLoadingState;
