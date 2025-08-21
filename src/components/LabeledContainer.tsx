import React from 'react';

interface LabeledContainerProps {
  label: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const LabeledContainer: React.FC<LabeledContainerProps> = ({ label, children, style = {} }) => {
  return (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: 12,
      background: "#fff",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      padding: 24,
      width: "100%",
      ...style,
      position: "relative",
      overflow: "visible"
    }}>
      <div style={{ 
        fontSize: 12, 
        color: "#999", 
        position: "absolute",
        top: -8,
        left: 12,
        background: "#fff",
        padding: "0 8px",
        zIndex: 999,
        boxShadow: "0 0 0 2px #fff"
      }}>
        {label}
      </div>
      {children}
    </div>
  );
};

export default LabeledContainer; 