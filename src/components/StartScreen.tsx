import React from 'react';

interface StartScreenProps {
  onStart: () => void;
  onUploadCustomImages?: (files: FileList | File[]) => void;
  customPhotosCount?: number;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStart,
  onUploadCustomImages,
  customPhotosCount = 0,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-stone-950/85 backdrop-blur-md text-stone-100 select-none px-6">
      <div className="max-w-md w-full flex flex-col items-center text-center space-y-6">
        {/* Soft Minimal Window Icon Silhouette */}
        <div className="w-16 h-16 rounded-2xl border border-stone-700/60 flex items-center justify-center p-3.5 bg-stone-900/60 shadow-xl">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full text-stone-300"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="12" y1="3" x2="12" y2="21" />
            <line x1="3" y1="12" x2="21" y2="12" />
          </svg>
        </div>

        {/* Title & Quiet Subtitle */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-light tracking-wide font-serif text-stone-100">
            Pencere
          </h1>
          <p className="text-sm sm:text-base font-light text-stone-400 tracking-wide leading-relaxed">
            Dışarı bak. Yavaşça nefes ver.
          </p>
        </div>

        {/* Start Button */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={onStart}
            className="group relative inline-flex items-center justify-center px-9 py-3 text-sm font-medium tracking-wider text-stone-200 transition-all duration-300 bg-stone-900/90 hover:bg-stone-800/90 active:scale-98 rounded-full border border-stone-700/70 hover:border-stone-500 shadow-lg cursor-pointer"
          >
            <span>Başla</span>
          </button>

          {/* Optional photo import shortcut */}
          {onUploadCustomImages && (
            <div className="pt-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-amber-300/80 hover:text-amber-200 underline underline-offset-4 font-light transition-colors cursor-pointer"
              >
                {customPhotosCount > 0
                  ? `✓ ${customPhotosCount}/14 Fotoğraf Yüklendi (Değiştir)`
                  : 'Fotoğraflarını Seç (14 Adet)'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => e.target.files && onUploadCustomImages(e.target.files)}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Quiet footnote */}
        <p className="text-[11px] font-light text-stone-500 tracking-wide pt-2">
          Rahatlama ve farkındalık alanı · Sesler usulca başlayacaktır
        </p>
      </div>
    </div>
  );
};
