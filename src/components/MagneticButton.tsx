import { useRef, ReactNode } from 'react';
import gsap from 'gsap';

function useMagnetic<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  const onMouseMove = (e: React.MouseEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    gsap.to(el, {
      x: (e.clientX - rect.left - rect.width / 2) * 0.28,
      y: (e.clientY - rect.top - rect.height / 2) * 0.28,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const onMouseLeave = () => {
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.65, ease: 'elastic.out(1, 0.4)' });
  };

  const onMouseDown = () => gsap.to(ref.current, { scale: 0.96, duration: 0.1 });
  const onMouseUp = () => gsap.to(ref.current, { scale: 1, duration: 0.2, ease: 'back.out(2)' });

  return { ref, onMouseMove, onMouseLeave, onMouseDown, onMouseUp };
}

interface BtnProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

export function MagneticButton({ children, className, onClick, type = 'button', disabled }: BtnProps) {
  const { ref, onMouseMove, onMouseLeave, onMouseDown, onMouseUp } = useMagnetic<HTMLButtonElement>();
  return (
    <button
      ref={ref}
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      {children}
    </button>
  );
}

interface AnchorProps {
  children: ReactNode;
  className?: string;
  href: string;
}

export function MagneticAnchor({ children, className, href }: AnchorProps) {
  const { ref, onMouseMove, onMouseLeave, onMouseDown, onMouseUp } = useMagnetic<HTMLAnchorElement>();
  return (
    <a
      ref={ref}
      href={href}
      className={className}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      {children}
    </a>
  );
}
