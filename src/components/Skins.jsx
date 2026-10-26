import { useDeferredValue, useMemo, useState } from 'react'
import { useApp } from '../store/AppContext'
import { FavBtn } from './Agents'

export function SkinCard({ s }) {
  return (
    <article className="skin">
      <FavBtn id={`skin:${s.uuid}`} />
      <img src={s.img} alt={s.displayName} loading="lazy" />
      <strong>{s.displayName}</strong>
      <span>{s.weapon}</span>
    </article>
  )
}

export default function Skins() {
  const { state, derived } = useApp()
  const [weapon, setWeapon] = useState('Все')
  const [limit, setLimit] = useState(24)
  const q = useDeferredValue(state.query).toLowerCase()
  const weapons = useMemo(() => ['Все', ...[...new Set(derived.skins.map((s) => s.weapon))].sort((a, b) => a.localeCompare(b, 'ru'))], [derived.skins])
  const list = useMemo(
    () => derived.skins.filter((s) => (weapon === 'Все' || s.weapon === weapon) && s.displayName.toLowerCase().includes(q)),
    [derived.skins, weapon, q],
  )
  return (
    <>
      <div className="toolbar">
        <label>Оружие
          <select value={weapon} onChange={(e) => { setWeapon(e.target.value); setLimit(24) }}>
            {weapons.map((w) => <option key={w}>{w}</option>)}
          </select>
        </label>
        <span>{list.length} скинов</span>
      </div>
      {list.length ? <div className="skins">{list.slice(0, limit).map((s) => <SkinCard key={s.uuid} s={s} />)}</div>
        : <p className="empty">Скины не найдены. Попробуйте другое название.</p>}
      {limit < list.length && <button className="more" onClick={() => setLimit((n) => n + 24)}>Показать ещё</button>}
    </>
  )
}
