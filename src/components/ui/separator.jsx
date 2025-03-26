import React from "react";

export function Separator({ className = "", ...props }) {
  return (
    <div
      className={`border-t border-gray-300 my-4 ${className}`}
      {...props}
    />
  );
}
