import { useMemo, useState } from 'react'
import { useApp } from '../store/AppContext'
import { useDebounce } from '../hooks/hooks'
import { StatBar } from './Charts'

function Detail({ w }) {
  const { derived: d } = useApp()
  const s = w.weaponStats
  return (
    <section className="panel detail">
      <img src={w.displayIcon} alt={w.displayName} />
      <h2>{w.displayName}</h2>
      <p className="role">{d.catOf(w)}{w.shopData?.cost ? ` · ${w.shopData.cost} кр.` : ''}</p>
      {s ? (
        <>
          <StatBar label="Скорострельность" value={s.fireRate} max={d.maxStat.fireRate} unit="/с" />
          <StatBar label="Магазин" value={s.magazineSize} max={d.maxStat.magazineSize} />
          <StatBar label="Перезарядка" value={s.reloadTimeSeconds} max={d.maxStat.reloadTimeSeconds} unit=" с" />
          <h3>Урон по дистанции</h3>
          <table>
            <thead><tr><th>Метры</th><th>Голова</th><th>Тело</th><th>Ноги</th></tr></thead>
            <tbody>
              {s.damageRanges.map((r) => (
                <tr key={r.rangeStartMeters}>
                  <td>{r.rangeStartMeters}–{r.rangeEndMeters}</td><td>{Math.round(r.headDamage)}</td>
                  <td>{Math.round(r.bodyDamage)}</td><td>{Math.round(r.legDamage)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : <p>У ближнего боя нет характеристик стрельбы.</p>}
    </section>
  )
}

export default function Weapons() {
  const { state, derived, dispatch } = useApp()
  const [selId, setSelId] = useState(null)
  const q = useDebounce(state.query, 250).toLowerCase()
  const list = useMemo(
    () => state.weapons.filter((w) =>
      (state.category === 'Все' || derived.catOf(w) === state.category) && w.displayName.toLowerCase().includes(q)),
    [state.weapons, state.category, q, derived],
  )
  const sel = list.find((w) => w.uuid === selId) || list[0]
  return (
    <>
      <div className="chips">
        {derived.categoryNames.map((c) => (
          <button key={c} className={state.category === c ? 'chip on' : 'chip'} onClick={() => dispatch({ type: 'SET_CATEGORY', payload: c })}>{c}</button>
        ))}
      </div>
      <div className="split">
        <ul className="wlist">
          {list.map((w) => (
            <li key={w.uuid}>
              <button className={sel?.uuid === w.uuid ? 'on' : ''} onClick={() => setSelId(w.uuid)}>
                <img src={w.displayIcon} alt="" loading="lazy" /><span>{w.displayName}</span>
              </button>
            </li>
          ))}
        </ul>
        {sel ? <Detail w={sel} /> : <p className="empty">Оружие не найдено.</p>}
      </div>
    </>
  )
}
