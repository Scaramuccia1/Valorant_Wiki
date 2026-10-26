import { useApp } from '../store/AppContext'
import { AgentCard } from './Agents'
import { SkinCard } from './Skins'

export default function Favorites() {
  const { state, derived } = useApp()
  const agents = state.agents.filter((a) => state.favorites.includes(`agent:${a.uuid}`))
  const skins = derived.skins.filter((s) => state.favorites.includes(`skin:${s.uuid}`))
  if (!agents.length && !skins.length)
    return <p className="empty">Пока пусто. Нажмите ☆ на карточке агента или скина, чтобы сохранить его здесь.</p>
  return (
    <div className="stack">
      {!!agents.length && <><h3>Агенты</h3><div className="agents">{agents.map((a) => <AgentCard key={a.uuid} a={a} />)}</div></>}
      {!!skins.length && <><h3>Скины</h3><div className="skins">{skins.map((s) => <SkinCard key={s.uuid} s={s} />)}</div></>}
    </div>
  )
}
