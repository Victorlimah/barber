import { useState, useEffect } from 'react'
import { loadDB, saveDB } from '../storage/db'
import { moneyBRL } from '../storage/helpers'
import Shell from '../layout/Shell'

export default function Services() {
  const [services, setServices] = useState([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const db = loadDB()
    setServices(db.services)
  }, [])

  const handleAdd = (e) => {
    e.preventDefault()
    if (!name.trim() || !price) return

    const db = loadDB()
    const newService = {
      id: crypto.randomUUID(),
      name: name.trim(),
      price: parseFloat(price),
    }
    db.services.push(newService)
    saveDB(db)
    setServices([...db.services])

    // Reset form
    setName('')
    setPrice('')
    showMessage('Serviço adicionado!')
  }

  const handleRemove = (id) => {
    const db = loadDB()
    db.services = db.services.filter((s) => s.id !== id)
    saveDB(db)
    setServices([...db.services])
    showMessage('Serviço removido')
  }

  const showMessage = (msg) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 2000)
  }

  return (
    <Shell>
      <div className="space-y-6 lg:space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-white">Serviços</h2>
          <p className="text-zinc-500 text-sm lg:text-base">
            {services.length} serviços cadastrados
          </p>
        </div>

        {/* Desktop: Two-column layout */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left Column: Add Form */}
          <div className="lg:col-span-1">
            <form onSubmit={handleAdd} className="card space-y-4 lg:sticky lg:top-24">
              <h3 className="font-semibold text-zinc-300 lg:text-lg">Novo Serviço</h3>
              <div>
                <label className="label">Nome</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ex: Corte + Barba"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">Preço (R$)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-full">
                Adicionar Serviço
              </button>
            </form>

            {/* Success Message */}
            {message && (
              <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
                {message}
              </div>
            )}
          </div>

          {/* Right Column: Services List */}
          <div className="mt-6 lg:mt-0 lg:col-span-2">
            {/* Mobile: Cards */}
            <div className="space-y-2 lg:hidden">
              {services.length === 0 ? (
                <div className="card text-center text-zinc-500 py-8">
                  Nenhum serviço cadastrado
                </div>
              ) : (
                services.map((service) => (
                  <div
                    key={service.id}
                    className="card flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-white">{service.name}</p>
                      <p className="text-amber-500 font-semibold">
                        {moneyBRL(service.price)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemove(service.id)}
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

            {/* Desktop: Table */}
            <div className="hidden lg:block">
              {services.length === 0 ? (
                <div className="card text-center text-zinc-500 py-8">
                  Nenhum serviço cadastrado
                </div>
              ) : (
                <div className="card p-0 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-zinc-800/50">
                      <tr className="text-left text-sm text-zinc-400">
                        <th className="px-4 py-3 font-medium">Serviço</th>
                        <th className="px-4 py-3 font-medium">Preço</th>
                        <th className="px-4 py-3 font-medium text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {services.map((service) => (
                        <tr
                          key={service.id}
                          className="hover:bg-zinc-800/30 transition-colors"
                        >
                          <td className="px-4 py-4">
                            <p className="font-medium text-white">{service.name}</p>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-amber-500 font-semibold text-lg">
                              {moneyBRL(service.price)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              onClick={() => handleRemove(service.id)}
                              className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-all"
                              title="Remover serviço"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
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
