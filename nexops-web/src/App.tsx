import { Layout } from '@/components/shared/Layout'

function App() {
  return (
    <Layout>
      <div className="space-y-4">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Bem-vindo ao NexOps
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            Plataforma de gestão de TI — Helpdesk, Inventário e Governança.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Chamados abertos', value: '24', color: 'var(--brand)' },
            { label: 'Ativos em inventário', value: '312', color: 'var(--success)' },
            { label: 'Políticas ativas', value: '8', color: 'var(--info)' },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-lg p-5 border"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <p
                className="text-sm font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                {card.label}
              </p>
              <p
                className="mt-1 text-3xl font-semibold"
                style={{ color: card.color }}
              >
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

export default App
