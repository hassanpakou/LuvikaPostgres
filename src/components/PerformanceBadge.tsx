// src/components/PerformanceBadge.tsx
'use client';

import { useEffect, useState } from 'react';

export default function PerformanceBadge() {
  const [fps, setFps] = useState(60);
  const [memory, setMemory] = useState('N/A');

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const updateFps = () => {
      frameCount++;
      const now = performance.now();
      const elapsed = (now - lastTime) / 1000;
      
      if (elapsed >= 1) {
        setFps(Math.round(frameCount / elapsed));
        frameCount = 0;
        lastTime = now;
      }
      
      requestAnimationFrame(updateFps);
    };
    
    updateFps();

    // Mémoire (si disponible)
    if (typeof (window as any).performance !== 'undefined' && 
        (window as any).performance.memory) {
      const mem = (window as any).performance.memory;
      setMemory(((mem.usedJSHeapSize / 1024 / 1024).toFixed(1)) + 'MB');
    }
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="glass-border rounded-lg p-2 border border-purple-500/30 bg-black/50 backdrop-blur text-xs text-purple-300 font-mono">
        <div className="flex gap-3">
          <span>FPS: {fps}</span>
          {memory !== 'N/A' && <span>MEM: {memory}</span>}
        </div>
      </div>
    </div>
  );
}