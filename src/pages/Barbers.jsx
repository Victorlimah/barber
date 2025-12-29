import { useState, useEffect } from 'react'
import { loadDB, saveDB, setDefaultBarber, reassignAppointmentsBarber, getDefaultBarber } from '../storage/db'
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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-white">Barbeiros</h2>
          <p className="text-zinc-500 text-sm">Gerencie a equipe da barbearia</p>
        </div>

        {/* Add Form */}
        <form onSubmit={handleAdd} className="card space-y-4">
          <h3 className="font-semibold text-zinc-300">Novo Barbeiro</h3>
          <div>
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

        {/* Message */}
        {message.text && (
          <div
            className={`p-3 rounded-lg text-sm text-center ${
              message.type === 'success'
                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Barbers List */}
        <div className="space-y-3">
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
      </div>
    </Shell>
  )
}


