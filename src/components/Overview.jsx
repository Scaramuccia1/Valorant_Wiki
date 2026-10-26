import { useApp } from '../store/AppContext'
import { BarChart, Donut } from './Charts'

export default function Overview() {
  const { state, derived: d } = useApp()
  const kpis = [
    ['Агентов', state.agents.length],
    ['Видов оружия', state.weapons.length],
    ['Скинов', d.skins.length],
    ['Ролей', d.roles.length],
  ]
  return (
    <div className="stack">
      <div className="kpis">
        {kpis.map(([l, v]) => <div className="kpi" key={l}><b>{v}</b><span>{l}</span></div>)}
      </div>
      <div className="grid2">
        <section className="panel"><h3>Агенты по ролям</h3><Donut data={d.roles} /></section>
        <section className="panel"><h3>Оружие по категориям</h3><Donut data={d.categories} /></section>
        <section className="panel"><h3>Больше всего скинов</h3><BarChart data={d.skinsPerWeapon} /></section>
        <section className="panel"><h3>Самое дорогое оружие, кредиты</h3><BarChart data={d.costs} color="var(--accent2)" /></section>
      </div>
    </div>
  )
}
