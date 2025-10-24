import StatusDonut from './StatusDonut';

export function StatusDonutGroup({ applied, interviewed, rejected, total }: { applied: number; interviewed: number; rejected: number; total: number }) {
  return (
    <section className="panel-card">
      <h3 className="panel-title">Application Status</h3>
      <div className="status-group">
        <StatusDonut label="Applied" value={applied} total={total} color="blue" />
        <StatusDonut label="Interviewed" value={interviewed} total={total} color="green" />
        <StatusDonut label="Rejected" value={rejected} total={total} color="red" />
      </div>
    </section>
  );
}

export default StatusDonutGroup;


