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
      {SUBJECT_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`subj-btn ${opt.cls}${value === opt.value ? ' active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
