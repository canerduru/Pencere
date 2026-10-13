import React, { useEffect, useRef } from 'react';
import { MotionIntensity, ParticleType, SceneConfig } from '../types';
import { ambientAudio } from '../audio/ambientAudio';

interface AtmosphereCanvasProps {
  scene: SceneConfig;
  motionIntensity: MotionIntensity;
  isPaused: boolean;
  onTapScene?: (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  rotation: number;
  vRot: number;
  life: number;
  maxLife: number;
  phase: number;
  type: string;
}

interface SteamWisp {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  growth: number;
  life: number;
  maxLife: number;
}

interface TapEffect {
  x: number;
  y: number;
  type: string;
  progress: number; // 0 to 1
  duration: number; // seconds
}

export const AtmosphereCanvas: React.FC<AtmosphereCanvasProps> = ({
  scene,
  motionIntensity,
  isPaused,
  onTapScene,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const steamRef = useRef<SteamWisp[]>([]);
  const tapEffectsRef = useRef<TapEffect[]>([]);

  // Count & speed dampening based on user settings
  const countFactor = motionIntensity === 'dusuk' ? 0.4 : motionIntensity === 'orta' ? 0.75 : 1.0;
  const speedFactor = motionIntensity === 'dusuk' ? 0.45 : motionIntensity === 'orta' ? 0.8 : 1.0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Initialize dust motes
    const dustCount = Math.floor(22 * countFactor);
    const initialParticles: Particle[] = [];

    for (let i = 0; i < dustCount; i++) {
      initialParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.48) * 6 * speedFactor,
        vy: (Math.random() - 0.52) * 5 * speedFactor,
        size: 1.0 + Math.random() * 2.0,
        alpha: 0.08 + Math.random() * 0.15,
        maxAlpha: 0.25,
        rotation: 0,
        vRot: 0,
        life: 0,
        maxLife: 9999,
        phase: Math.random() * Math.PI * 2,
        type: 'dust',
      });
    }

    // Initialize Scene particles
    initSceneParticles(scene.particleType, initialParticles, width, height, countFactor, speedFactor);
    particlesRef.current = initialParticles;

    let lastTime = performance.now();

    const render = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, width, height);

        if (!isPaused) {
          // 1. Soft sunlight shafts / rays
          drawLightRays(ctx, width, height, currentTime, motionIntensity);

          // 2. Scene particles
          drawAndStepParticles(ctx, particlesRef.current, width, height, dt, speedFactor, scene.particleType);

          // 3. Steam rising from mugs
          drawAndStepSteam(ctx, steamRef.current, width, height, dt, speedFactor, scene);

          // 4. Tap feedback animations
          drawAndStepTapEffects(ctx, tapEffectsRef.current, width, height, dt);
        }
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [scene, motionIntensity, isPaused, countFactor, speedFactor]);

  // Handle Canvas Tap
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    triggerInteraction(e.clientX, e.clientY);
    onTapScene?.(e);
  };

  const handleCanvasTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      triggerInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
    onTapScene?.(e);
  };

  const triggerInteraction = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const xPct = (x / rect.width) * 100;
    const yPct = (y / rect.height) * 100;

    // 1. Check if near Mug Hotspot
    const mug = scene.steamHotspots.find(
      (h) => Math.hypot(h.x - xPct, h.y - yPct) < 9
    );
    if (mug) {
      // Gentle extra puff of steam
      const mugX = (mug.x / 100) * canvas.width;
      const mugY = (mug.y / 100) * canvas.height;
      for (let i = 0; i < 6; i++) {
        steamRef.current.push({
          x: mugX + (Math.random() - 0.5) * 10,
          y: mugY - 8,
          vx: (Math.random() - 0.5) * 8,
          vy: -18 - Math.random() * 15,
          size: 7 + Math.random() * 6,
          alpha: 0.05,
          maxAlpha: 0.28,
          growth: 7 + Math.random() * 5,
          life: 0,
          maxLife: 2.8 + Math.random() * 1.2,
        });
      }
      return;
    }

    // 2. Check if near Plant Hotspot
    const plant = scene.plantHotspots.find(
      (h) => Math.hypot(h.x - xPct, h.y - yPct) < 11
    );
    if (plant) {
      const plantX = (plant.x / 100) * canvas.width;
      const plantY = (plant.y / 100) * canvas.height;
      tapEffectsRef.current.push({
        x: plantX,
        y: plantY,
        type: 'plant_leaf',
        progress: 0,
        duration: 3.0,
      });
      ambientAudio.triggerGentleWaterRipple();
      return;
    }

    // 3. Check Curtain zones
    const isCurtain =
      xPct <= scene.curtainRegions.left.maxX ||
      xPct >= scene.curtainRegions.right.minX;
    if (isCurtain) {
      tapEffectsRef.current.push({
        x,
        y,
        type: 'curtain_flutter',
        progress: 0,
        duration: 2.5,
      });
      return;
    }

    // 4. Outside view tap
    tapEffectsRef.current.push({
      x,
      y,
      type: scene.tapEffectType,
      progress: 0,
      duration: scene.tapEffectType === 'shooting_star' ? 1.6 : 3.6,
    });

    if (scene.tapEffectType === 'ripples') {
      ambientAudio.triggerGentleWaterRipple();
    } else if (scene.tapEffectType === 'birds') {
      ambientAudio.triggerSoftBirdChirp();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      onTouchStart={handleCanvasTouch}
      className="absolute inset-0 z-20 w-full h-full pointer-events-auto touch-manipulation cursor-pointer"
      style={{ touchAction: 'manipulation' }}
    />
  );
};

// Helper: Setup scene particles
function initSceneParticles(
  type: ParticleType,
  arr: Particle[],
  width: number,
  height: number,
  countFactor: number,
  speedFactor: number
) {
  if (type === 'petals') {
    const count = Math.floor(20 * countFactor);
    for (let i = 0; i < count; i++) {
      arr.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (12 + Math.random() * 18) * speedFactor,
        vy: (15 + Math.random() * 20) * speedFactor,
        size: 5 + Math.random() * 5,
        alpha: 0.35 + Math.random() * 0.3,
        maxAlpha: 0.65,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 1.8,
        life: 0,
        maxLife: 20,
        phase: Math.random() * Math.PI * 2,
        type: 'petal',
      });
    }
  } else if (type === 'fireflies') {
    const count = Math.floor(18 * countFactor);
    for (let i = 0; i < count; i++) {
      arr.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.75),
        vx: (Math.random() - 0.5) * 12 * speedFactor,
        vy: (Math.random() - 0.5) * 10 * speedFactor,
        size: 2.2 + Math.random() * 2.2,
        alpha: 0.1,
        maxAlpha: 0.8,
        rotation: 0,
        vRot: 0,
        life: 0,
        maxLife: 15,
        phase: Math.random() * Math.PI * 2,
        type: 'firefly',
      });
    }
  } else if (type === 'rain') {
    const count = Math.floor(35 * countFactor);
    for (let i = 0; i < count; i++) {
      arr.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: -14 * speedFactor,
        vy: (120 + Math.random() * 60) * speedFactor,
        size: 1.2,
        alpha: 0.12 + Math.random() * 0.18,
        maxAlpha: 0.3,
        rotation: 0,
        vRot: 0,
        life: 0,
        maxLife: 10,
        phase: Math.random(),
        type: 'rain',
      });
    }
  } else if (type === 'snow') {
    const count = Math.floor(28 * countFactor);
    for (let i = 0; i < count; i++) {
      arr.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 10 * speedFactor,
        vy: (14 + Math.random() * 20) * speedFactor,
        size: 2.2 + Math.random() * 2.5,
        alpha: 0.2 + Math.random() * 0.3,
        maxAlpha: 0.5,
        rotation: 0,
        vRot: 0,
        life: 0,
        maxLife: 20,
        phase: Math.random() * Math.PI * 2,
        type: 'snow',
      });
    }
  } else if (type === 'balloons') {
    for (let i = 0; i < 3; i++) {
      arr.push({
        x: width * 0.25 + i * (width * 0.24) + (Math.random() - 0.5) * 40,
        y: height * 0.26 + (Math.random() - 0.5) * 30,
        vx: (1.5 + Math.random() * 1.5) * speedFactor,
        vy: -(1.2 + Math.random() * 1.2) * speedFactor,
        size: 12 + Math.random() * 6,
        alpha: 0.5,
        maxAlpha: 0.65,
        rotation: 0,
        vRot: 0,
        life: 0,
        maxLife: 60,
        phase: i * 2,
        type: 'balloon',
      });
    }
  } else if (type === 'sea_sparkle') {
    const count = Math.floor(18 * countFactor);
    for (let i = 0; i < count; i++) {
      arr.push({
        x: width * 0.15 + Math.random() * (width * 0.7),
        y: height * 0.38 + Math.random() * (height * 0.22),
        vx: 0,
        vy: 0,
        size: 1.5 + Math.random() * 2.2,
        alpha: 0.1,
        maxAlpha: 0.7,
        rotation: 0,
        vRot: 0,
        life: 0,
        maxLife: 3 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2,
        type: 'sea_sparkle',
      });
    }
  } else if (type === 'birds' || type === 'clouds') {
    arr.push({
      x: -40,
      y: height * 0.24 + Math.random() * 40,
      vx: 16 * speedFactor,
      vy: 1.2 * speedFactor,
      size: 7,
      alpha: 0.45,
      maxAlpha: 0.5,
      rotation: 0,
      vRot: 0,
      life: 0,
      maxLife: 50,
      phase: 0,
      type: 'bird',
    });
  }
}

// Draw subtle sunlight shafts
function drawLightRays(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  motionIntensity: MotionIntensity
) {
  if (motionIntensity === 'dusuk') return;
  const t = time * 0.00025;
  const alpha = 0.03 + Math.sin(t) * 0.012;

  ctx.save();
  const grad = ctx.createLinearGradient(0, 0, width * 0.75, height);
  grad.addColorStop(0, `rgba(255, 246, 218, ${alpha * 1.5})`);
  grad.addColorStop(0.5, `rgba(255, 240, 200, ${alpha})`);
  grad.addColorStop(1, 'rgba(255, 240, 200, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(width * 0.12, 0);
  ctx.lineTo(width * 0.48, 0);
  ctx.lineTo(width * 0.88, height);
  ctx.lineTo(width * 0.45, height);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Particle update and draw loop
function drawAndStepParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  width: number,
  height: number,
  dt: number,
  speedFactor: number,
  particleType: ParticleType
) {
  particles.forEach((p) => {
    p.life += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rotation += p.vRot * dt;

    if (p.type === 'dust') {
      // Gentle Brownian wobble
      p.x += Math.sin(p.life * 0.8 + p.phase) * 0.3;
      p.y += Math.cos(p.life * 0.7 + p.phase) * 0.25;

      // Wrap around screen
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      const alpha = p.alpha * (0.8 + Math.sin(p.life * 1.5 + p.phase) * 0.2);
      ctx.fillStyle = `rgba(255, 245, 220, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'petal') {
      // Gentle sway
      p.x += Math.sin(p.life * 1.2 + p.phase) * 1.5;
      if (p.y > height + 20) {
        p.y = -20;
        p.x = Math.random() * width;
      }
      if (p.x > width + 20) p.x = -20;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = `rgba(255, 185, 205, ${p.alpha})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 1.4, p.size * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (p.type === 'firefly') {
      p.x += Math.sin(p.life * 0.9 + p.phase) * 0.8;
      p.y += Math.cos(p.life * 0.8 + p.phase) * 0.8;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height * 0.75;
      if (p.y > height * 0.75) p.y = 0;

      const pulse = Math.max(0, Math.sin(p.life * 2 + p.phase));
      const curAlpha = p.maxAlpha * pulse;

      // Glow
      ctx.save();
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
      glow.addColorStop(0, `rgba(220, 255, 170, ${curAlpha})`);
      glow.addColorStop(0.4, `rgba(180, 245, 120, ${curAlpha * 0.4})`);
      glow.addColorStop(1, 'rgba(180, 245, 120, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (p.type === 'rain') {
      if (p.y > height + 10) {
        p.y = -10;
        p.x = Math.random() * width;
      }
      ctx.strokeStyle = `rgba(215, 230, 245, ${p.alpha})`;
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - 3, p.y + 12);
      ctx.stroke();
    } else if (p.type === 'snow') {
      p.x += Math.sin(p.life * 0.8 + p.phase) * 0.8;
      if (p.y > height + 10) {
        p.y = -10;
        p.x = Math.random() * width;
      }
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'balloon') {
      p.x += Math.sin(p.life * 0.4 + p.phase) * 0.4;
      if (p.y < height * 0.15) {
        p.y = height * 0.35;
        p.x = Math.random() * (width * 0.7);
      }
      // Draw tiny calm hot air balloon
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = `rgba(235, 180, 140, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.7, 0, Math.PI * 2);
      ctx.fill();
      // Little basket
      ctx.fillStyle = `rgba(140, 90, 60, ${p.alpha * 0.9})`;
      ctx.fillRect(-p.size * 0.2, p.size * 0.85, p.size * 0.4, p.size * 0.3);
      ctx.restore();
    } else if (p.type === 'sea_sparkle') {
      const pulse = Math.max(0, Math.sin(p.life * 1.8 + p.phase));
      if (pulse > 0.05) {
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${pulse * p.maxAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.8 + pulse * 0.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    } else if (p.type === 'bird') {
      if (p.x > width + 60) {
        p.x = -60;
        p.y = height * 0.2 + Math.random() * (height * 0.15);
      }
      // Draw subtle bird silhouette with gentle flap
      const flap = Math.sin(p.life * 4) * 2;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.strokeStyle = `rgba(60, 50, 45, ${p.alpha})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-p.size, flap);
      ctx.quadraticCurveTo(-p.size * 0.3, -flap * 1.5, 0, 0);
      ctx.quadraticCurveTo(p.size * 0.3, -flap * 1.5, p.size, flap);
      ctx.stroke();
      ctx.restore();
    }
  });
}

// Steam physics and soft rendering
function drawAndStepSteam(
  ctx: CanvasRenderingContext2D,
  steamList: SteamWisp[],
  width: number,
  height: number,
  dt: number,
  speedFactor: number,
  scene: SceneConfig
) {
  // Periodically generate soft wisps from mug hotspots
  if (Math.random() < 0.035 * speedFactor) {
    scene.steamHotspots.forEach((mug) => {
      const mugX = (mug.x / 100) * width;
      const mugY = (mug.y / 100) * height;

      steamList.push({
        x: mugX + (Math.random() - 0.5) * 8,
        y: mugY - 8,
        vx: (Math.random() - 0.5) * 6,
        vy: -14 - Math.random() * 12,
        size: 5 + Math.random() * 4,
        alpha: 0.04,
        maxAlpha: 0.22,
        growth: 6 + Math.random() * 4,
        life: 0,
        maxLife: 3.2 + Math.random() * 1.2,
      });
    });
  }

  // Step and draw existing steam
  for (let i = steamList.length - 1; i >= 0; i--) {
    const s = steamList[i];
    s.life += dt;
    if (s.life >= s.maxLife) {
      steamList.splice(i, 1);
      continue;
    }

    const t = s.life / s.maxLife; // 0 to 1
    s.x += (s.vx + Math.sin(s.life * 1.8) * 4) * dt;
    s.y += s.vy * dt;
    const curSize = s.size + s.growth * t * 4;

    // Bell curve alpha
    const alphaCurve = Math.sin(t * Math.PI);
    const alpha = s.maxAlpha * alphaCurve;

    ctx.save();
    const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, curSize);
    grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
    grad.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.5})`);
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(s.x, s.y, curSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Tap effects renderer
function drawAndStepTapEffects(
  ctx: CanvasRenderingContext2D,
  effects: TapEffect[],
  width: number,
  height: number,
  dt: number
) {
  for (let i = effects.length - 1; i >= 0; i--) {
    const ef = effects[i];
    ef.progress += dt / ef.duration;
    if (ef.progress >= 1.0) {
      effects.splice(i, 1);
      continue;
    }

    const p = ef.progress; // 0 to 1
    const fade = Math.sin(p * Math.PI);

    if (ef.type === 'flowers') {
      // Painted soft flower blooms up
      const flowerSize = 14 * Math.sin(p * Math.PI * 0.7);
      ctx.save();
      ctx.translate(ef.x, ef.y);
      ctx.fillStyle = `rgba(240, 160, 180, ${fade * 0.85})`;
      for (let k = 0; k < 5; k++) {
        ctx.rotate((Math.PI * 2) / 5);
        ctx.beginPath();
        ctx.ellipse(0, flowerSize * 0.7, flowerSize * 0.4, flowerSize * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = `rgba(255, 230, 120, ${fade * 0.9})`;
      ctx.beginPath();
      ctx.arc(0, 0, flowerSize * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (ef.type === 'ripples') {
      // Soft spreading water ripple
      const r = 20 + p * 80;
      ctx.save();
      ctx.strokeStyle = `rgba(255, 255, 255, ${fade * 0.5})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(ef.x, ef.y, r * 1.6, r * 0.6, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Distant dolphin arc jumping on second half
      if (p > 0.2 && p < 0.8) {
        const dProg = (p - 0.2) / 0.6; // 0 to 1
        const dX = ef.x + (dProg - 0.5) * 60;
        const dY = ef.y - 15 - Math.sin(dProg * Math.PI) * 20;
        ctx.fillStyle = `rgba(45, 95, 120, ${Math.sin(dProg * Math.PI) * 0.6})`;
        ctx.beginPath();
        ctx.ellipse(dX, dY, 6, 2.5, (dProg - 0.5) * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (ef.type === 'shooting_star') {
      // Soft shooting star streak across night sky
      const startX = ef.x - 40;
      const startY = ef.y - 30;
      const endX = ef.x + p * 90;
      const endY = ef.y + p * 60;

      ctx.save();
      const grad = ctx.createLinearGradient(startX, startY, endX, endY);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(0.7, `rgba(220, 245, 255, ${fade * 0.6})`);
      grad.addColorStop(1, `rgba(255, 255, 255, ${fade * 0.95})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.restore();
    } else if (ef.type === 'plant_leaf') {
      // Unfurling tiny leaf
      const leafScale = Math.sin(p * Math.PI * 0.6);
      ctx.save();
      ctx.translate(ef.x, ef.y - 6);
      ctx.rotate(-0.3 + p * 0.2);
      ctx.fillStyle = `rgba(120, 185, 95, ${fade * 0.85})`;
      ctx.beginPath();
      ctx.ellipse(0, -8 * leafScale, 4 * leafScale, 9 * leafScale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (ef.type === 'rain_glow') {
      // Warm golden glow blooming in rain
      const r = 25 + p * 75;
      ctx.save();
      const glow = ctx.createRadialGradient(ef.x, ef.y, 0, ef.x, ef.y, r);
      glow.addColorStop(0, `rgba(255, 240, 190, ${fade * 0.35})`);
      glow.addColorStop(0.7, `rgba(255, 220, 160, ${fade * 0.15})`);
      glow.addColorStop(1, 'rgba(255, 220, 160, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(ef.x, ef.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (ef.type === 'curtain_flutter') {
      // Gentle ripple on curtain edge
      const wave = Math.sin(p * Math.PI * 3) * (1 - p) * 12;
      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${fade * 0.15})`;
      ctx.beginPath();
      ctx.ellipse(ef.x + wave, ef.y, 16, 50, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
