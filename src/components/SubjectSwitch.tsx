import { motion } from 'motion/react';
import type { Mapel } from '../data/sheets';

interface SubjectSwitchProps {
  value: Mapel;
  onChange: (value: Mapel) => void;
}

const SUBJECT_OPTIONS: { value: Mapel; label: string; cls: 'inf' | 'kka' }[] = [
  { value: 'Informatika', label: '🖥️ Informatika', cls: 'inf' },
  { value: 'KKA', label: '🤖 KKA', cls: 'kka' },
];

export function SubjectSwitch({ value, onChange }: SubjectSwitchProps) {
  return (
    <div className="subject-switch">
      {SUBJECT_OPTIONS.map((opt) => {
        const isActive = value === opt.value;
        return (
          <motion.button
            key={opt.value}
            type="button"
            className={`subj-btn ${opt.cls}${isActive ? ' active' : ''}`}
            onClick={() => onChange(opt.value)}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {opt.label}
          </motion.button>
        );
      })}
    </div>
  );
}
