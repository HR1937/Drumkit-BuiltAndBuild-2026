export default function SwitchingFlow() {
  const flow = [
    ["App", "Web", 1200],
    ["Web", "Call", 900],
    ["Call", "Web", 600],
    ["App", "Call", 300],
    ["Web", "Branch", 150],
  ];

  const max = Math.max(...flow.map(([, , value]) => value));

  return (
    <section className="card">
      <h2>Switching flow</h2>
      <p>Top customer handoffs</p>

      {flow.map(([from, to, value]) => (
        <div className="flow" key={`${from}-${to}`}>
          <span>{from}</span>
          <i style={{ width: `${(value / max) * 100}%` }} />
          <span>→ {to}</span>
          <b>{value}</b>
        </div>
      ))}
    </section>
  );
}
