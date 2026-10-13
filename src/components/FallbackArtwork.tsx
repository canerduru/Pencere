import React from 'react';
import { SceneConfig } from '../types';

interface FallbackArtworkProps {
  scene: SceneConfig;
}

export const FallbackArtwork: React.FC<FallbackArtworkProps> = ({ scene }) => {
  const { palette } = scene;

  return (
    <div className="absolute inset-0 w-full h-full select-none overflow-hidden">
      <svg
        className="w-full h-full object-cover"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Sky Gradient */}
          <linearGradient id={`sky-${scene.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={palette.skyTop} />
            <stop offset="100%" stopColor={palette.skyBottom} />
          </linearGradient>

          {/* Wooden Window Frame Gradient */}
          <linearGradient id="wood-frame" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#432818" />
            <stop offset="40%" stopColor="#5c3a21" />
            <stop offset="100%" stopColor="#372013" />
          </linearGradient>

          {/* Wooden Window Sill Gradient */}
          <linearGradient id="wood-sill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8d5b38" />
            <stop offset="15%" stopColor="#6c4428" />
            <stop offset="70%" stopColor="#51331d" />
            <stop offset="100%" stopColor="#392212" />
          </linearGradient>

          {/* Sunbeam on Sill */}
          <linearGradient id="sun-shadow" x1="0%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#fae0a2" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#fae0a2" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#51331d" stopOpacity="0" />
          </linearGradient>

          {/* Curtain Gradient Left */}
          <linearGradient id="curtain-left-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={palette.curtainColor} stopOpacity="0.95" />
            <stop offset="60%" stopColor={palette.curtainColor} stopOpacity="0.75" />
            <stop offset="90%" stopColor={palette.curtainColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={palette.curtainColor} stopOpacity="0.0" />
          </linearGradient>

          {/* Curtain Gradient Right */}
          <linearGradient id="curtain-right-grad" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={palette.curtainColor} stopOpacity="0.95" />
            <stop offset="60%" stopColor={palette.curtainColor} stopOpacity="0.75" />
            <stop offset="90%" stopColor={palette.curtainColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={palette.curtainColor} stopOpacity="0.0" />
          </linearGradient>

          {/* Soft blur filter for distant mountains/atmosphere */}
          <filter id="soft-dist" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
        </defs>

        {/* 1. OUTSIDE SKY */}
        <rect x="0" y="0" width="1600" height="900" fill={`url(#sky-${scene.id})`} />

        {/* 2. OUTSIDE SCENE ARTWORK PER SCENE TYPE */}
        {renderSceneBackdrop(scene)}

        {/* 3. WINDOW GLASS PANE SOFT SHINE */}
        <rect x="230" y="30" width="1140" height="690" fill="#ffffff" fillOpacity="0.04" />
        <line x1="280" y1="50" x2="680" y2="700" stroke="#ffffff" strokeOpacity="0.07" strokeWidth="3" />
        <line x1="900" y1="50" x2="1300" y2="700" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="2" />

        {/* 4. MAIN HEAVY TIMBER WINDOW FRAME */}
        {/* Outer Room Walls */}
        <rect x="0" y="0" width="220" height="900" fill="#2d1c14" />
        <rect x="1380" y="0" width="220" height="900" fill="#2d1c14" />
        <rect x="0" y="0" width="1600" height="40" fill="#2d1c14" />

        {/* Window Wooden Outer Border */}
        <rect x="210" y="30" width="1180" height="710" fill="none" stroke="url(#wood-frame)" strokeWidth="36" rx="4" />

        {/* Center Vertical Wooden Mullions */}
        <rect x="585" y="45" width="28" height="680" fill="url(#wood-frame)" />
        <rect x="985" y="45" width="28" height="680" fill="url(#wood-frame)" />

        {/* Horizontal Wooden Transom Bar */}
        <rect x="220" y="190" width="1160" height="24" fill="url(#wood-frame)" />

        {/* Window Hardware (Center Latch) */}
        <rect x="990" y="340" width="18" height="65" rx="5" fill="#a3895c" />
        <circle cx="999" cy="372" r="5" fill="#5a472c" />

        {/* 5. BROAD COZY WOODEN WINDOW SILL */}
        <path
          d="M 120 710 L 1480 710 L 1520 750 L 1520 890 L 80 890 L 80 750 Z"
          fill="url(#wood-sill)"
        />
        {/* Sill Upper Lip Highlight */}
        <rect x="100" y="708" width="1400" height="5" fill="#b98256" fillOpacity="0.8" />
        {/* Sill Shadow Edge */}
        <rect x="80" y="750" width="1440" height="6" fill="#2b170c" />

        {/* Sunlight Shadow Patterns falling diagonally across the sill */}
        <polygon
          points="260,715 480,715 620,890 380,890"
          fill="url(#sun-shadow)"
        />
        <polygon
          points="680,715 920,715 1060,890 800,890"
          fill="url(#sun-shadow)"
        />
        <polygon
          points="1080,715 1320,715 1460,890 1200,890"
          fill="url(#sun-shadow)"
        />

        {/* 6. CERAMIC MUGS ON THE SILL */}
        {renderMugs(scene)}

        {/* 7. POTTED PLANTS ON THE SILL */}
        {renderPlants(scene)}

        {/* 8. LINEN CURTAINS HANGING ELEGANTLY ON LEFT AND RIGHT */}
        {/* Curtain Rod */}
        <rect x="60" y="22" width="1480" height="10" fill="#3a2315" rx="3" />
        <circle cx="65" cy="27" r="10" fill="#6d472c" />
        <circle cx="1535" cy="27" r="10" fill="#6d472c" />

        {/* Left Drapery Folds */}
        <path
          d="M 60 25 C 130 180, 70 420, 160 760 C 120 790, 80 820, 50 880 L 0 880 L 0 25 Z"
          fill="url(#curtain-left-grad)"
        />
        <path
          d="M 110 30 Q 150 350, 190 730"
          stroke="#ffffff"
          strokeOpacity="0.3"
          strokeWidth="6"
          fill="none"
        />

        {/* Right Drapery Folds */}
        <path
          d="M 1540 25 C 1470 180, 1530 420, 1440 760 C 1480 790, 1520 820, 1550 880 L 1600 880 L 1600 25 Z"
          fill="url(#curtain-right-grad)"
        />
        <path
          d="M 1490 30 Q 1450 350, 1410 730"
          stroke="#ffffff"
          strokeOpacity="0.3"
          strokeWidth="6"
          fill="none"
        />
      </svg>

      {/* Soft discrete note in Turkish if image file is not present */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-30 pointer-events-none opacity-40 hover:opacity-90 transition-opacity">
        <span className="text-[11px] font-light tracking-wider text-amber-100/90 bg-black/25 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
          İllüstrasyon Görünümü · {scene.name}
        </span>
      </div>
    </div>
  );
};

// Helper: Specific backdrop graphics for each landscape
function renderSceneBackdrop(scene: SceneConfig) {
  const { id, palette } = scene;
  const idLower = id.toLowerCase();

  if (idLower.includes('tuscany')) {
    return (
      <g>
        {/* Distant soft purple hills */}
        <path
          d="M 200 450 Q 550 380, 900 440 T 1400 400 L 1400 720 L 200 720 Z"
          fill="#c5af8a"
          opacity="0.6"
          filter="url(#soft-dist)"
        />
        {/* Rolling Golden Wheat Hills */}
        <path
          d="M 200 520 Q 500 440, 850 510 T 1400 460 L 1400 720 L 200 720 Z"
          fill={palette.landscapePrimary}
        />
        <path
          d="M 200 580 Q 650 510, 1100 560 T 1400 540 L 1400 720 L 200 720 Z"
          fill="#c8983e"
        />
        {/* Iconic Tuscan Cypress Trees */}
        {[380, 420, 470, 780, 810, 990, 1030, 1190, 1220].map((cx, i) => (
          <ellipse
            key={i}
            cx={cx}
            cy={500 + (i % 3) * 20}
            rx={9}
            ry={45 + (i % 2) * 15}
            fill="#2c472d"
          />
        ))}
        {/* Sun warm disk */}
        <circle cx="580" cy="240" r="48" fill="#fff5d0" opacity="0.85" />
      </g>
    );
  }

  if (idLower.includes('kyoto')) {
    return (
      <g>
        {/* Distant soft green hillside */}
        <path
          d="M 200 420 Q 600 360, 1000 410 T 1400 390 L 1400 720 L 200 720 Z"
          fill="#98b58f"
          opacity="0.6"
        />
        {/* Tranquil Pond */}
        <rect x="200" y="550" width="1200" height="170" fill="#6b9b94" />
        {/* Floating Petal reflections */}
        <ellipse cx="600" cy="620" rx="40" ry="12" fill="#e89cb2" opacity="0.4" />
        <ellipse cx="850" cy="650" rx="30" ry="8" fill="#e89cb2" opacity="0.4" />
        {/* Traditional Arched Wooden Bridge */}
        <path
          d="M 640 590 Q 800 530, 960 590"
          stroke="#824635"
          strokeWidth="12"
          fill="none"
        />
        <path
          d="M 650 595 L 650 630 M 750 565 L 750 630 M 850 565 L 850 630 M 950 595 L 950 630"
          stroke="#5c3023"
          strokeWidth="5"
        />
        {/* Lush Pink Sakura Blossom Canopy */}
        <circle cx="480" cy="280" r="140" fill="#f8b6cc" opacity="0.9" />
        <circle cx="360" cy="330" r="110" fill="#fbc3d4" opacity="0.85" />
        <circle cx="1180" cy="260" r="150" fill="#f8b6cc" opacity="0.9" />
        <circle cx="1280" cy="310" r="120" fill="#fbc3d4" opacity="0.85" />
      </g>
    );
  }

  if (idLower.includes('fjord')) {
    return (
      <g>
        {/* Majestic Misty Fjord Slopes */}
        <path
          d="M 200 240 L 480 500 L 750 360 L 850 490 L 200 720 Z"
          fill="#3e5b56"
        />
        <path
          d="M 800 320 L 1050 490 L 1400 220 L 1400 720 L 800 720 Z"
          fill="#314e49"
        />
        {/* Still deep turquoise Fjord Water */}
        <rect x="200" y="520" width="1200" height="200" fill="#3e6467" />
        {/* Water reflections */}
        <polygon points="1050,520 1200,520 1150,680 1020,680" fill="#2d484b" opacity="0.7" />
        {/* Tiny Red Norwegian Wooden Cabin */}
        <rect x="1080" y="500" width="48" height="32" fill="#aa382e" />
        <polygon points="1075,500 1104,475 1133,500" fill="#ffffff" />
        <rect x="1098" y="515" width="12" height="17" fill="#ffffff" />
      </g>
    );
  }

  if (idLower.includes('cappadocia')) {
    return (
      <g>
        {/* Soft pastel sunrise sky & fairy chimneys */}
        <path
          d="M 250 720 L 320 480 L 390 720 Z"
          fill="#d8b493"
        />
        <path
          d="M 520 720 L 590 420 L 670 720 Z"
          fill="#cda480"
        />
        <path
          d="M 890 720 L 970 440 L 1050 720 Z"
          fill="#caa07c"
        />
        {/* Hot Air Balloons in soft sky */}
        {[
          { cx: 480, cy: 260, r: 24, c: '#e58e65' },
          { cx: 720, cy: 200, r: 32, c: '#b86a88' },
          { cx: 1040, cy: 230, r: 28, c: '#e0b258' },
          { cx: 1220, cy: 310, r: 18, c: '#5f9fa3' },
        ].map((b, i) => (
          <g key={i}>
            <ellipse cx={b.cx} cy={b.cy} rx={b.r} ry={b.r * 1.25} fill={b.c} />
            <rect cx={b.cx - 4} x={b.cx - 5} y={b.cy + b.r * 1.3} width="10" height="8" rx="1" fill="#75482e" />
          </g>
        ))}
      </g>
    );
  }

  if (idLower.includes('aurora') || idLower.includes('iceland')) {
    return (
      <g>
        {/* Dark night sky with emerald aurora ribbon */}
        <path
          d="M 200 180 Q 500 120, 800 240 T 1400 160 L 1400 360 Q 900 320, 600 420 T 200 300 Z"
          fill="#27e29b"
          opacity="0.5"
          filter="url(#soft-dist)"
        />
        <path
          d="M 300 140 Q 700 80, 1100 200 T 1400 120"
          stroke="#4cf9b8"
          strokeWidth="35"
          opacity="0.4"
          filter="url(#soft-dist)"
        />
        {/* Stars */}
        {[320, 480, 620, 780, 940, 1120, 1260].map((sx, i) => (
          <circle key={i} cx={sx} cy={100 + (i % 4) * 35} r="1.8" fill="#ffffff" opacity="0.8" />
        ))}
        {/* Dark Sea & Ocean Coast */}
        <rect x="200" y="520" width="1200" height="200" fill="#0f1f25" />
        {/* Subtle white wave foam */}
        <path
          d="M 200 580 Q 550 560, 900 590 T 1400 570"
          stroke="#417382"
          strokeWidth="4"
          fill="none"
          opacity="0.6"
        />
      </g>
    );
  }

  // Default: Alps / Meadow
  return (
    <g>
      {/* Snowcapped Mountain Peaks */}
      <polygon points="400,500 620,240 850,500" fill="#a4bed0" />
      <polygon points="560,310 620,240 680,310" fill="#ffffff" />
      <polygon points="780,520 980,260 1200,520" fill="#93afc4" />
      <polygon points="920,335 980,260 1040,335" fill="#ffffff" />
      {/* Alpine Meadow with Wildflowers */}
      <path
        d="M 200 480 Q 600 420, 1000 460 T 1400 440 L 1400 720 L 200 720 Z"
        fill="#5a8b44"
      />
      {/* Wooden Meadow Fence */}
      <line x1="300" y1="560" x2="1300" y2="560" stroke="#7a5538" strokeWidth="6" />
      <line x1="300" y1="585" x2="1300" y2="585" stroke="#7a5538" strokeWidth="5" />
    </g>
  );
}

// Helper: Mugs on sill
function renderMugs(scene: SceneConfig) {
  return (
    <g>
      {/* Left White Ceramic Mug */}
      <g transform="translate(340, 715)">
        <ellipse cx="25" cy="5" rx="18" ry="6" fill="#dedede" />
        <rect x="7" y="5" width="36" height="50" rx="5" fill="#f4f4f4" />
        {/* Coffee/Tea surface */}
        <ellipse cx="25" cy="6" rx="14" ry="4" fill="#583722" />
        {/* Handle */}
        <path
          d="M 7 15 C -8 15, -8 40, 7 40"
          stroke="#e0e0e0"
          strokeWidth="7"
          fill="none"
        />
      </g>

      {/* Center/Right Teal/Blue Ceramic Mug */}
      <g transform="translate(1040, 716)">
        <ellipse cx="25" cy="5" rx="18" ry="6" fill="#4d7285" />
        <rect x="7" y="5" width="36" height="50" rx="5" fill="#5d889e" />
        <ellipse cx="25" cy="6" rx="14" ry="4" fill="#3c2415" />
        <path
          d="M 43 15 C 58 15, 58 40, 43 40"
          stroke="#5d889e"
          strokeWidth="7"
          fill="none"
        />
      </g>
    </g>
  );
}

// Helper: Plants on sill
function renderPlants(scene: SceneConfig) {
  return (
    <g>
      {/* Left Terracotta Plant Pot with Geranium Flowers */}
      <g transform="translate(250, 640)">
        {/* Pot */}
        <polygon points="20,110 80,110 72,145 28,145" fill="#b8603c" />
        <rect x="16" y="102" width="68" height="11" rx="2" fill="#cb7049" />
        {/* Plant Stems and Leaves */}
        <circle cx="35" cy="85" r="16" fill="#4e7f41" />
        <circle cx="65" cy="82" r="18" fill="#5b934d" />
        <circle cx="50" cy="70" r="16" fill="#437237" />
        {/* Red Flower Clusters */}
        <circle cx="32" cy="55" r="9" fill="#d93b3b" />
        <circle cx="62" cy="50" r="10" fill="#e54747" />
        <circle cx="48" cy="42" r="8" fill="#d93b3b" />
      </g>

      {/* Right Terracotta Pot with Succulent */}
      <g transform="translate(1180, 660)">
        <polygon points="25,90 75,90 68,125 32,125" fill="#aa5b39" />
        <rect x="20" y="83" width="60" height="9" rx="2" fill="#be6a46" />
        {/* Succulent rosettes */}
        <ellipse cx="50" cy="70" rx="22" ry="14" fill="#699b6f" />
        <ellipse cx="40" cy="62" rx="14" ry="10" fill="#7eb384" />
        <ellipse cx="60" cy="62" rx="14" ry="10" fill="#7eb384" />
        <ellipse cx="50" cy="54" rx="10" ry="8" fill="#99cca0" />
      </g>
    </g>
  );
}
