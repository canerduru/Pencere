import React from 'react';
import { X } from 'lucide-react';

interface GroundingPromptProps {
  onDismiss: () => void;
}

export const GroundingPrompt: React.FC<GroundingPromptProps> = ({ onDismiss }) => {
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 max-w-sm w-[90%] pointer-events-auto select-none transition-all duration-700 animate-fade-in">
      <div className="bg-stone-900/80 backdrop-blur-md border border-stone-700/50 rounded-2xl px-5 py-4 shadow-2xl flex items-center justify-between text-stone-200">
        <div className="pr-3">
          <p className="text-xs sm:text-sm font-light tracking-wide text-stone-200 leading-relaxed">
            Biraz da çevrene bak. Gördüğün 3 şeyi say.
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
          title="Kapat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
