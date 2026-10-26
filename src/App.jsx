import { Component, lazy, Suspense, useEffect, useRef } from 'react'
import { AppProvider, useApp } from './store/AppContext'
import './App.css'

// lazy-компоненты объявляются ВНЕ компонента, иначе они пересоздаются при каждом рендере
const Overview = lazy(() => import('./components/Overview'))
const Agents = lazy(() => import('./components/Agents'))
const Weapons = lazy(() => import('./components/Weapons'))
const Skins = lazy(() => import('./components/Skins'))
const Favorites = lazy(() => import('./components/Favorites'))

const VIEWS = { overview: Overview, agents: Agents, weapons: Weapons, skins: Skins, favorites: Favorites }
const SEARCHABLE = ['agents', 'weapons', 'skins']

// Если где-то случится ошибка, покажем сообщение, а не белый экран
class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error)
      return (
        <div className="error">
          <p>Что-то пошло не так: {String(this.state.error.message || this.state.error)}</p>
          <button onClick={() => window.location.reload()}>Перезагрузить страницу</button>
        </div>
      )
    return this.props.children
  }
}

function Shell() {
  const { state, dispatch, theme, setTheme } = useApp()
  const searchRef = useRef(null)

  // «/» фокусирует поиск
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const tabs = [
    ['overview', 'Обзор'], ['agents', 'Агенты'], ['weapons', 'Оружие'], ['skins', 'Скины'],
    ['favorites', `Избранное (${state.favorites.length})`],
  ]
  const View = VIEWS[state.tab]

  return (
    <div className="app">
      <header className="top">
        <h1>Valorant<span>-Вики</span></h1>
        <nav>
          {tabs.map(([id, label]) => (
            <button key={id} className={state.tab === id ? 'tab on' : 'tab'}
              onClick={() => dispatch({ type: 'SET_TAB', payload: id })}>{label}</button>
          ))}
        </nav>
        {SEARCHABLE.includes(state.tab) && (
          <input ref={searchRef} className="search" placeholder="Поиск (нажмите /)" value={state.query}
            onChange={(e) => dispatch({ type: 'SET_QUERY', payload: e.target.value })} />
        )}
        <button className="theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? 'Тёмная' : 'Светлая'}
        </button>
      </header>

      <main>
        {state.status === 'loading' && <div className="skeleton"><i /><i /><i /><i /></div>}
        {state.status === 'error' && (
          <div className="error">
            <p>Не удалось загрузить данные: {state.error}</p>
            <button onClick={() => dispatch({ type: 'RETRY' })}>Повторить</button>
          </div>
        )}
        {state.status === 'ready' && (
          <Suspense fallback={<div className="skeleton"><i /><i /></div>}><View /></Suspense>
        )}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider><Shell /></AppProvider>
    </ErrorBoundary>
  )
}
