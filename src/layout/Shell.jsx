import { NavLink, useNavigate, Link } from 'react-router-dom'
import { logout } from '../auth/auth'
import { loadDB, countPendingRequests } from '../storage/db'
import { useState, useEffect } from 'react'

// Icons as simple SVG components
const IconDashboard = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
)

const IconScissors = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
  </svg>
)

const IconUsers = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
)

const IconCalendar = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const IconInbox = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
)

const IconBarber = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const IconLogout = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

const IconMore = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
  </svg>
)

const IconPlus = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

// Mobile bottom nav items
const mobileNavItems = [
  { to: '/dashboard', label: 'Início', icon: IconDashboard },
  { to: '/appointments/new', label: 'Atender', icon: IconCalendar },
  { to: '/inbox', label: 'Pedidos', icon: IconInbox, hasBadge: true },
  { to: '/clients', label: 'Clientes', icon: IconUsers },
  { to: '/more', label: 'Mais', icon: IconMore },
]

// Desktop sidebar nav items (more complete)
const desktopNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: IconDashboard },
  { to: '/appointments/new', label: 'Novo Atendimento', icon: IconCalendar },
  { to: '/inbox', label: 'Agendamentos', icon: IconInbox, hasBadge: true },
  { to: '/clients', label: 'Clientes', icon: IconUsers },
  { to: '/barbers', label: 'Equipe', icon: IconBarber },
  { to: '/services', label: 'Serviços', icon: IconScissors },
]

export default function Shell({ children }) {
  const navigate = useNavigate()
  const [db, setDb] = useState(null)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const loadedDb = loadDB()
    setDb(loadedDb)
    setPendingCount(countPendingRequests(loadedDb))
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!db) return null

  return (
    <div className="min-h-screen bg-zinc-900 lg:flex">
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-zinc-800 lg:bg-zinc-950">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <h1 className="text-xl font-bold text-amber-500 truncate">
            {db.barbershopName}
          </h1>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {desktopNavItems.map(({ to, label, icon: Icon, hasBadge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-500'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`
              }
            >
              <Icon />
              <span className="flex-1">{label}</span>
              {hasBadge && pendingCount > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center text-xs font-bold bg-red-500 text-white rounded-full">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all"
          >
            <IconLogout />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Mobile Header - Hidden on desktop */}
        <header className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 lg:hidden">
          <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
            <h1 className="text-lg font-bold text-amber-500 truncate">
              {db.barbershopName}
            </h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <IconLogout />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </header>

        {/* Desktop Header - Hidden on mobile */}
        <header className="hidden lg:flex sticky top-0 z-40 h-16 items-center justify-between px-8 bg-zinc-900/95 backdrop-blur border-b border-zinc-800">
          <div />
          <div className="flex items-center gap-3">
            <Link
              to="/inbox"
              className="relative p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
              title="Agendamentos"
            >
              <IconInbox />
              {pendingCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </Link>
            <Link
              to="/appointments/new"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-zinc-900 font-medium text-sm hover:bg-amber-400 transition-colors"
            >
              <IconPlus />
              <span>Novo Atendimento</span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 pb-20 lg:pb-0">
          <div className="max-w-md mx-auto px-4 py-4 lg:max-w-6xl lg:px-8 lg:py-6">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation - Hidden on desktop */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur border-t border-zinc-800 lg:hidden">
          <div className="max-w-md mx-auto flex">
            {mobileNavItems.map(({ to, label, icon: Icon, hasBadge }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors relative ${
                    isActive
                      ? 'text-amber-500'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`
                }
              >
                <div className="relative">
                  <Icon />
                  {hasBadge && pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full">
                      {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                  )}
                </div>
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
