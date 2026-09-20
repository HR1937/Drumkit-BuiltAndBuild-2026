export default function FunnelChart({ data }) {
  const max = data[0][1];

  return (
    <section className="card">
      <h2>Purchase funnel</h2>
      <p>Customer conversion at every step</p>

      {data.map(([name, value]) => (
        <div className="frow" key={name}>
          <label>{name}</label>
          <div className="track">
            <i style={{ width: `${(value / max) * 100}%` }}>
              {value.toLocaleString()}
            </i>
          </div>
        </div>
      ))}
    </section>
  );
}
