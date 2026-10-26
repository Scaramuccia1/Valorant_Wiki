const PALETTE = ['#1e6bff', '#3ad6c5', '#f5b83d', '#8a5cf6', '#e87bd0', '#9be564', '#ff8a4c', '#8b97a3']

export function BarChart({ data, color = 'var(--accent)' }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <ul className="bars">
      {data.map((d) => (
        <li key={d.label}>
          <span className="bars-label">{d.label}</span>
          <span className="bars-track"><i style={{ width: `${(d.value / max) * 100}%`, background: color }} /></span>
          <b>{d.value}</b>
        </li>
      ))}
    </ul>
  )
}

export function Donut({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const r = 38, C = 2 * Math.PI * r
  let acc = 0
  return (
    <div className="donut">
      <svg viewBox="0 0 100 100" role="img" aria-label="Круговая диаграмма">
        <g transform="rotate(-90 50 50)">
          {data.map((d, i) => {
            const len = (d.value / total) * C
            const el = (
              <circle key={d.label} cx="50" cy="50" r={r} fill="none" strokeWidth="16"
                stroke={PALETTE[i % PALETTE.length]} strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-acc} />
            )
            acc += len
            return el
          })}
        </g>
        <text x="50" y="55" textAnchor="middle" className="donut-total">{total}</text>
      </svg>
      <ul>
        {data.map((d, i) => (
          <li key={d.label}><i style={{ background: PALETTE[i % PALETTE.length] }} />{d.label}<b>{d.value}</b></li>
        ))}
      </ul>
    </div>
  )
}

export function StatBar({ label, value, max, unit = '' }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <span className="bars-track"><i style={{ width: `${Math.min((value / max) * 100, 100)}%` }} /></span>
      <b>{value}{unit}</b>
    </div>
  )
}
