import { Link } from 'react-router-dom'
import Shell from '../layout/Shell'

const menuItems = [
  {
    to: '/services',
    label: 'Serviços',
    description: 'Gerenciar cortes e preços',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
      </svg>
    ),
  },
  {
    to: '/barbers',
    label: 'Equipe',
    description: 'Gerenciar barbeiros',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    to: '/clients/last-visit',
    label: 'Relatório de Visitas',
    description: 'Ver histórico de clientes',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    to: '/schedule',
    label: 'Link de Agendamento',
    description: 'Página pública para clientes',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    external: true,
  },
]

export default function More() {
  return (
    <Shell>
      <div className="space-y-6 lg:space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-white">Mais</h2>
          <p className="text-zinc-500 text-sm lg:text-base">Configurações e opções</p>
        </div>

        {/* Desktop: Grid layout */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-6">
          {/* Menu Items */}
          <div className="space-y-3">
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                target={item.external ? '_blank' : undefined}
                className="card flex items-center gap-4 hover:bg-zinc-800/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">{item.label}</p>
                  <p className="text-zinc-500 text-sm">{item.description}</p>
                </div>
                <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>

          {/* Public Link Copy */}
          <div className="mt-6 lg:mt-0">
            <div className="card bg-zinc-800/50 border-zinc-700 lg:sticky lg:top-24">
              <h3 className="font-semibold text-zinc-300 lg:text-lg mb-2">Link para clientes</h3>
              <p className="text-zinc-500 text-sm mb-4">
                Compartilhe este link para que clientes possam solicitar agendamentos:
              </p>
              <div className="flex gap-2">
                <code className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 text-amber-400 text-sm break-all">
                  {window.location.origin}/schedule
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/schedule`)
                    alert('Link copiado!')
                  }}
                  className="px-4 py-2 rounded-lg bg-amber-500 text-zinc-900 text-sm font-medium hover:bg-amber-400 transition-colors"
                >
                  Copiar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}
