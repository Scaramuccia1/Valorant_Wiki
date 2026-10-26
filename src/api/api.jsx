// Все обращения к valorant-api.com собраны в этом файле.
// Параметр language=ru-RU просит у API русские названия (агенты, скины, способности, роли).
// Оружие намеренно загружается без перевода, на английском.
const LANG = 'language=ru-RU'

export const ENDPOINTS = {
  agents: `https://valorant-api.com/v1/agents?${LANG}`,
  weapons: 'https://valorant-api.com/v1/weapons',
  skins: `https://valorant-api.com/v1/weapons/skins?${LANG}`,
}

// Запасные переводы: используются, только если API всё равно вернул английское название
const AGENTS = {
  Brimstone: 'Бримстоун', Viper: 'Вайпер', Omen: 'Омен', Killjoy: 'Киллджой', Cypher: 'Сайфер',
  Sova: 'Сова', Sage: 'Сейдж', Phoenix: 'Феникс', Jett: 'Джетт', Reyna: 'Рейна', Raze: 'Рейз',
  Breach: 'Брич', Skye: 'Скай', Yoru: 'Йору', Astra: 'Астра', 'KAY/O': 'КЕЙ/О', Chamber: 'Чембер',
  Neon: 'Неон', Fade: 'Фейд', Harbor: 'Харбор', Gekko: 'Гекко', Deadlock: 'Дедлок', Iso: 'Изо',
  Clove: 'Клов', Vyse: 'Вайс', Tejo: 'Теджо', Waylay: 'Вэйлэй', Veto: 'Вето', Miks: 'Микс'
}
const ROLES = { Duelist: 'Дуэлянт', Initiator: 'Инициатор', Controller: 'Контролёр', Sentinel: 'Страж' }

const isLatin = (s) => /^[A-Za-z]/.test(s || '')
const tr = (map, s) => (isLatin(s) && map[s] ? map[s] : s)

async function get(url, signal) {
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`Ошибка ${res.status} при запросе ${url}`)
  const json = await res.json()
  return json.data
}

// Оставляем только играбельных агентов (в API есть тестовый дубликат)
export const fetchAgents = async (signal) =>
  (await get(ENDPOINTS.agents, signal))
    .filter((a) => a.isPlayableCharacter)
    .map((a) => ({
      ...a,
      displayName: tr(AGENTS, a.displayName),
      role: a.role && { ...a.role, displayName: tr(ROLES, a.role.displayName) },
    }))

export const fetchWeapons = (signal) => get(ENDPOINTS.weapons, signal)

export const fetchSkins = (signal) => get(ENDPOINTS.skins, signal)
