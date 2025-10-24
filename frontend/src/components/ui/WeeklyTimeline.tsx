
export type TimelineDay = { dateLabel: string; value: number };

export function WeeklyTimeline({ days }: Readonly<{ days: TimelineDay[] }>) {
  return (
    <section className="timeline-card">
      <h3 className="panel-title">Weekly Timeline</h3>
      <p className="panel-subtitle">Daily application submissions this week</p>
      <div className="timeline-row">
        {days.map((d, idx) => (
          <div className="timeline-bubble" key={`${d.dateLabel}-${idx}`}>
            <div className="timeline-circle">
              <div className="timeline-value">{d.value}</div>
              <div className="timeline-unit">apps</div>
            </div>
            <div className="timeline-day">{d.dateLabel}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default WeeklyTimeline;


