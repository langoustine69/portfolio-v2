'use client'

const agents = [
  {
    name: "seismic-intel-agent",
    domain: "Geoscience",
    description: "Real-time earthquake data: global alerts, location search, regional hazard reports",
    dataSource: "USGS",
    endpoints: { free: 1, paid: 5 },
    status: "live",
    apiUrl: "https://seismic-intel-agent-production.up.railway.app",
    githubUrl: "https://github.com/langoustine69/seismic-intel-agent",
  },
  {
    name: "space-launch-tracker",
    domain: "Space",
    description: "Real-time space launch data: rockets, astronauts, agencies, and events",
    dataSource: "SpaceDevs API",
    endpoints: { free: 1, paid: 5 },
    status: "building",
    apiUrl: "",
    githubUrl: "https://github.com/langoustine69/space-launch-tracker",
  },
]

function StatusBadge({ status }: { status: string }) {
  const colors = {
    live: 'bg-green-500/20 text-green-400 border-green-500/50',
    building: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    offline: 'bg-red-500/20 text-red-400 border-red-500/50',
  }
  return (
    <span className={`px-2 py-1 text-xs rounded-full border ${colors[status as keyof typeof colors]}`}>
      {status}
    </span>
  )
}

function AgentCard({ agent }: { agent: typeof agents[0] }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
          <span className="text-xs text-gray-500">{agent.domain}</span>
        </div>
        <StatusBadge status={agent.status} />
      </div>
      <p className="text-gray-400 text-sm mb-4">{agent.description}</p>
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
        <span>📡 {agent.dataSource}</span>
        <span>🆓 {agent.endpoints.free} free</span>
        <span>💰 {agent.endpoints.paid} paid</span>
      </div>
      <div className="flex gap-2">
        {agent.apiUrl && (
          <a href={agent.apiUrl} target="_blank" rel="noopener noreferrer"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium">
            Try API
          </a>
        )}
        <a href={agent.githubUrl} target="_blank" rel="noopener noreferrer"
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs font-medium">
          GitHub
        </a>
      </div>
    </div>
  )
}

export default function Home() {
  const liveCount = agents.filter(a => a.status === 'live').length
  const buildingCount = agents.filter(a => a.status === 'building').length

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">🦞 Langoustine69</h1>
        <p className="text-gray-400 text-lg mb-4">AI Agent Portfolio</p>
        <p className="text-sm text-gray-500">
          {liveCount} live · {buildingCount} building · Powered by{' '}
          <a href="https://github.com/daydreamsai/lucid-agents" className="text-blue-400 hover:underline">
            Lucid Agents SDK
          </a>{' '}
          +{' '}
          <a href="https://x402.org" className="text-blue-400 hover:underline">
            x402
          </a>
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-6 text-gray-300">Deployed Agents</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {agents.map((agent) => (
            <AgentCard key={agent.name} agent={agent} />
          ))}
        </div>
      </section>

      <footer className="mt-16 text-center text-gray-600 text-sm">
        <p>Built by Goust 🦞 · {new Date().getFullYear()}</p>
      </footer>
    </main>
  )
}
