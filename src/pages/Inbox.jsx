import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  loadDB,
  saveDB,
  REQUEST_STATUS,
  updateRequestStatus,
  updateLastSeenRequestAt,
} from '../storage/db'
import { formatDateBR, formatRelativeTime, moneyBRL } from '../storage/helpers'
import Shell from '../layout/Shell'

const STATUS_LABELS = {
  [REQUEST_STATUS.PENDING]: 'Pendente',
  [REQUEST_STATUS.SEEN]: 'Visto',
  [REQUEST_STATUS.DONE]: 'Concluído',
  [REQUEST_STATUS.DISMISSED]: 'Dispensado',
}

const STATUS_COLORS = {
  [REQUEST_STATUS.PENDING]: 'bg-amber-500/10 text-amber-400',
  [REQUEST_STATUS.SEEN]: 'bg-blue-500/10 text-blue-400',
  [REQUEST_STATUS.DONE]: 'bg-green-500/10 text-green-400',
  [REQUEST_STATUS.DISMISSED]: 'bg-zinc-500/10 text-zinc-400',
}

export default function Inbox() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [services, setServices] = useState([])
  const [barbers, setBarbers] = useState([])
  const [filter, setFilter] = useState('active') // 'active', 'done', 'dismissed', 'all'
  const [selectedRequestId, setSelectedRequestId] = useState(null)

  useEffect(() => {
    const db = loadDB()
    setRequests(db.schedulingRequests)
    setServices(db.services)
    setBarbers(db.barbers)

    // Mark requests as seen
    updateLastSeenRequestAt(db)
    saveDB(db)
  }, [])

  const getServiceName = (serviceId) => {
    const service = services.find((s) => s.id === serviceId)
    return service ? service.name : null
  }

  const getServicePrice = (serviceId) => {
    const service = services.find((s) => s.id === serviceId)
    return service ? service.price : null
  }

  const getBarberName = (barberId) => {
    const barber = barbers.find((b) => b.id === barberId)
    return barber ? barber.name : null
  }

  const handleStatusChange = (requestId, newStatus) => {
    const db = loadDB()
    updateRequestStatus(db, requestId, newStatus)
    saveDB(db)
    setRequests([...db.schedulingRequests])
  }

  const handleCreateAppointment = (request) => {
    // Navigate to NewAppointment with prefill data
    navigate('/appointments/new', {
      state: {
        prefill: {
          clientName: request.clientName,
          clientPhone: request.clientPhone,
          serviceId: request.serviceId,
          barberId: request.barberId,
          preferredDate: request.preferredDate,
        },
        fromRequest: request.id,
      },
    })
  }

  // Filter requests based on selected filter
  const filteredRequests = requests
    .filter((r) => {
      switch (filter) {
        case 'active':
          return r.status === REQUEST_STATUS.PENDING || r.status === REQUEST_STATUS.SEEN
        case 'done':
          return r.status === REQUEST_STATUS.DONE
        case 'dismissed':
          return r.status === REQUEST_STATUS.DISMISSED
        default:
          return true
      }
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const activeCount = requests.filter(
    (r) => r.status === REQUEST_STATUS.PENDING || r.status === REQUEST_STATUS.SEEN
  ).length
  const doneCount = requests.filter((r) => r.status === REQUEST_STATUS.DONE).length
  const dismissedCount = requests.filter((r) => r.status === REQUEST_STATUS.DISMISSED).length

  // Desktop: Get selected request
  const selectedRequest = filteredRequests.find((r) => r.id === selectedRequestId) || filteredRequests[0]

  return (
    <Shell>
      <div className="space-y-6 lg:space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-white">Agendamentos</h2>
          <p className="text-zinc-500 text-sm lg:text-base">
            {requests.length} pedidos de clientes
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">
          <button
            onClick={() => setFilter('active')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'active'
                ? 'bg-amber-500 text-zinc-900'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Ativos
            {activeCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                filter === 'active' ? 'bg-zinc-900/20' : 'bg-zinc-700'
              }`}>
                {activeCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter('done')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'done'
                ? 'bg-green-500 text-zinc-900'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Concluídos
            {doneCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                filter === 'done' ? 'bg-zinc-900/20' : 'bg-zinc-700'
              }`}>
                {doneCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter('dismissed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'dismissed'
                ? 'bg-zinc-500 text-zinc-900'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Dispensados
            {dismissedCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                filter === 'dismissed' ? 'bg-zinc-900/20' : 'bg-zinc-700'
              }`}>
                {dismissedCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile: Requests List */}
        <div className="space-y-3 lg:hidden">
          {filteredRequests.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            filteredRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                serviceName={getServiceName(request.serviceId)}
                servicePrice={getServicePrice(request.serviceId)}
                barberName={getBarberName(request.barberId)}
                onStatusChange={handleStatusChange}
                onCreateAppointment={handleCreateAppointment}
              />
            ))
          )}
        </div>

        {/* Desktop: Master-Detail Layout */}
        <div className="hidden lg:grid lg:grid-cols-5 lg:gap-6">
          {/* Left Panel: Request List */}
          <div className="col-span-2 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
            {filteredRequests.length === 0 ? (
              <EmptyState filter={filter} />
            ) : (
              filteredRequests.map((request) => (
                <button
                  key={request.id}
                  onClick={() => setSelectedRequestId(request.id)}
                  className={`w-full text-left card py-3 transition-all ${
                    selectedRequest?.id === request.id
                      ? 'border-amber-500/50 bg-zinc-800/50'
                      : 'hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white truncate">{request.clientName}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[request.status]}`}>
                          {STATUS_LABELS[request.status]}
                        </span>
                      </div>
                      <p className="text-zinc-500 text-sm truncate">{request.clientPhone}</p>
                      <div className="flex items-center gap-2 mt-1 text-sm">
                        <span className="text-amber-400">{formatDateBR(request.preferredDate)}</span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-zinc-400">{request.preferredTime}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Right Panel: Request Detail */}
          <div className="col-span-3">
            {selectedRequest ? (
              <RequestDetail
                request={selectedRequest}
                serviceName={getServiceName(selectedRequest.serviceId)}
                servicePrice={getServicePrice(selectedRequest.serviceId)}
                barberName={getBarberName(selectedRequest.barberId)}
                onStatusChange={handleStatusChange}
                onCreateAppointment={handleCreateAppointment}
              />
            ) : (
              <div className="card text-center text-zinc-500 py-12">
                <svg className="w-12 h-12 mx-auto mb-2 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <p>Selecione um pedido</p>
              </div>
            )}
          </div>
        </div>

        {/* Public Link Info */}
        <div className="card bg-zinc-800/50 border-zinc-700">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white text-sm">Link para clientes</p>
              <p className="text-zinc-400 text-xs mt-0.5">Compartilhe o link para receber pedidos:</p>
              <code className="text-amber-400 text-xs mt-1 block break-all">
                {window.location.origin}/schedule
              </code>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}

// Empty State Component
function EmptyState({ filter }) {
  return (
    <div className="card text-center text-zinc-500 py-8">
      <svg className="w-12 h-12 mx-auto mb-2 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p>Nenhum pedido {filter === 'active' ? 'ativo' : filter === 'done' ? 'concluído' : 'dispensado'}</p>
    </div>
  )
}

// Desktop Request Detail Component
function RequestDetail({ request, serviceName, servicePrice, barberName, onStatusChange, onCreateAppointment }) {
  const isPending = request.status === REQUEST_STATUS.PENDING
  const isSeen = request.status === REQUEST_STATUS.SEEN
  const isDone = request.status === REQUEST_STATUS.DONE
  const isDismissed = request.status === REQUEST_STATUS.DISMISSED

  return (
    <div className="card lg:p-6 space-y-6 lg:sticky lg:top-24">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">{request.clientName}</h3>
          <p className="text-zinc-400">{request.clientPhone}</p>
        </div>
        <span className={`text-sm font-medium px-3 py-1 rounded-full ${STATUS_COLORS[request.status]}`}>
          {STATUS_LABELS[request.status]}
        </span>
      </div>

      {/* Date/Time */}
      <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-xl">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p className="text-amber-400 font-medium text-lg">{formatDateBR(request.preferredDate)}</p>
          <p className="text-zinc-400">às {request.preferredTime}</p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-zinc-800/30 rounded-xl">
          <p className="text-zinc-500 text-sm mb-1">Serviço</p>
          <p className="text-white font-medium">{serviceName || '—'}</p>
          {servicePrice && (
            <p className="text-amber-400 text-sm mt-0.5">{moneyBRL(servicePrice)}</p>
          )}
        </div>
        <div className="p-4 bg-zinc-800/30 rounded-xl">
          <p className="text-zinc-500 text-sm mb-1">Barbeiro</p>
          <p className="text-white font-medium">{barberName || '—'}</p>
        </div>
      </div>

      {/* Notes */}
      {request.notes && (
        <div className="p-4 bg-zinc-800/30 rounded-xl">
          <p className="text-zinc-500 text-sm mb-1">Observações</p>
          <p className="text-white">{request.notes}</p>
        </div>
      )}

      {/* Timestamps */}
      <div className="text-xs text-zinc-500 flex items-center gap-4">
        <span>Criado: {formatRelativeTime(request.createdAt)}</span>
        {request.updatedAt !== request.createdAt && (
          <span>Atualizado: {formatRelativeTime(request.updatedAt)}</span>
        )}
      </div>

      {/* Actions */}
      {(isPending || isSeen) && (
        <div className="space-y-3 pt-4 border-t border-zinc-800">
          <div className="flex gap-2">
            {isPending && (
              <button
                onClick={() => onStatusChange(request.id, REQUEST_STATUS.SEEN)}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
              >
                Marcar como visto
              </button>
            )}
            <button
              onClick={() => onStatusChange(request.id, REQUEST_STATUS.DONE)}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
            >
              Concluir
            </button>
            <button
              onClick={() => onStatusChange(request.id, REQUEST_STATUS.DISMISSED)}
              className="py-2.5 px-4 rounded-xl text-sm font-medium bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              Dispensar
            </button>
          </div>

          <button
            onClick={() => onCreateAppointment(request)}
            className="w-full py-3 px-4 rounded-xl text-sm font-medium bg-amber-500 text-zinc-900 hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Registrar Atendimento
          </button>
        </div>
      )}

      {/* Reactivate for dismissed/done */}
      {(isDone || isDismissed) && (
        <div className="pt-4 border-t border-zinc-800">
          <button
            onClick={() => onStatusChange(request.id, REQUEST_STATUS.PENDING)}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-medium bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            Reativar pedido
          </button>
        </div>
      )}
    </div>
  )
}

// Mobile Request Card Component
function RequestCard({ request, serviceName, servicePrice, barberName, onStatusChange, onCreateAppointment }) {
  const [expanded, setExpanded] = useState(false)

  const isPending = request.status === REQUEST_STATUS.PENDING
  const isSeen = request.status === REQUEST_STATUS.SEEN
  const isDone = request.status === REQUEST_STATUS.DONE
  const isDismissed = request.status === REQUEST_STATUS.DISMISSED

  return (
    <div className={`card ${isPending ? 'border-amber-500/30' : ''}`}>
      {/* Header */}
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-white truncate">{request.clientName}</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[request.status]}`}>
              {STATUS_LABELS[request.status]}
            </span>
          </div>
          <p className="text-zinc-500 text-sm">{request.clientPhone}</p>
          <div className="flex items-center gap-2 mt-1 text-sm">
            <span className="text-amber-400">{formatDateBR(request.preferredDate)}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-white">{request.preferredTime}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-zinc-500 text-xs">{formatRelativeTime(request.createdAt)}</p>
          <svg
            className={`w-5 h-5 text-zinc-500 mt-1 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-zinc-800 space-y-4">
          {/* Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-zinc-500 block">Serviço</span>
              <span className="text-white">{serviceName || '—'}</span>
              {servicePrice && (
                <span className="text-zinc-400 text-xs ml-1">({moneyBRL(servicePrice)})</span>
              )}
            </div>
            <div>
              <span className="text-zinc-500 block">Barbeiro</span>
              <span className="text-white">{barberName || '—'}</span>
            </div>
          </div>

          {request.notes && (
            <div className="text-sm">
              <span className="text-zinc-500 block">Observações</span>
              <span className="text-white">{request.notes}</span>
            </div>
          )}

          {/* Actions */}
          {(isPending || isSeen) && (
            <div className="flex flex-wrap gap-2 pt-2">
              {isPending && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onStatusChange(request.id, REQUEST_STATUS.SEEN)
                  }}
                  className="flex-1 py-2 px-3 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                >
                  Marcar como visto
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onStatusChange(request.id, REQUEST_STATUS.DONE)
                }}
                className="flex-1 py-2 px-3 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
              >
                Concluir
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onStatusChange(request.id, REQUEST_STATUS.DISMISSED)
                }}
                className="py-2 px-3 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                Dispensar
              </button>
            </div>
          )}

          {/* Create Appointment Button */}
          {(isPending || isSeen) && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCreateAppointment(request)
              }}
              className="w-full py-3 px-4 rounded-lg text-sm font-medium bg-amber-500 text-zinc-900 hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Registrar Atendimento
            </button>
          )}

          {/* Reactivate for dismissed/done */}
          {(isDone || isDismissed) && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onStatusChange(request.id, REQUEST_STATUS.PENDING)
              }}
              className="w-full py-2 px-3 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              Reativar pedido
            </button>
          )}
        </div>
      )}
    </div>
  )
}
