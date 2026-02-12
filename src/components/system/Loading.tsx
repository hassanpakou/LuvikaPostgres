'use client';

import React from 'react';

export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4 flex justify-center">
      <div className="w-full max-w-md">
        {/* Bulle glassmorphism */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col items-center text-center">
            {/* Boule circulaire */}
            <div className="relative w-20 h-20 mb-6">
              {/* Cercle externe */}
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20"></div>
              {/* Aiguille qui tourne */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[2px] h-8 bg-gradient-to-b from-cyan-300 to-blue-500 origin-bottom animate-spin-slow"></div>
              </div>
              {/* Cœur lumineux */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 blur-sm opacity-70 animate-pulse"></div>
              <div className="absolute inset-6 rounded-full bg-slate-950"></div>
            </div>
            {/* Texte */}
            <h3 className="text-lg font-semibold text-white mb-1">
              Chargement du profil…
            </h3>
            <p className="text-sm text-gray-400 mb-5">
              Récupération des données depuis la base sécurisée
            </p>
            {/* Barre de progression */}
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-progress"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
