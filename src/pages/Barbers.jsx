import { useState, useEffect } from 'react'
import { loadDB, saveDB, setDefaultBarber, reassignAppointmentsBarber } from '../storage/db'
import Shell from '../layout/Shell'

export default function Barbers() {
  const [barbers, setBarbers] = useState([])
  const [defaultBarberId, setDefaultBarberId] = useState(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    const db = loadDB()
    setBarbers(db.barbers)
    setDefaultBarberId(db.defaultBarberId)
  }, [])

  const handleAdd = (e) => {
    e.preventDefault()
    if (!name.trim()) return

    const db = loadDB()
    const newBarber = {
      id: crypto.randomUUID(),
      name: name.trim(),
      phone: phone.trim(),
      isDefault: db.barbers.length === 0, // First barber is default
    }
    
    db.barbers.push(newBarber)
    
    // If this is the first barber, set as default
    if (newBarber.isDefault) {
      db.defaultBarberId = newBarber.id
    }
    
    saveDB(db)
    setBarbers([...db.barbers])
    setDefaultBarberId(db.defaultBarberId)

    // Reset form
    setName('')
    setPhone('')
    showMessage('success', 'Barbeiro adicionado!')
  }

  const handleSetDefault = (barberId) => {
    const db = loadDB()
    setDefaultBarber(db, barberId)
    saveDB(db)
    
    setBarbers([...db.barbers])
    setDefaultBarberId(db.defaultBarberId)
    showMessage('success', 'Barbeiro definido como padrão!')
  }

  const handleRemove = (barberId) => {
    const db = loadDB()
    const barber = db.barbers.find((b) => b.id === barberId)
    
    // Can't remove the last barber
    if (db.barbers.length === 1) {
      showMessage('error', 'Precisa ter pelo menos 1 barbeiro.')
      return
    }

    // Find new default if removing the default barber
    let newDefaultId = db.defaultBarberId
    if (barber.isDefault) {
      const remaining = db.barbers.filter((b) => b.id !== barberId)
      if (remaining.length > 0) {
        newDefaultId = remaining[0].id
        setDefaultBarber(db, newDefaultId)
      }
    }

    // Reassign appointments from removed barber to the default
    reassignAppointmentsBarber(db, barberId, newDefaultId)

    // Remove the barber
    db.barbers = db.barbers.filter((b) => b.id !== barberId)
    
    saveDB(db)
    setBarbers([...db.barbers])
    setDefaultBarberId(db.defaultBarberId)
    showMessage('success', 'Barbeiro removido. Atendimentos reatribuídos.')
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  return (
    <Shell>
      <div className="space-y-6 lg:space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-white">Equipe</h2>
          <p className="text-zinc-500 text-sm lg:text-base">
            {barbers.length} barbeiros cadastrados
          </p>
        </div>

        {/* Desktop: Two-column layout */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left Column: Add Form */}
          <div className="lg:col-span-1">
            <form onSubmit={handleAdd} className="card space-y-4 lg:sticky lg:top-24">
              <h3 className="font-semibold text-zinc-300 lg:text-lg">Novo Barbeiro</h3>
              <div>
                <label className="label">Nome</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Nome do barbeiro"
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
                Adicionar Barbeiro
              </button>
            </form>

            {/* Message */}
            {message.text && (
              <div
                className={`mt-4 p-3 rounded-lg text-sm text-center ${
                  message.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}
              >
                {message.text}
              </div>
            )}
          </div>

          {/* Right Column: Barbers List */}
          <div className="mt-6 lg:mt-0 lg:col-span-2">
            {/* Mobile: Cards */}
            <div className="space-y-3 lg:hidden">
              {barbers.length === 0 ? (
                <div className="card text-center text-zinc-500 py-8">
                  Nenhum barbeiro cadastrado
                </div>
              ) : (
                barbers.map((barber) => (
                  <div
                    key={barber.id}
                    className="card space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">{barber.name}</p>
                          {barber.isDefault && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">
                              Padrão
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-500 text-sm">
                          {barber.phone || 'Sem telefone'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-zinc-800">
                      {!barber.isDefault && (
                        <button
                          onClick={() => handleSetDefault(barber.id)}
                          className="flex-1 py-2 px-3 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                        >
                          Definir como padrão
                        </button>
                      )}
                      <button
                        onClick={() => handleRemove(barber.id)}
                        className="py-2 px-3 rounded-lg text-xs font-medium bg-zinc-800 text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop: Table */}
            <div className="hidden lg:block">
              {barbers.length === 0 ? (
                <div className="card text-center text-zinc-500 py-8">
                  Nenhum barbeiro cadastrado
                </div>
              ) : (
                <div className="card p-0 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-zinc-800/50">
                      <tr className="text-left text-sm text-zinc-400">
                        <th className="px-4 py-3 font-medium">Barbeiro</th>
                        <th className="px-4 py-3 font-medium">Telefone</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {barbers.map((barber) => (
                        <tr
                          key={barber.id}
                          className="hover:bg-zinc-800/30 transition-colors"
                        >
                          <td className="px-4 py-4">
                            <p className="font-medium text-white">{barber.name}</p>
                          </td>
                          <td className="px-4 py-4 text-zinc-400">
                            {barber.phone || '—'}
                          </td>
                          <td className="px-4 py-4">
                            {barber.isDefault && (
                              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500">
                                Padrão
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!barber.isDefault && (
                                <button
                                  onClick={() => handleSetDefault(barber.id)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                                >
                                  Definir padrão
                                </button>
                              )}
                              <button
                                onClick={() => handleRemove(barber.id)}
                                className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-all"
                                title="Remover barbeiro"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
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
