import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import { fetchAgents, fetchSkins, fetchWeapons } from '../api/api'
import { useLocalStorage } from '../hooks/hooks'
import { init, reducer } from './reducer'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

const countBy = (arr, fn) =>
  Object.entries(arr.reduce((m, x) => { const k = fn(x); m[k] = (m[k] || 0) + 1; return m }, {}))
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, init)
  const [theme, setTheme] = useLocalStorage('theme', 'dark')

  // загрузка трёх API параллельно, с отменой при размонтировании / повторе
  useEffect(() => {
    const ctrl = new AbortController()
    dispatch({ type: 'LOAD_START' })
    Promise.all([fetchAgents(ctrl.signal), fetchWeapons(ctrl.signal), fetchSkins(ctrl.signal)])
      .then(([agents, weapons, skins]) => dispatch({ type: 'LOAD_OK', payload: { agents, weapons, skins } }))
      .catch((e) => e.name !== 'AbortError' && dispatch({ type: 'LOAD_FAIL', payload: e.message }))
    return () => ctrl.abort()
  }, [state.attempt])

  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])
  useEffect(() => { localStorage.setItem('favs', JSON.stringify(state.favorites)) }, [state.favorites])

  const toggleFav = useCallback((key) => dispatch({ type: 'TOGGLE_FAV', payload: key }), [])

  // производные данные для инфографики
  const derived = useMemo(() => {
    const owner = new Map()
    state.weapons.forEach((w) => w.skins?.forEach((s) => owner.set(s.uuid, w.displayName)))
    const defaults = new Set(state.weapons.map((w) => w.defaultSkinUuid))
    const skins = state.skins
      .filter((s) => !defaults.has(s.uuid) && !/^(Standard|Стандартн|Random Favorite|Случайн)/.test(s.displayName))
      .map((s) => ({
        ...s,
        weapon: owner.get(s.uuid) || 'Другое',
        img: s.displayIcon || s.levels?.[0]?.displayIcon || s.chromas?.[0]?.fullRender,
      }))
      .filter((s) => s.img)
    const catOf = (w) => w.shopData?.categoryText || 'Ближний бой'
    const roles = countBy(state.agents, (a) => a.role?.displayName || '—')
    const categories = countBy(state.weapons, catOf)
    const skinsPerWeapon = countBy(skins, (s) => s.weapon).slice(0, 8)
    const costs = state.weapons
      .filter((w) => w.shopData?.cost > 0)
      .map((w) => ({ label: w.displayName, value: w.shopData.cost }))
      .sort((a, b) => b.value - a.value).slice(0, 8)
    const stats = state.weapons.map((w) => w.weaponStats).filter(Boolean)
    const max = (k) => Math.max(...stats.map((x) => x[k] || 0), 1)
    return {
      skins, roles, categories, skinsPerWeapon, costs, catOf,
      roleNames: ['Все', ...roles.map((r) => r.label)],
      categoryNames: ['Все', ...categories.map((c) => c.label)],
      maxStat: { fireRate: max('fireRate'), magazineSize: max('magazineSize'), reloadTimeSeconds: max('reloadTimeSeconds') },
    }
  }, [state.agents, state.weapons, state.skins])

  const value = useMemo(
    () => ({ state, dispatch, derived, theme, setTheme, toggleFav }),
    [state, derived, theme, setTheme, toggleFav],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
