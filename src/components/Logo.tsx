import React from 'react'

export default function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Outer circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="#4F46E5"
          className="drop-shadow-lg"
        />
        
        {/* Purple accent */}
        <path
          d="M 50 5 A 45 45 0 0 1 95 50 L 50 50 Z"
          fill="#8B5CF6"
        />
        
        {/* Inner white circle */}
        <circle
          cx="50"
          cy="50"
          r="30"
          fill="white"
        />
        
        {/* Arrow pointing right */}
        <path
          d="M 40 35 L 55 50 L 40 65 L 45 50 Z"
          fill="#4F46E5"
        />
        <path
          d="M 45 45 L 65 45 L 65 55 L 45 55 Z"
          fill="#4F46E5"
        />
      </svg>
    </div>
  )
}