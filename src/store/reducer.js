const loadFavs = () => {
  try { return JSON.parse(localStorage.getItem('favs')) || [] } catch { return [] }
}

// ленивая инициализация для useReducer
export const init = () => ({
  status: 'loading', error: null, attempt: 0,
  agents: [], weapons: [], skins: [],
  tab: 'overview', query: '', role: 'Все', category: 'Все',
  selectedAgent: null, favorites: loadFavs(),
})

export function reducer(s, a) {
  switch (a.type) {
    case 'LOAD_START': return { ...s, status: 'loading', error: null }
    case 'LOAD_OK': return { ...s, status: 'ready', ...a.payload }
    case 'LOAD_FAIL': return { ...s, status: 'error', error: a.payload }
    case 'RETRY': return { ...s, attempt: s.attempt + 1 }
    case 'SET_TAB': return { ...s, tab: a.payload, query: '' }
    case 'SET_QUERY': return { ...s, query: a.payload }
    case 'SET_ROLE': return { ...s, role: a.payload }
    case 'SET_CATEGORY': return { ...s, category: a.payload }
    case 'SELECT_AGENT': return { ...s, selectedAgent: a.payload }
    case 'TOGGLE_FAV':
      return {
        ...s,
        favorites: s.favorites.includes(a.payload)
          ? s.favorites.filter((k) => k !== a.payload)
          : [...s.favorites, a.payload],
      }
    default: return s
  }
}
