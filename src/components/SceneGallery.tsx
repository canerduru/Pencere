import React, { useRef } from 'react';
import { X, Shuffle, Upload, Check } from 'lucide-react';
import { SceneConfig } from '../types';

interface SceneGalleryProps {
  scenes: SceneConfig[];
  currentSceneId: string;
  autoCycle: boolean;
  customImages: Record<string, string>;
  onSelectScene: (scene: SceneConfig) => void;
  onRandomScene: () => void;
  onToggleAutoCycle: () => void;
  onUploadCustomImages: (files: FileList | File[]) => void;
  onClose: () => void;
}

export const SceneGallery: React.FC<SceneGalleryProps> = ({
  scenes,
  currentSceneId,
  autoCycle,
  customImages,
  onSelectScene,
  onRandomScene,
  onToggleAutoCycle,
  onUploadCustomImages,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadCustomImages(e.target.files);
    }
  };

  const loadedCount = Object.keys(customImages).length;

  return (
    <div
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      className="fixed inset-x-0 bottom-0 z-45 bg-stone-950/92 backdrop-blur-md border-t border-stone-800/80 p-4 sm:p-6 text-stone-200 select-none animate-slide-up"
    >
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium font-serif tracking-wider text-stone-200">
              14 Manzara
            </h3>
            <span className="text-xs text-stone-400 font-light">
              ({loadedCount > 0 ? `${loadedCount}/14 Fotoğraf Yüklendi` : 'Yatay kaydırarak geç'})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Fotoğrafları Ekle / Seç Butonu */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-900/60 hover:bg-amber-800/70 text-amber-200 rounded-full text-xs font-light border border-amber-700/60 transition-colors cursor-pointer shadow-sm"
              title="14 fotoğrafını seç"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Fotoğrafları Seç (14 Adet)</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Rastgele */}
            <button
              onClick={onRandomScene}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900/80 hover:bg-stone-800 rounded-full text-xs font-light tracking-wide text-stone-300 hover:text-stone-100 border border-stone-700/60 transition-colors cursor-pointer"
              title="Rastgele Manzara Seç"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Rastgele</span>
            </button>

            {/* Sürekli Gezdir */}
            <button
              onClick={onToggleAutoCycle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-light tracking-wide border transition-colors cursor-pointer ${
                autoCycle
                  ? 'bg-amber-950/60 text-amber-200 border-amber-600/60'
                  : 'bg-stone-900/80 text-stone-300 hover:text-stone-100 border-stone-700/60'
              }`}
            >
              <span>{autoCycle ? 'Gezdiriliyor' : 'Sürekli Gezdir'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thumbnail Row */}
        <div className="flex gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
          {scenes.map((scene) => {
            const isSelected = scene.id === currentSceneId;
            const hasCustomPhoto = !!customImages[scene.id];

            return (
              <button
                key={scene.id}
                onClick={() => onSelectScene(scene)}
                className={`flex-shrink-0 group relative w-36 sm:w-44 h-24 rounded-xl overflow-hidden border text-left transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'border-amber-400/90 shadow-md shadow-amber-950/40 scale-102 ring-1 ring-amber-400/50'
                    : 'border-stone-800 hover:border-stone-600 opacity-80 hover:opacity-100'
                }`}
              >
                {/* Background Image / Fallback */}
                <div
                  className="absolute inset-0 w-full h-full"
                  style={{
                    backgroundColor: scene.palette.landscapePrimary,
                    background: `linear-gradient(135deg, ${scene.palette.skyTop} 0%, ${scene.palette.landscapePrimary} 100%)`,
                  }}
                >
                  <img
                    src={customImages[scene.id] || scene.imagePath}
                    alt={scene.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>

                {/* Photo indicator badge */}
                {hasCustomPhoto && (
                  <div className="absolute top-1.5 right-1.5 z-10 bg-amber-500/80 text-stone-950 p-0.5 rounded-full">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                )}

                {/* Gradient text overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent p-2.5 flex flex-col justify-end">
                  <span className="text-xs font-medium text-stone-100 leading-tight">
                    {scene.name}
                  </span>
                  <span className="text-[10px] text-stone-400 font-light truncate">
                    {scene.country}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
