import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { loadDB } from '../storage/db'
import {
  moneyBRL,
  daysBetween,
  toDateInputValue,
  parseYYYYMMDDToDate,
  formatDateBR,
  filterAppointmentsByRange,
} from '../storage/helpers'
import Shell from '../layout/Shell'

// localStorage key for period persistence
const PERIOD_STORAGE_KEY = 'barber_dashboard_period_v1'

// Default period config
const DEFAULT_PERIOD = { mode: 'PRESET', days: 7 }

// Load period from localStorage
function loadPeriod() {
  try {
    const stored = localStorage.getItem(PERIOD_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Error loading period:', e)
  }
  return DEFAULT_PERIOD
}

// Save period to localStorage
function savePeriod(period) {
  try {
    localStorage.setItem(PERIOD_STORAGE_KEY, JSON.stringify(period))
  } catch (e) {
    console.error('Error saving period:', e)
  }
}

// Get date range from period config
function getDateRangeFromPeriod(period) {
  const today = new Date()
  
  if (period.mode === 'CUSTOM') {
    return {
      start: parseYYYYMMDDToDate(period.start),
      end: parseYYYYMMDDToDate(period.end),
    }
  }
  
  // PRESET mode
  const end = today
  const start = new Date(today)
  start.setDate(start.getDate() - (period.days - 1))
  return { start, end }
}

// Get period label for display
function getPeriodLabel(period) {
  if (period.mode === 'CUSTOM') {
    const startStr = formatDateBR(parseYYYYMMDDToDate(period.start))
    const endStr = formatDateBR(parseYYYYMMDDToDate(period.end))
    return `${startStr} – ${endStr}`
  }
  
  switch (period.days) {
    case 1:
      return 'Hoje'
    case 7:
      return 'Últimos 7 dias'
    case 30:
      return 'Últimos 30 dias'
    default:
      return `Últimos ${period.days} dias`
  }
}

// Icons
const IconGear = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const IconX = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const IconCheck = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

// Period Selector Modal
function PeriodSelectorModal({ isOpen, onClose, currentPeriod, onApply }) {
  const [selectedMode, setSelectedMode] = useState(currentPeriod.mode)
  const [selectedDays, setSelectedDays] = useState(currentPeriod.days || 7)
  const [customStart, setCustomStart] = useState(currentPeriod.start || toDateInputValue())
  const [customEnd, setCustomEnd] = useState(currentPeriod.end || toDateInputValue())
  const [error, setError] = useState('')

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMode(currentPeriod.mode)
      setSelectedDays(currentPeriod.days || 7)
      setCustomStart(currentPeriod.start || toDateInputValue())
      setCustomEnd(currentPeriod.end || toDateInputValue())
      setError('')
    }
  }, [isOpen, currentPeriod])

  const handlePresetSelect = (days) => {
    setSelectedMode('PRESET')
    setSelectedDays(days)
    setError('')
  }

  const handleCustomSelect = () => {
    setSelectedMode('CUSTOM')
    setError('')
  }

  const handleApply = () => {
    if (selectedMode === 'CUSTOM') {
      // Validate custom range
      const start = parseYYYYMMDDToDate(customStart)
      const end = parseYYYYMMDDToDate(customEnd)
      
      if (!start || !end) {
        setError('Selecione as datas de início e fim')
        return
      }
      
      if (start > end) {
        setError('A data inicial deve ser anterior à data final')
        return
      }
      
      onApply({ mode: 'CUSTOM', start: customStart, end: customEnd })
    } else {
      onApply({ mode: 'PRESET', days: selectedDays })
    }
    onClose()
  }

  const handleReset = () => {
    onApply(DEFAULT_PERIOD)
    onClose()
  }

  if (!isOpen) return null

  const presetOptions = [
    { days: 1, label: 'Hoje' },
    { days: 7, label: '7 dias' },
    { days: 30, label: '30 dias' },
  ]

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 bottom-4 z-50 max-w-md mx-auto">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <h3 className="font-semibold text-white">Período do Dashboard</h3>
            <button
              onClick={onClose}
              className="p-1 text-zinc-500 hover:text-white transition-colors"
            >
              <IconX />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Preset Options */}
            <div className="grid grid-cols-3 gap-2">
              {presetOptions.map(({ days, label }) => (
                <button
                  key={days}
                  onClick={() => handlePresetSelect(days)}
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    selectedMode === 'PRESET' && selectedDays === days
                      ? 'bg-amber-500 text-zinc-900'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {selectedMode === 'PRESET' && selectedDays === days && <IconCheck />}
                  {label}
                </button>
              ))}
            </div>

            {/* Custom Option */}
            <div>
              <button
                onClick={handleCustomSelect}
                className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  selectedMode === 'CUSTOM'
                    ? 'bg-amber-500 text-zinc-900'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {selectedMode === 'CUSTOM' && <IconCheck />}
                Período personalizado
              </button>

              {/* Custom Date Inputs */}
              {selectedMode === 'CUSTOM' && (
                <div className="mt-3 space-y-3 p-3 bg-zinc-800/50 rounded-xl">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Início</label>
                      <input
                        type="date"
                        className="input text-sm"
                        value={customStart}
                        onChange={(e) => {
                          setCustomStart(e.target.value)
                          setError('')
                        }}
                      />
                    </div>
                    <div>
                      <label className="label">Fim</label>
                      <input
                        type="date"
                        className="input text-sm"
                        value={customEnd}
                        onChange={(e) => {
                          setCustomEnd(e.target.value)
                          setError('')
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-2 p-4 border-t border-zinc-800">
            <button
              onClick={handleReset}
              className="btn btn-ghost flex-1 text-sm"
            >
              Resetar
            </button>
            <button
              onClick={handleApply}
              className="btn btn-primary flex-1 text-sm"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default function Dashboard() {
  const [period, setPeriod] = useState(loadPeriod)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [stats, setStats] = useState({
    clientsServed: 0,
    revenue: 0,
    inactiveClients: [],
    revenueByBarber: [],
  })

  const computeStats = useCallback(() => {
    const db = loadDB()
    const now = new Date()
    
    // Get date range from period config
    const { start, end } = getDateRangeFromPeriod(period)

    // Filter appointments in selected period
    const filteredAppointments = filterAppointmentsByRange(db.appointments, start, end)

    // Count distinct clients served
    const uniqueClientIds = new Set(filteredAppointments.map((a) => a.clientId))
    const clientsServed = uniqueClientIds.size

    // Sum revenue
    const revenue = filteredAppointments.reduce((sum, apt) => sum + apt.price, 0)

    // Calculate revenue by barber
    const barberRevenueMap = new Map()
    filteredAppointments.forEach((apt) => {
      const barberId = apt.barberId
      if (barberId) {
        const current = barberRevenueMap.get(barberId) || { revenue: 0, count: 0 }
        barberRevenueMap.set(barberId, {
          revenue: current.revenue + apt.price,
          count: current.count + 1,
        })
      }
    })

    // Create barber stats array with names
    const revenueByBarber = db.barbers
      .map((barber) => {
        const stats = barberRevenueMap.get(barber.id) || { revenue: 0, count: 0 }
        return {
          id: barber.id,
          name: barber.name,
          isDefault: barber.isDefault,
          revenue: stats.revenue,
          count: stats.count,
        }
      })
      .filter((b) => b.revenue > 0) // Only show barbers with revenue in period
      .sort((a, b) => b.revenue - a.revenue) // Sort by revenue descending

    // Find clients who haven't visited in 15+ days (or never visited)
    // This is NOT tied to the period filter - always relative to today
    const inactiveClients = db.clients
      .map((client) => {
        if (!client.lastVisitAt) {
          return { ...client, daysSince: null, label: 'Nunca visitou' }
        }
        const days = daysBetween(client.lastVisitAt, now.toISOString())
        if (days >= 15) {
          return { ...client, daysSince: days, label: `${days} dias` }
        }
        return null
      })
      .filter(Boolean)
      .sort((a, b) => {
        // Nulls (never visited) first, then by daysSince descending
        if (a.daysSince === null && b.daysSince === null) return 0
        if (a.daysSince === null) return -1
        if (b.daysSince === null) return 1
        return b.daysSince - a.daysSince
      })

    setStats({ clientsServed, revenue, inactiveClients, revenueByBarber })
  }, [period])

  useEffect(() => {
    computeStats()
  }, [computeStats])

  const handlePeriodApply = (newPeriod) => {
    setPeriod(newPeriod)
    savePeriod(newPeriod)
  }

  const periodLabel = getPeriodLabel(period)

  return (
    <Shell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-white">Dashboard</h2>
            <p className="text-zinc-500 text-sm lg:text-base mt-1">{periodLabel}</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2 rounded-lg border border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:text-white hover:border-zinc-600 hover:bg-zinc-800 transition-all"
            title="Configurar período"
          >
            <IconGear />
          </button>
        </div>

        {/* Main Grid: 12-column on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Stats (8 columns on desktop) */}
          <div className="lg:col-span-8 space-y-6">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 gap-4 lg:gap-6">
              {/* Clients Served */}
              <div className="card p-4 lg:p-5 h-full">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 lg:w-6 lg:h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl lg:text-3xl font-bold text-white leading-tight">{stats.clientsServed}</p>
                    <p className="text-xs lg:text-sm text-zinc-500">Clientes atendidos</p>
                  </div>
                </div>
              </div>

              {/* Revenue */}
              <div className="card p-4 lg:p-5 h-full">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl lg:text-2xl font-bold text-white leading-tight">{moneyBRL(stats.revenue)}</p>
                    <p className="text-xs lg:text-sm text-zinc-500">Faturamento</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue by Barber */}
            {stats.revenueByBarber.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-zinc-300 lg:text-base">Faturamento por Barbeiro</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                  {stats.revenueByBarber.map((barber, index) => (
                    <div
                      key={barber.id}
                      className="card p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 lg:w-9 lg:h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          index === 0
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {index + 1}º
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate">{barber.name}</p>
                          <p className="text-zinc-500 text-xs">{barber.count} atendimento{barber.count !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-green-400 flex-shrink-0 ml-3">{moneyBRL(barber.revenue)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions - Mobile only */}
            <div className="card p-4 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20 lg:hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Registrar atendimento</p>
                  <p className="text-sm text-zinc-400">Adicione um novo atendimento</p>
                </div>
                <a
                  href="/appointments/new"
                  className="btn btn-primary"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Novo
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Inactive Clients (4 columns on desktop) */}
          <div className="lg:col-span-4">
            {/* Single card with header inside - aligns with KPI cards */}
            <div className="card p-4 lg:p-5 lg:sticky lg:top-24">
              {/* Header inside card */}
              <div className="flex items-baseline justify-between gap-3 mb-4">
                <div className="flex items-baseline gap-2">
                  <h3 className="font-semibold text-zinc-300 text-sm lg:text-base">
                    Clientes Inativos
                  </h3>
                  <span className="text-[10px] lg:text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                    {stats.inactiveClients.length}
                  </span>
                </div>
                <Link
                  to="/clients/last-visit"
                  className="text-xs text-zinc-400 hover:text-white transition-colors whitespace-nowrap"
                >
                  Ver todos →
                </Link>
              </div>

              {/* Content */}
              {stats.inactiveClients.length === 0 ? (
                <div className="text-center text-zinc-500 py-4">
                  <svg className="w-10 h-10 mx-auto mb-2 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">Todos os clientes estão em dia!</p>
                </div>
              ) : (
                <div className="space-y-2 lg:max-h-[calc(100vh-280px)] lg:overflow-y-auto">
                  {stats.inactiveClients.slice(0, 10).map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-zinc-800/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white text-sm truncate">{client.name}</p>
                        <p className="text-zinc-500 text-xs truncate">{client.phone || '—'}</p>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${
                          client.daysSince === null
                            ? 'bg-red-500/10 text-red-400'
                            : client.daysSince >= 30
                            ? 'bg-orange-500/10 text-orange-400'
                            : 'bg-yellow-500/10 text-yellow-400'
                        }`}
                      >
                        {client.label}
                      </span>
                    </div>
                  ))}
                  {stats.inactiveClients.length > 10 && (
                    <Link
                      to="/clients/last-visit"
                      className="block text-center py-2 text-sm text-amber-400 hover:text-amber-300"
                    >
                      Ver mais {stats.inactiveClients.length - 10} clientes
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Period Selector Modal */}
      <PeriodSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentPeriod={period}
        onApply={handlePeriodApply}
      />
    </Shell>
  )
}
