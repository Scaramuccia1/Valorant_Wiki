import { useEffect, useMemo } from 'react'
import { useApp } from '../store/AppContext'
import { useDebounce } from '../hooks/hooks'

const grad = (a) => `linear-gradient(160deg, ${(a.backgroundGradientColors || ['333333ff', '111111ff']).map((c) => '#' + c.slice(0, 6)).join(',')})`

export function FavBtn({ id }) {
  const { state, toggleFav } = useApp()
  const on = state.favorites.includes(id)
  return (
    <button className={`fav ${on ? 'on' : ''}`} aria-pressed={on} aria-label="В избранное"
      onClick={(e) => { e.stopPropagation(); toggleFav(id) }}>{on ? '★' : '☆'}</button>
  )
}

export function AgentCard({ a }) {
  const { dispatch } = useApp()
  return (
    <article className="agent" style={{ background: grad(a) }} onClick={() => dispatch({ type: 'SELECT_AGENT', payload: a })}>
      <FavBtn id={`agent:${a.uuid}`} />
      <img src={a.fullPortrait || a.displayIcon} alt={a.displayName} loading="lazy" />
      <footer>
        <strong>{a.displayName}</strong>
        <span>{a.role?.displayIcon && <img src={a.role.displayIcon} alt="" />}{a.role?.displayName}</span>
      </footer>
    </article>
  )
}

function AgentModal({ a }) {
  const { dispatch } = useApp()
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && dispatch({ type: 'SELECT_AGENT', payload: null })
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dispatch])
  const close = () => dispatch({ type: 'SELECT_AGENT', payload: null })
  return (
    <div className="overlay" onClick={close}>
      <div className="modal" style={{ background: grad(a) }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={a.displayName}>
        <button className="close" onClick={close} aria-label="Закрыть">×</button>
        <img className="modal-img" src={a.fullPortrait || a.displayIcon} alt="" />
        <div className="modal-body">
          <h2>{a.displayName}</h2>
          <p className="role">{a.role?.displayName}</p>
          <p>{a.description}</p>
          <ul className="abilities">
            {a.abilities.filter((x) => x.displayIcon).map((x) => (
              <li key={x.slot}><img src={x.displayIcon} alt="" /><div><b>{x.displayName}</b><p>{x.description}</p></div></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function Agents() {
  const { state, derived, dispatch } = useApp()
  const q = useDebounce(state.query, 250).toLowerCase()
  const list = useMemo(
    () => state.agents.filter((a) =>
      (state.role === 'Все' || a.role?.displayName === state.role) && a.displayName.toLowerCase().includes(q)),
    [state.agents, state.role, q],
  )
  return (
    <>
      <div className="chips">
        {derived.roleNames.map((r) => (
          <button key={r} className={state.role === r ? 'chip on' : 'chip'} onClick={() => dispatch({ type: 'SET_ROLE', payload: r })}>{r}</button>
        ))}
      </div>
      {list.length ? <div className="agents">{list.map((a) => <AgentCard key={a.uuid} a={a} />)}</div>
        : <p className="empty">Никого не нашли. Измените запрос или выберите другую роль.</p>}
      {state.selectedAgent && <AgentModal a={state.selectedAgent} />}
    </>
  )
}
