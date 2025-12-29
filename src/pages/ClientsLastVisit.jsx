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
      <div className="space-y-6">
        {/* Header with Back Button */}
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
            <h2 className="text-xl font-bold text-white">Último Corte</h2>
            <p className="text-zinc-500 text-sm">{clients.length} clientes cadastrados</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
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

        {/* Clients List */}
        <div className="space-y-2">
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

        {/* Legend */}
        <div className="card bg-zinc-800/50 border-zinc-700">
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


