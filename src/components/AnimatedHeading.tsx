import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface Props {
  text: string;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  inView: boolean;
  delay?: number;
}

export default function AnimatedHeading({ text, as: Tag = 'h2', className, inView, delay = 0 }: Props) {
  const ref = useRef<HTMLElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    if (!inView || animated.current || !ref.current) return;
    animated.current = true;
    const words = ref.current.querySelectorAll<HTMLSpanElement>('[data-w]');
    gsap.fromTo(words,
      { y: '110%' },
      { y: '0%', stagger: 0.06, duration: 0.7, ease: 'power3.out', delay }
    );
  }, [inView, delay]);

  const words = text.split(' ');

  const el = (
    <>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden"
          style={{ marginRight: '0.28em', verticalAlign: 'bottom' }}
        >
          <span data-w="1" className="inline-block" style={{ transform: 'translateY(110%)' }}>
            {word}
          </span>
        </span>
      ))}
    </>
  );

  if (Tag === 'h1') return <h1 ref={ref as React.RefObject<HTMLHeadingElement>} className={className}>{el}</h1>;
  if (Tag === 'h3') return <h3 ref={ref as React.RefObject<HTMLHeadingElement>} className={className}>{el}</h3>;
  return <h2 ref={ref as React.RefObject<HTMLHeadingElement>} className={className}>{el}</h2>;
}
