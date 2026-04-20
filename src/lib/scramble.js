import { useState, useRef, useEffect } from 'react';
import { SCRAMBLE_POOL } from './engine';

export function useScramble(target) {
  const [displayed, setDisplayed] = useState(target);
  const [isAnimating, setIsAnimating] = useState(false);
  const rafRef = useRef();

  useEffect(() => {
    if (!target) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayed('');
      setIsAnimating(false);
      return;
    }

    const duration = 420;
    const chars = target.split('');
    const resolveTimes = chars.map((c) =>
      c === '\n' || c === ' ' ? 0 : Math.random() * duration * 0.75
    );
    const start = performance.now();
    setIsAnimating(true);

    const tick = () => {
      const elapsed = performance.now() - start;
      const out = chars.map((c, i) => {
        if (c === '\n') return '\n';
        if (elapsed >= resolveTimes[i]) return c;
        return SCRAMBLE_POOL[Math.floor(Math.random() * SCRAMBLE_POOL.length)];
      }).join('');
      setDisplayed(out);
      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayed(target);
        setIsAnimating(false);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target]);

  return { displayed, isAnimating };
}
