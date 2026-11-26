import { createContext, type ReactNode, useContext, useRef } from 'react';
import { motion, useInView } from 'motion/react';

export const SILKY_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const SmoothGridContext = createContext<boolean>(true);

interface SmoothGridProps {
  filterKey: string;
  className: string;
  children: ReactNode;
}

export function SmoothGrid({ filterKey, className, children }: SmoothGridProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(wrapRef, { once: true, amount: 0.03 });

  return (
    <div ref={wrapRef} className="hscroll-wrap">
      <SmoothGridContext.Provider value={isInView}>
        <div key={filterKey} className={className}>
          {children}
        </div>
      </SmoothGridContext.Provider>
    </div>
  );
}

interface SmoothCardProps {
  index: number;
  link?: string;
  className: string;
  children: ReactNode;
}

export function SmoothCard({ index, link, className, children }: SmoothCardProps) {
  const isInView = useContext(SmoothGridContext);
  const delay = Math.min(index * 0.055, 0.42);

  const motionProps = {
    className,
    initial: { opacity: 0, y: 24, scale: 0.968 },
    animate: isInView
      ? { opacity: 1, y: 0, scale: 1 }
      : { opacity: 0, y: 24, scale: 0.968 },
    whileHover: {
      y: -5,
      transition: { duration: 0.24, ease: SILKY_EASE },
    },
    whileTap: link ? { scale: 0.985 } : undefined,
    transition: {
      duration: 0.52,
      delay,
      ease: SILKY_EASE,
    },
  };

  if (link) {
    return (
      <motion.a href={link} target="_blank" rel="noopener noreferrer" {...motionProps}>
        {children}
      </motion.a>
    );
  }

  return <motion.div {...motionProps}>{children}</motion.div>;
}

interface SmoothSectionProps {
  className?: string;
  delay?: number;
  children: ReactNode;
}

export function SmoothSection({ className, delay = 0, children }: SmoothSectionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.06 }}
      transition={{ duration: 0.6, delay, ease: SILKY_EASE }}
    >
      {children}
    </motion.div>
  );
}

interface SmoothHeroItemProps {
  delay?: number;
  className?: string;
  children: ReactNode;
}

export function SmoothHeroItem({ delay = 0, className, children }: SmoothHeroItemProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.56, delay, ease: SILKY_EASE }}
    >
      {children}
    </motion.div>
  );
}
