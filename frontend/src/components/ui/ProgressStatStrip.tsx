
export type StripColor = 'blue' | 'orange' | 'green';

export type StripItem = { value: number | string; label: string; color: StripColor };

export function ProgressStatStrip({ items }: Readonly<{ items: [StripItem, StripItem, StripItem] }>) {
  return (
    <div className="pss-wrap" aria-label="progress stat strip">
      <div className="pss">
        {items.map((it, idx) => (
          <div key={`${it.label}-${idx}`} className={`pss-item pss-${it.color}`}>
            <div className="pss-value">{it.value}</div>
            <div className="pss-label">{it.label}</div>
            <div className="pss-decor pss-decor-1" aria-hidden="true"></div>
            <div className="pss-decor pss-decor-2" aria-hidden="true"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProgressStatStrip;


