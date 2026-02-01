import { ImageResponse } from 'next/og';
import { agents } from '@/data/agents';

export const runtime = 'edge';

export const alt = 'Langoustine69 Agent';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = agents.find((a) => a.id === id);

  if (!agent) {
    // Fallback OG image for unknown agents
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0a',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div style={{ fontSize: 80, marginBottom: 20 }}>🦞</div>
          <div style={{ fontSize: 48, color: '#ff6b9d', fontWeight: 'bold' }}>
            Agent Not Found
          </div>
          <div style={{ fontSize: 24, color: '#888', marginTop: 20 }}>
            langoustine69.dev
          </div>
        </div>
      ),
      { ...size }
    );
  }

  const statusColors: Record<string, { bg: string; text: string }> = {
    live: { bg: '#22c55e20', text: '#4ade80' },
    offline: { bg: '#eab30820', text: '#facc15' },
    building: { bg: '#3b82f620', text: '#60a5fa' },
  };

  const statusStyle = statusColors[agent.status] || statusColors.building;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0a0a0a',
          fontFamily: 'system-ui, sans-serif',
          padding: 60,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 40,
          }}
        >
          <span style={{ fontSize: 32, marginRight: 12 }}>🦞</span>
          <span style={{ fontSize: 24, color: '#ff6b9d', fontWeight: 500 }}>
            langoustine69
          </span>
          <span style={{ fontSize: 24, color: '#444', marginLeft: 12, marginRight: 12 }}>
            /
          </span>
          <span style={{ fontSize: 24, color: '#888' }}>x402 AI Agents</span>
        </div>

        {/* Main Content */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {/* Icon + Title Row */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
            <span style={{ fontSize: 72, marginRight: 24 }}>{agent.icon}</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 'bold',
                  color: '#ffffff',
                  lineHeight: 1.1,
                }}
              >
                {agent.name}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: 12,
                }}
              >
                <div
                  style={{
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.text,
                    padding: '6px 16px',
                    borderRadius: 20,
                    fontSize: 18,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    marginRight: 16,
                  }}
                >
                  {agent.status}
                </div>
                <span style={{ fontSize: 20, color: '#666' }}>{agent.category}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: 28,
              color: '#999',
              lineHeight: 1.4,
              maxWidth: 900,
              marginBottom: 32,
            }}
          >
            {agent.description.length > 150
              ? agent.description.substring(0, 147) + '...'
              : agent.description}
          </div>

          {/* Features */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {agent.features.slice(0, 5).map((feature) => (
              <div
                key={feature}
                style={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 18,
                  color: '#ccc',
                }}
              >
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #222',
            paddingTop: 24,
          }}
        >
          <div style={{ fontSize: 20, color: '#666' }}>
            Data Source: <span style={{ color: '#ff6b9d' }}>{agent.apiSource}</span>
          </div>
          <div style={{ fontSize: 20, color: '#666' }}>Pay per request • x402 micropayments</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
