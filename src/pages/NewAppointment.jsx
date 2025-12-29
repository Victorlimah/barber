import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { loadDB, saveDB } from '../storage/db'
import { moneyBRL, toDateInputValue } from '../storage/helpers'
import Shell from '../layout/Shell'

export default function NewAppointment() {
  const location = useLocation()
  const prefillData = location.state?.prefill || null
  
  const [clients, setClients] = useState([])
  const [services, setServices] = useState([])
  const [barbers, setBarbers] = useState([])
  
  // Form state
  const [clientMode, setClientMode] = useState('existing') // 'existing' or 'new'
  const [selectedClientId, setSelectedClientId] = useState('')
  const [newClientName, setNewClientName] = useState('')
  const [newClientPhone, setNewClientPhone] = useState('')
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [selectedBarberId, setSelectedBarberId] = useState('')
  const [price, setPrice] = useState('')
  const [date, setDate] = useState(toDateInputValue())
  
  const [message, setMessage] = useState({ type: '', text: '' })
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const db = loadDB()
    setClients(db.clients)
    setServices(db.services)
    setBarbers(db.barbers)
    
    // Handle prefill data from Inbox
    if (prefillData && !initialized) {
      handlePrefill(db, prefillData)
      setInitialized(true)
    } else if (!initialized) {
      // Default initialization without prefill
      // Auto-select first service if available
      if (db.services.length > 0) {
        setSelectedServiceId(db.services[0].id)
        setPrice(db.services[0].price.toString())
      }
      
      // Auto-select default barber
      if (db.defaultBarberId) {
        setSelectedBarberId(db.defaultBarberId)
      } else if (db.barbers.length > 0) {
        setSelectedBarberId(db.barbers[0].id)
      }
      setInitialized(true)
    }
  }, [prefillData, initialized])

  const handlePrefill = (db, prefill) => {
    // Try to find existing client by phone
    if (prefill.clientPhone) {
      const existingClient = db.clients.find(
        (c) => c.phone && c.phone.replace(/\D/g, '') === prefill.clientPhone.replace(/\D/g, '')
      )
      
      if (existingClient) {
        setClientMode('existing')
        setSelectedClientId(existingClient.id)
      } else {
        setClientMode('new')
        setNewClientName(prefill.clientName || '')
        setNewClientPhone(prefill.clientPhone || '')
      }
    } else if (prefill.clientName) {
      setClientMode('new')
      setNewClientName(prefill.clientName)
    }

    // Service
    if (prefill.serviceId && db.services.find((s) => s.id === prefill.serviceId)) {
      setSelectedServiceId(prefill.serviceId)
      const service = db.services.find((s) => s.id === prefill.serviceId)
      if (service) {
        setPrice(service.price.toString())
      }
    } else if (db.services.length > 0) {
      setSelectedServiceId(db.services[0].id)
      setPrice(db.services[0].price.toString())
    }

    // Barber
    if (prefill.barberId && db.barbers.find((b) => b.id === prefill.barberId)) {
      setSelectedBarberId(prefill.barberId)
    } else if (db.defaultBarberId) {
      setSelectedBarberId(db.defaultBarberId)
    } else if (db.barbers.length > 0) {
      setSelectedBarberId(db.barbers[0].id)
    }

    // Date
    if (prefill.preferredDate) {
      setDate(prefill.preferredDate)
    }

    // Show info message
    showMessage('info', 'Dados preenchidos a partir do pedido de agendamento')
  }

  // Update price when service changes
  const handleServiceChange = (serviceId) => {
    setSelectedServiceId(serviceId)
    const service = services.find((s) => s.id === serviceId)
    if (service) {
      setPrice(service.price.toString())
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate
    if (clientMode === 'existing' && !selectedClientId) {
      showMessage('error', 'Selecione um cliente')
      return
    }
    if (clientMode === 'new' && !newClientName.trim()) {
      showMessage('error', 'Informe o nome do cliente')
      return
    }
    if (!selectedServiceId) {
      showMessage('error', 'Selecione um serviço')
      return
    }
    if (!selectedBarberId) {
      showMessage('error', 'Selecione um barbeiro')
      return
    }
    if (!price || parseFloat(price) < 0) {
      showMessage('error', 'Informe um valor válido')
      return
    }
    if (!date) {
      showMessage('error', 'Informe a data')
      return
    }

    const db = loadDB()
    let clientId = selectedClientId

    // Create new client if needed
    if (clientMode === 'new') {
      const newClient = {
        id: crypto.randomUUID(),
        name: newClientName.trim(),
        phone: newClientPhone.trim(),
        lastVisitAt: null,
      }
      db.clients.push(newClient)
      clientId = newClient.id
    }

    // Create appointment with midday time to avoid timezone issues
    const dateAt = new Date(date + 'T12:00:00').toISOString()
    
    const appointment = {
      id: crypto.randomUUID(),
      clientId,
      serviceId: selectedServiceId,
      barberId: selectedBarberId,
      price: parseFloat(price),
      dateAt,
    }
    db.appointments.push(appointment)

    // Update client's lastVisitAt
    const clientIndex = db.clients.findIndex((c) => c.id === clientId)
    if (clientIndex !== -1) {
      db.clients[clientIndex].lastVisitAt = dateAt
    }

    saveDB(db)
    
    // Refresh clients list
    setClients([...db.clients])
    
    // Reset form
    resetForm()
    showMessage('success', 'Atendimento registrado!')
  }

  const resetForm = () => {
    setClientMode('existing')
    setSelectedClientId('')
    setNewClientName('')
    setNewClientPhone('')
    setDate(toDateInputValue())
    // Keep service and barber selection
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    if (type !== 'info') {
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const selectedService = services.find((s) => s.id === selectedServiceId)

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-white">Novo Atendimento</h2>
          <p className="text-zinc-500 text-sm">Registre um atendimento</p>
        </div>

        {/* Info Message (from prefill) */}
        {message.type === 'info' && (
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{message.text}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Barber Selection */}
          <div className="card space-y-4">
            <h3 className="font-semibold text-zinc-300">Barbeiro</h3>
            
            {barbers.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-4">
                Nenhum barbeiro cadastrado. Adicione em Equipe.
              </p>
            ) : (
              <select
                className="input"
                value={selectedBarberId}
                onChange={(e) => setSelectedBarberId(e.target.value)}
              >
                {barbers.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.name} {barber.isDefault && '(Padrão)'}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Client Selection Mode */}
          <div className="card space-y-4">
            <h3 className="font-semibold text-zinc-300">Cliente</h3>
            
            {/* Mode Toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setClientMode('existing')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  clientMode === 'existing'
                    ? 'bg-amber-500 text-zinc-900'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Existente
              </button>
              <button
                type="button"
                onClick={() => setClientMode('new')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  clientMode === 'new'
                    ? 'bg-amber-500 text-zinc-900'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Novo Cliente
              </button>
            </div>

            {clientMode === 'existing' ? (
              <div>
                {clients.length === 0 ? (
                  <p className="text-zinc-500 text-sm text-center py-4">
                    Nenhum cliente cadastrado. Selecione "Novo Cliente".
                  </p>
                ) : (
                  <select
                    className="input"
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                  >
                    <option value="">Selecione um cliente</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.phone && `(${client.phone})`}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  className="input"
                  placeholder="Nome do cliente"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                />
                <input
                  type="tel"
                  className="input"
                  placeholder="Telefone (opcional)"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Service Selection */}
          <div className="card space-y-4">
            <h3 className="font-semibold text-zinc-300">Serviço</h3>
            
            {services.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-4">
                Nenhum serviço cadastrado. Adicione em Serviços.
              </p>
            ) : (
              <>
                <select
                  className="input"
                  value={selectedServiceId}
                  onChange={(e) => handleServiceChange(e.target.value)}
                >
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {moneyBRL(service.price)}
                    </option>
                  ))}
                </select>

                {/* Price Override */}
                <div>
                  <label className="label">
                    Valor {selectedService && `(sugerido: ${moneyBRL(selectedService.price)})`}
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                    step="0.01"
                    placeholder="Valor"
                  />
                </div>
              </>
            )}
          </div>

          {/* Date Selection */}
          <div className="card space-y-4">
            <h3 className="font-semibold text-zinc-300">Data</h3>
            <input
              type="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Message */}
          {message.text && message.type !== 'info' && (
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

          {/* Submit */}
          <button type="submit" className="btn btn-primary w-full text-lg py-4">
            Registrar Atendimento
          </button>
        </form>
      </div>
    </Shell>
  )
}
