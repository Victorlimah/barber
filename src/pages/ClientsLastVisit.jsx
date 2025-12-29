import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadDB } from '../storage/db'
import { daysBetween, formatDateBR } from '../storage/helpers'
import Shell from '../layout/Shell'

// Build clients list with last visit info
function buildClientsLastVisitList(clients) {
  const now = new Date()
  const nowIso = now.toISOString()

  return clients
    .map((client) => {
      if (!client.lastVisitAt) {
        return {
          ...client,
          lastVisitLabel: 'Nunca',
          daysSince: null,
          daysLabel: 'Nunca',
        }
      }

      const days = daysBetween(client.lastVisitAt, nowIso)
      return {
        ...client,
        lastVisitLabel: formatDateBR(client.lastVisitAt),
        daysSince: days,
        daysLabel: days === 0 ? 'Hoje' : days === 1 ? '1 dia' : `${days} dias`,
      }
    })
    .sort((a, b) => {
      // Nulls (never visited) first, then by daysSince descending
      if (a.daysSince === null && b.daysSince === null) return 0
      if (a.daysSince === null) return -1
      if (b.daysSince === null) return 1
      return b.daysSince - a.daysSince
    })
}

export default function ClientsLastVisit() {
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const db = loadDB()
    const clientsWithVisitInfo = buildClientsLastVisitList(db.clients)
    setClients(clientsWithVisitInfo)
  }, [])

  // Filter clients by search term
  const filteredClients = clients.filter((client) => {
    if (!searchTerm.trim()) return true
    const search = searchTerm.toLowerCase()
    return (
      client.name.toLowerCase().includes(search) ||
      (client.phone && client.phone.toLowerCase().includes(search))
    )
  })

  // Get badge color based on days since last visit
  const getDaysBadgeColor = (daysSince) => {
    if (daysSince === null) return 'bg-red-500/10 text-red-400'
    if (daysSince >= 30) return 'bg-orange-500/10 text-orange-400'
    if (daysSince >= 15) return 'bg-yellow-500/10 text-yellow-400'
    return 'bg-green-500/10 text-green-400'
  }

  return (
    <Shell>
      <div className="space-y-6 lg:space-y-8">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-white">Último Corte</h2>
              <p className="text-zinc-500 text-sm lg:text-base">{clients.length} clientes</p>
            </div>
          </div>

          {/* Legend - Desktop inline */}
          <div className="hidden lg:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              <span className="text-zinc-400">&lt; 15d</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              <span className="text-zinc-400">15-29d</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-400"></span>
              <span className="text-zinc-400">30+d</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              <span className="text-zinc-400">Nunca</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative lg:max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="input pl-10"
            placeholder="Buscar por nome ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Mobile: Cards */}
        <div className="space-y-2 lg:hidden">
          {filteredClients.length === 0 ? (
            <div className="card text-center text-zinc-500 py-8">
              {searchTerm ? (
                <>
                  <svg className="w-12 h-12 mx-auto mb-2 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p>Nenhum cliente encontrado</p>
                </>
              ) : (
                <>
                  <svg className="w-12 h-12 mx-auto mb-2 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p>Nenhum cliente cadastrado</p>
                </>
              )}
            </div>
          ) : (
            filteredClients.map((client) => (
              <div
                key={client.id}
                className="card py-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{client.name}</p>
                    <p className="text-zinc-500 text-sm">{client.phone || '—'}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-zinc-400 text-xs mb-1">
                      {client.lastVisitLabel === 'Nunca' ? 'Nunca veio' : `Último: ${client.lastVisitLabel}`}
                    </p>
                    <span
                      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${getDaysBadgeColor(client.daysSince)}`}
                    >
                      {client.daysLabel}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop: Table */}
        <div className="hidden lg:block">
          {filteredClients.length === 0 ? (
            <div className="card text-center text-zinc-500 py-8">
              {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </div>
          ) : (
            <div className="card p-0 overflow-hidden">
              <table className="w-full">
                <thead className="bg-zinc-800/50">
                  <tr className="text-left text-sm text-zinc-400">
                    <th className="px-4 py-3 font-medium">Nome</th>
                    <th className="px-4 py-3 font-medium">Telefone</th>
                    <th className="px-4 py-3 font-medium">Última Visita</th>
                    <th className="px-4 py-3 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{client.name}</p>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">
                        {client.phone || '—'}
                      </td>
                      <td className="px-4 py-3 text-zinc-400">
                        {client.lastVisitLabel}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${getDaysBadgeColor(client.daysSince)}`}
                        >
                          {client.daysLabel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Legend - Mobile only */}
        <div className="card bg-zinc-800/50 border-zinc-700 lg:hidden">
          <h4 className="text-xs font-medium text-zinc-400 mb-2">Legenda</h4>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              <span className="text-zinc-400">&lt; 15 dias</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              <span className="text-zinc-400">15-29 dias</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-400"></span>
              <span className="text-zinc-400">30+ dias</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              <span className="text-zinc-400">Nunca</span>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}
