import { useState, useEffect } from 'react'
import { loadDB, saveDB } from '../storage/db'
import Shell from '../layout/Shell'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const db = loadDB()
    setClients(db.clients)
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
    setClients([...db.clients])

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
    setClients([...db.clients])
    showMessage('Cliente removido')
  }

  const showMessage = (msg) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 2000)
  }

  // Format phone for display
  const formatPhone = (phone) => {
    if (!phone) return '—'
    return phone
  }

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-white">Clientes</h2>
          <p className="text-zinc-500 text-sm">Cadastro de clientes</p>
        </div>

        {/* Add Form */}
        <form onSubmit={handleAdd} className="card space-y-4">
          <h3 className="font-semibold text-zinc-300">Novo Cliente</h3>
          <div>
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
            <input
              type="tel"
              className="input"
              placeholder="Telefone (opcional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            Adicionar
          </button>
        </form>

        {/* Success Message */}
        {message && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
            {message}
          </div>
        )}

        {/* Clients List */}
        <div className="space-y-3">
          {clients.length === 0 ? (
            <div className="card text-center text-zinc-500 py-8">
              Nenhum cliente cadastrado
            </div>
          ) : (
            clients.map((client) => (
              <div
                key={client.id}
                className="card flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-white">{client.name}</p>
                  <p className="text-zinc-500 text-sm">
                    {formatPhone(client.phone)}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(client.id)}
                  className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                  title="Remover"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </Shell>
  )
}
