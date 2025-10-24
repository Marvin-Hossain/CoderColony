import { useMemo } from 'react';

export type DonutColor = 'blue' | 'green' | 'red';

export function StatusDonut({ label, value, total, color }: Readonly<{ label: string; value: number; total: number; color: DonutColor }>) {
  const pct = useMemo(() => {
    const t = Math.max(1, total || 0);
    return Math.max(0, Math.min(100, Math.round((value / t) * 100)));
  }, [value, total]);

  const size = 84;
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  let stroke = '#4d6bfe';
  if (color === 'green') stroke = '#10b981';
  else if (color === 'red') stroke = '#ef4444';

  return (
    <div className="status-item">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <g transform={`translate(${size / 2}, ${size / 2})`}>
          <circle r={radius} cx={0} cy={0} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={10} />
          <circle r={radius} cx={0} cy={0} fill="none" stroke={stroke} strokeWidth={10} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90)" />
          <text x={0} y={-2} textAnchor="middle" fontSize={16} fontWeight={800} fill="#111827">{value}</text>
          <text x={0} y={14} textAnchor="middle" fontSize={10} fontWeight={600} fill="rgba(17,23,41,0.6)">of {total}</text>
        </g>
      </svg>
      <div className="status-caption">{label}</div>
    </div>
  );
}

export default StatusDonut;


