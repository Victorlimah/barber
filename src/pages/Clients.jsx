import { useState, useEffect } from 'react'
import { loadDB, saveDB } from '../storage/db'
import { formatDateBR, daysBetween } from '../storage/helpers'
import Shell from '../layout/Shell'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const db = loadDB()
    // Sort clients by name
    const sortedClients = [...db.clients].sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR')
    )
    setClients(sortedClients)
  }, [])

  const handleAdd = (e) => {
    e.preventDefault()
    if (!name.trim()) return

    const db = loadDB()
    const newClient = {
      id: crypto.randomUUID(),
      name: name.trim(),
      phone: phone.trim(),
      lastVisitAt: null,
    }
    db.clients.push(newClient)
    saveDB(db)

    // Sort and update
    const sortedClients = [...db.clients].sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR')
    )
    setClients(sortedClients)

    // Reset form
    setName('')
    setPhone('')
    showMessage('Cliente adicionado!')
  }

  const handleRemove = (id) => {
    const db = loadDB()
    // Remove client
    db.clients = db.clients.filter((c) => c.id !== id)
    // Also remove their appointments for consistency
    db.appointments = db.appointments.filter((a) => a.clientId !== id)
    saveDB(db)

    // Sort and update
    const sortedClients = [...db.clients].sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR')
    )
    setClients(sortedClients)
    showMessage('Cliente removido')
  }

  const showMessage = (msg) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 2000)
  }

  // Filter clients by search
  const filteredClients = clients.filter((client) => {
    if (!searchTerm.trim()) return true
    const search = searchTerm.toLowerCase()
    return (
      client.name.toLowerCase().includes(search) ||
      (client.phone && client.phone.toLowerCase().includes(search))
    )
  })

  // Compute last visit info
  const getLastVisitInfo = (lastVisitAt) => {
    if (!lastVisitAt) {
      return { label: 'Nunca', days: null }
    }
    const days = daysBetween(lastVisitAt, new Date().toISOString())
    return {
      label: formatDateBR(lastVisitAt),
      days: days === 0 ? 'Hoje' : `${days}d`,
    }
  }

  return (
    <Shell>
      <div className="space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-white">Clientes</h2>
            <p className="text-zinc-500 text-sm lg:text-base">
              {clients.length} clientes cadastrados
            </p>
          </div>
        </div>

        {/* Desktop: Two-column layout */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left Column: Add Form (sidebar on desktop) */}
          <div className="lg:col-span-1">
            <form onSubmit={handleAdd} className="card space-y-4 lg:sticky lg:top-24">
              <h3 className="font-semibold text-zinc-300 lg:text-lg">Novo Cliente</h3>
              <div>
                <label className="label">Nome</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">Telefone</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="(opcional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary w-full">
                Adicionar Cliente
              </button>
            </form>

            {/* Success Message */}
            {message && (
              <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
                {message}
              </div>
            )}
          </div>

          {/* Right Column: Clients List */}
          <div className="mt-6 lg:mt-0 lg:col-span-2 space-y-4">
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
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Mobile: Cards */}
            <div className="space-y-2 lg:hidden">
              {filteredClients.length === 0 ? (
                <div className="card text-center text-zinc-500 py-8">
                  {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                </div>
              ) : (
                filteredClients.map((client) => {
                  const visitInfo = getLastVisitInfo(client.lastVisitAt)
                  return (
                    <div
                      key={client.id}
                      className="card flex items-center justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white truncate">{client.name}</p>
                        <p className="text-zinc-500 text-sm">
                          {client.phone || '—'} • {visitInfo.label}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(client.id)}
                        className="p-2 text-zinc-500 hover:text-red-400 transition-colors ml-2"
                        title="Remover"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )
                })
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
                        <th className="px-4 py-3 font-medium text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {filteredClients.map((client) => {
                        const visitInfo = getLastVisitInfo(client.lastVisitAt)
                        return (
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
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-zinc-400">{visitInfo.label}</span>
                                {visitInfo.days && (
                                  <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
                                    {visitInfo.days}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleRemove(client.id)}
                                className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-all"
                                title="Remover cliente"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}
