import { useState, useEffect } from 'react'
import { loadDB, saveDB, createSchedulingRequest } from '../storage/db'
import { toDateInputValue, formatDateBR, moneyBRL } from '../storage/helpers'

// Public page - no auth required
export default function Schedule() {
  const [services, setServices] = useState([])
  const [barbers, setBarbers] = useState([])
  const [defaultBarberId, setDefaultBarberId] = useState('')
  const [barbershopName, setBarbershopName] = useState('')
  
  // Form state
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [preferredDate, setPreferredDate] = useState(toDateInputValue())
  const [preferredTime, setPreferredTime] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [barberId, setBarberId] = useState('')
  const [notes, setNotes] = useState('')
  
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submittedRequest, setSubmittedRequest] = useState(null)

  useEffect(() => {
    const db = loadDB()
    setServices(db.services)
    setBarbers(db.barbers)
    setDefaultBarberId(db.defaultBarberId)
    setBarbershopName(db.barbershopName)
    
    // Pre-select default barber
    if (db.defaultBarberId) {
      setBarberId(db.defaultBarberId)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    // Validate required fields
    if (!clientName.trim()) {
      setError('Informe seu nome')
      return
    }
    if (!clientPhone.trim()) {
      setError('Informe seu telefone')
      return
    }
    if (!preferredDate) {
      setError('Selecione uma data')
      return
    }
    if (!preferredTime) {
      setError('Selecione um horário')
      return
    }

    const db = loadDB()
    const request = createSchedulingRequest(db, {
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      preferredDate,
      preferredTime,
      serviceId: serviceId || null,
      barberId: barberId || null,
      notes: notes.trim(),
    })
    saveDB(db)

    setSubmittedRequest(request)
    setSubmitted(true)
  }

  const handleNewRequest = () => {
    setClientName('')
    setClientPhone('')
    setPreferredDate(toDateInputValue())
    setPreferredTime('')
    setServiceId('')
    setBarberId(defaultBarberId)
    setNotes('')
    setSubmitted(false)
    setSubmittedRequest(null)
  }

  const selectedService = services.find((s) => s.id === serviceId)

  // Success screen
  if (submitted && submittedRequest) {
    const submittedService = services.find((s) => s.id === submittedRequest.serviceId)
    const submittedBarber = barbers.find((b) => b.id === submittedRequest.barberId)

    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col">
        {/* Header */}
        <header className="bg-zinc-900 border-b border-zinc-800 px-4 py-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-lg lg:text-xl font-bold text-amber-500 text-center">{barbershopName}</h1>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-sm lg:max-w-md text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
              <svg className="w-10 h-10 lg:w-12 lg:h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">Pedido Enviado!</h2>
            <p className="text-zinc-400 mb-6 lg:text-lg">
              A barbearia vai confirmar com você pelo telefone informado.
            </p>

            {/* Request Summary */}
            <div className="card text-left mb-6 lg:p-6">
              <h3 className="font-semibold text-zinc-300 mb-3 lg:text-lg">Resumo do pedido</h3>
              <div className="space-y-2 text-sm lg:text-base">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Nome:</span>
                  <span className="text-white">{submittedRequest.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Telefone:</span>
                  <span className="text-white">{submittedRequest.clientPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Data:</span>
                  <span className="text-white">{formatDateBR(submittedRequest.preferredDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Horário:</span>
                  <span className="text-white">{submittedRequest.preferredTime}</span>
                </div>
                {submittedService && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Serviço:</span>
                    <span className="text-white">{submittedService.name}</span>
                  </div>
                )}
                {submittedBarber && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Barbeiro:</span>
                    <span className="text-white">{submittedBarber.name}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleNewRequest}
              className="btn btn-primary w-full lg:text-lg lg:py-3"
            >
              Fazer novo pedido
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Form screen
  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-lg lg:text-xl font-bold text-amber-500 text-center">{barbershopName}</h1>
          <p className="text-zinc-500 text-sm lg:text-base text-center mt-1">Agendar horário</p>
        </div>
      </header>

      {/* Form */}
      <div className="flex-1 px-4 py-6 lg:py-10">
        <div className="max-w-sm lg:max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            {/* Desktop: Two-column layout */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Client Info */}
                <div className="card space-y-4 lg:p-6">
                  <h3 className="font-semibold text-zinc-300 lg:text-lg">Seus dados</h3>
                  <div>
                    <label className="label">Nome *</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Seu nome completo"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Telefone *</label>
                    <input
                      type="tel"
                      className="input"
                      placeholder="(00) 00000-0000"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Date/Time */}
                <div className="card space-y-4 lg:p-6">
                  <h3 className="font-semibold text-zinc-300 lg:text-lg">Quando você quer vir?</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Data *</label>
                      <input
                        type="date"
                        className="input"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        min={toDateInputValue()}
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Horário *</label>
                      <input
                        type="time"
                        className="input"
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4 mt-4 lg:mt-0">
                {/* Service & Barber */}
                <div className="card space-y-4 lg:p-6">
                  <h3 className="font-semibold text-zinc-300 lg:text-lg">Preferências (opcional)</h3>
                  
                  {services.length > 0 && (
                    <div>
                      <label className="label">Serviço</label>
                      <select
                        className="input"
                        value={serviceId}
                        onChange={(e) => setServiceId(e.target.value)}
                      >
                        <option value="">Selecione um serviço</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} - {moneyBRL(service.price)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {barbers.length > 0 && (
                    <div>
                      <label className="label">Barbeiro</label>
                      <select
                        className="input"
                        value={barberId}
                        onChange={(e) => setBarberId(e.target.value)}
                      >
                        <option value="">Sem preferência</option>
                        {barbers.map((barber) => (
                          <option key={barber.id} value={barber.id}>
                            {barber.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="label">Observações</label>
                    <textarea
                      className="input min-h-[80px] resize-none"
                      placeholder="Alguma observação? (opcional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>

                {/* Desktop: Summary */}
                <div className="hidden lg:block card bg-zinc-800/50 border-zinc-700 p-6">
                  <h3 className="font-semibold text-zinc-300 mb-4">Resumo</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Nome</span>
                      <span className="text-white">{clientName || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Data</span>
                      <span className="text-white">{preferredDate ? formatDateBR(preferredDate) : '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Horário</span>
                      <span className="text-white">{preferredTime || '—'}</span>
                    </div>
                    {selectedService && (
                      <div className="flex justify-between pt-2 border-t border-zinc-700">
                        <span className="text-zinc-500">Serviço</span>
                        <span className="text-amber-400">{selectedService.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="mt-6 btn btn-primary w-full text-lg py-4 lg:py-3">
              Enviar Pedido
            </button>

            <p className="text-zinc-600 text-xs text-center mt-4">
              Este é um pedido de agendamento. A barbearia confirmará a disponibilidade.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
