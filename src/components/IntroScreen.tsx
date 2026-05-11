import { useEffect, useRef, useState } from 'react';
import './IntroScreen.css';

type IntroPhase = 'mineral' | 'logo' | 'underline' | 'tagline' | 'fade';

type IntroScreenProps = {
  onDone: () => void;
};

type MineralPoint = {
  x: number;
  y: number;
  ox: number;
  oy: number;
  tx: number;
  ty: number;
  size: number;
  speed: number;
  red: number;
  alpha: number;
};

const TAGLINE = 'ADMIN';
const INTRO_DURATION_MS = 7200;

function easeInOutCubic(value: number) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export default function IntroScreen({ onDone }: IntroScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const phaseRef = useRef<IntroPhase>('mineral');
  const doneRef = useRef(false);
  const particlesRef = useRef<MineralPoint[]>([]);

  const [phase, setPhase] = useState<IntroPhase>('mineral');
  const [logoReveal, setLogoReveal] = useState(100);
  const [typedTagline, setTypedTagline] = useState('');
  const [logoFailed, setLogoFailed] = useState(false);
  const [processedLogoSrc, setProcessedLogoSrc] = useState<string | null>(null);

  const completeIntro = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const timeouts = [
      window.setTimeout(() => setPhase('logo'), 3100),
      window.setTimeout(() => setPhase('underline'), 4600),
      window.setTimeout(() => setPhase('tagline'), 4900),
      window.setTimeout(() => setPhase('fade'), 6500),
      window.setTimeout(completeIntro, INTRO_DURATION_MS),
      window.setTimeout(completeIntro, 8200),
    ];

    return () => {
      timeouts.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    let interval: number | undefined;
    const timer = window.setTimeout(() => {
      let step = 0;
      const totalSteps = 14;
      interval = window.setInterval(() => {
        step += 1;
        setLogoReveal(Math.max(0, 100 - (step / totalSteps) * 100));

        if (step >= totalSteps) {
          window.clearInterval(interval);
        }
      }, 130);
    }, 3100);

    return () => {
      window.clearTimeout(timer);
      if (interval !== undefined) {
        window.clearInterval(interval);
      }
    };
  }, []);

  useEffect(() => {
    if (phase !== 'tagline') return;

    let index = 0;
    setTypedTagline('');

    const interval = window.setInterval(() => {
      index += 1;
      setTypedTagline(TAGLINE.slice(0, index));

      if (index >= TAGLINE.length) {
        window.clearInterval(interval);
      }
    }, 130);

    return () => window.clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    const image = new Image();
    let cancelled = false;

    image.onload = () => {
      if (cancelled) return;

      try {
        const logoCanvas = document.createElement('canvas');
        const logoContext = logoCanvas.getContext('2d', { willReadFrequently: true });

        if (!logoContext) {
          setProcessedLogoSrc('/st-joseph-logo-transparent.png');
          return;
        }

        logoCanvas.width = image.naturalWidth;
        logoCanvas.height = image.naturalHeight;
        logoContext.drawImage(image, 0, 0);

        const imageData = logoContext.getImageData(0, 0, logoCanvas.width, logoCanvas.height);
        const { data } = imageData;

        for (let index = 0; index < data.length; index += 4) {
          const red = data[index];
          const green = data[index + 1];
          const blue = data[index + 2];
          const brightness = (red + green + blue) / 3;
          const colorSpread = Math.max(red, green, blue) - Math.min(red, green, blue);

          if (brightness > 238 && colorSpread < 28) {
            data[index + 3] = 0;
          } else if (brightness > 214 && colorSpread < 22) {
            data[index + 3] = Math.round(data[index + 3] * 0.16);
          }
        }

        logoContext.putImageData(imageData, 0, 0);
        setProcessedLogoSrc(logoCanvas.toDataURL('image/png'));
      } catch {
        setProcessedLogoSrc('/st-joseph-logo-transparent.png');
      }
    };

    image.onerror = () => {
      if (!cancelled) setLogoFailed(true);
    };

    image.src = '/st-joseph-logo-transparent.png';

    return () => {
      cancelled = true;
    };
  }, []);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      completeIntro();
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      completeIntro();
      return;
    }

    const buildParticles = () => {
      const rect = canvas.getBoundingClientRect();
      const count = Math.min(150, Math.max(70, Math.floor((rect.width * rect.height) / 11000)));
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      particlesRef.current = Array.from({ length: count }, (_, index) => {
        const angle = (index / count) * Math.PI * 2;
        const targetRadius = 44 + (index % 9) * 9;
        const targetWave = Math.sin(index * 2.7) * 18;
        const ox = Math.random() * rect.width;
        const oy = Math.random() * rect.height;

        return {
          x: ox,
          y: oy,
          ox,
          oy,
          tx: centerX + Math.cos(angle) * targetRadius + targetWave,
          ty: centerY + Math.sin(angle) * targetRadius * 0.34 + Math.cos(index) * 8,
          size: Math.random() * 1.7 + 0.35,
          speed: Math.random() * 0.35 + 0.65,
          red: Math.random(),
          alpha: Math.random() * 0.4 + 0.22,
        };
      });
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      buildParticles();
    };

    const drawVein = (
      elapsed: number,
      width: number,
      height: number,
      offset: number,
      color: string,
      alpha: number,
    ) => {
      const centerX = width / 2;
      const centerY = height / 2;
      const convergence = easeInOutCubic(clamp((elapsed - 1500) / 1500));
      const shimmer = Math.sin(elapsed * 0.0012 + offset) * 9;

      context.beginPath();
      for (let i = 0; i <= 8; i += 1) {
        const progress = i / 8;
        const fromLeft = offset % 2 === 0;
        const edgeX = fromLeft ? -width * 0.08 : width * 1.08;
        const baseY = height * (0.18 + ((offset * 0.17) % 0.58));
        const x = edgeX + (centerX - edgeX) * progress * (0.28 + convergence * 0.72);
        const y =
          baseY +
          (centerY - baseY) * progress * convergence +
          Math.sin(progress * Math.PI * 2 + elapsed * 0.0008 + offset) * (28 - convergence * 16) +
          shimmer;

        if (i === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }

      context.strokeStyle = color;
      context.globalAlpha = alpha * (0.34 + convergence * 0.66);
      context.lineWidth = 0.7 + convergence * 0.9;
      context.shadowColor = color;
      context.shadowBlur = 10 + convergence * 18;
      context.stroke();
      context.shadowBlur = 0;
      context.globalAlpha = 1;
    };

    const render = (now: number) => {
      if (!startTimeRef.current) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const convergence = easeInOutCubic(clamp((elapsed - 1200) / 1700));
      const fade = phaseRef.current === 'fade' ? clamp((elapsed - 6500) / 650) : 0;

      context.clearRect(0, 0, width, height);

      const gradient = context.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height));
      gradient.addColorStop(0, '#171111');
      gradient.addColorStop(0.46, '#0a0a0a');
      gradient.addColorStop(1, '#020202');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      context.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 9; i += 1) {
        drawVein(elapsed, width, height, i, i % 3 === 0 ? '#B91C1C' : i % 2 === 0 ? '#ffffff' : '#7F1D1D', i % 2 === 0 ? 0.12 : 0.22);
      }

      particlesRef.current.forEach((particle, index) => {
        const drift = Math.sin(elapsed * 0.0008 * particle.speed + index) * 12;
        const localConvergence = clamp(convergence * particle.speed);
        particle.x = particle.ox + (particle.tx - particle.ox) * localConvergence + drift * (1 - localConvergence);
        particle.y = particle.oy + (particle.ty - particle.oy) * localConvergence + Math.cos(elapsed * 0.001 + index) * 6 * (1 - localConvergence);

        const pulse = 0.8 + Math.sin(elapsed * 0.004 + index) * 0.2;
        context.beginPath();
        context.fillStyle = particle.red > 0.62 ? '#B91C1C' : particle.red > 0.34 ? '#7F1D1D' : '#ffffff';
        context.globalAlpha = particle.alpha * pulse * (1 - fade * 0.8);
        context.arc(particle.x, particle.y, particle.size + convergence * 0.35, 0, Math.PI * 2);
        context.fill();
      });

      context.globalCompositeOperation = 'source-over';
      context.globalAlpha = 0.26 * (1 - fade);
      context.fillStyle = '#ffffff';
      for (let i = 0; i < 34; i += 1) {
        const x = ((i * 271 + elapsed * 0.014) % (width + 80)) - 40;
        const y = (Math.sin(i * 7.3) * 0.5 + 0.5) * height;
        context.fillRect(x, y, i % 5 === 0 ? 1.7 : 0.8, 0.8);
      }

      context.globalAlpha = fade;
      context.fillStyle = '#000000';
      context.fillRect(0, 0, width, height);
      context.globalAlpha = 1;

      frameRef.current = window.requestAnimationFrame(render);
    };

    resize();
    window.addEventListener('resize', resize);
    frameRef.current = window.requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const showUnderline = phase === 'underline' || phase === 'tagline' || phase === 'fade';

  return (
    <div className={`sjg-intro sjg-intro--${phase}`} aria-hidden="true">
      <canvas ref={canvasRef} className="sjg-intro__canvas" />
      <div className="sjg-intro__vignette" />
      <div className="sjg-intro__brand">
        <div className="sjg-intro__logo-wrap">
          {logoFailed || !processedLogoSrc ? (
            <div className="sjg-intro__logo-fallback" style={{ clipPath: `inset(0 ${logoReveal}% 0 0)` }}>
              ST. JOSEPH GRANITE
            </div>
          ) : (
            <img
              className="sjg-intro__logo"
              src={processedLogoSrc}
              alt=""
              draggable="false"
              onError={() => setLogoFailed(true)}
              style={{ clipPath: `inset(0 ${logoReveal}% 0 0)` }}
            />
          )}
          <span className="sjg-intro__scan" style={{ left: `${100 - logoReveal}%` }} />
        </div>
        <div className={`sjg-intro__underline ${showUnderline ? 'sjg-intro__underline--active' : ''}`} />
        <div className="sjg-intro__tagline">
          {typedTagline}
          {phase === 'tagline' && typedTagline.length < TAGLINE.length ? <span className="sjg-intro__cursor">_</span> : null}
        </div>
      </div>
    </div>
  );
}
