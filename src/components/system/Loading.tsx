'use client';

import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-linear-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-linear-to-tr from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8">
        {/* Logo with glow effect */}
        <div className="relative">
          {/* Glow background */}
          <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Logo container */}
          <div className="relative bg-linear-to-br from-blue-500 to-purple-600 rounded-full p-6 shadow-2xl">
            <svg
              className="w-16 h-16 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
          </div>
        </div>

        {/* Spinner */}
        <div className="relative w-16 h-16">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin" />
          
          {/* Middle ring */}
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-cyan-500 animate-spin reverse" style={{
            animation: 'spin 2s linear infinite reverse'
          }} />
          
          {/* Inner dot */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-linear-to-r from-blue-500 to-purple-500 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg" />
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold bg-linear-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            LUVIKA
          </h2>
          <p className="text-sm text-gray-400">Révèle qui tu es...</p>
          
          {/* Animated dots */}
          <div className="flex items-center justify-center gap-1 pt-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-100" />
            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse delay-200" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(-360deg);
          }
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        .delay-100 {
          animation-delay: 100ms;
        }
        .delay-200 {
          animation-delay: 200ms;
        }
        .reverse {
          animation-direction: reverse;
        }
      `}</style>
    </div>
  );
}
