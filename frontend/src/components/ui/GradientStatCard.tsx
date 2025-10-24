import React from 'react';

type GradientKind = 'purple' | 'blue' | 'custom';

export function GradientStatCard({ title, value, subtitle, gradient = 'purple' as GradientKind, customStyle }: Readonly<{ title?: string; value: string; subtitle?: string; gradient?: GradientKind; customStyle?: React.CSSProperties }>) {
  let gradientStyle: React.CSSProperties = {};
  if (gradient === 'purple') {
    gradientStyle = { background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' };
  } else if (gradient === 'blue') {
    gradientStyle = { background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' };
  }
  const style: React.CSSProperties = customStyle || gradientStyle;

  return (
    <section className="panel-card grad-card" style={{ padding: 0 }}>
      <div style={{ ...style, color: '#fff', padding: '1.25rem', borderRadius: '1rem', position: 'relative' }}>
        <div className="grad-bubble" aria-hidden="true"></div>
        {title ? <div className="text-sm" style={{ opacity: 0.95 }}>{title}</div> : null}
        <div className="text-3xl" style={{ fontWeight: 800, marginTop: '0.5rem' }}>{value}</div>
        {subtitle ? <div className="text-sm" style={{ opacity: 0.9, marginTop: '0.25rem' }}>{subtitle}</div> : null}
      </div>
    </section>
  );
}

export default GradientStatCard;


