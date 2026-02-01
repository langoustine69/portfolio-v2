import { ImageResponse } from 'next/og';
import { agents } from '@/data/agents';

export const runtime = 'edge';

export const alt = 'Agent OG Image';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = agents.find((a) => a.id === id);

  if (!agent) {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            backgroundColor: '#0a0a0a',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#888',
            fontSize: 48,
          }}
        >
          Agent Not Found
        </div>
      ),
      size
    );
  }

  const statusColors = {
    live: '#22c55e',
    offline: '#eab308',
    building: '#3b82f6',
  };

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#0a0a0a',
          padding: 60,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Top bar with branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span style={{ fontSize: 40 }}>🦞</span>
            <span
              style={{
                fontSize: 24,
                color: '#ff6b9d',
                fontWeight: 600,
              }}
            >
              langoustine69.dev
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 20,
              backgroundColor: `${statusColors[agent.status]}20`,
              border: `2px solid ${statusColors[agent.status]}50`,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: statusColors[agent.status],
              }}
            />
            <span
              style={{
                fontSize: 18,
                color: statusColors[agent.status],
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              {agent.status}
            </span>
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          {/* Icon and name */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              marginBottom: 24,
            }}
          >
            <span style={{ fontSize: 80 }}>{agent.icon}</span>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span
                style={{
                  fontSize: 56,
                  fontWeight: 700,
                  color: '#ffffff',
                  lineHeight: 1.1,
                }}
              >
                {agent.name}
              </span>
              <span
                style={{
                  fontSize: 24,
                  color: '#666',
                  marginTop: 8,
                }}
              >
                {agent.category} • {agent.apiSource}
              </span>
            </div>
          </div>

          {/* Description */}
          <p
            style={{
              fontSize: 28,
              color: '#888',
              lineHeight: 1.4,
              maxWidth: 900,
              marginBottom: 32,
            }}
          >
            {agent.description.length > 150
              ? agent.description.substring(0, 150) + '...'
              : agent.description}
          </p>

          {/* Features */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            {agent.features.slice(0, 5).map((feature) => (
              <span
                key={feature}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: 8,
                  fontSize: 18,
                  color: '#ccc',
                }}
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #222',
            paddingTop: 24,
          }}
        >
          <span style={{ fontSize: 20, color: '#666' }}>x402 Micropayment Agent</span>
          <span style={{ fontSize: 20, color: '#ff6b9d' }}>Pay per request</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
