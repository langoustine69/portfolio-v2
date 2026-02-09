'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { agents } from '@/data/agents';

// Response schemas for each agent
const agentSchemas: Record<string, SchemaNode> = {
  'natural-events-intel': {
    type: 'object',
    description: 'Natural event data from NASA EONET',
    properties: {
      event: {
        type: 'object',
        required: true,
        description: 'Event details',
        properties: {
          id: { type: 'string', required: true, description: 'Unique event identifier', example: 'EONET_6789' },
          title: { type: 'string', required: true, description: 'Event title', example: 'Wildfire - California, USA' },
          category: { type: 'string', required: true, description: 'Event category', example: 'wildfires' },
          sources: {
            type: 'array',
            description: 'Data sources',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Source ID' },
                url: { type: 'string', description: 'Source URL' },
              },
            },
          },
          geometry: {
            type: 'array',
            required: true,
            description: 'Geographic coordinates',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string', description: 'ISO timestamp' },
                type: { type: 'string', description: 'Geometry type', example: 'Point' },
                coordinates: { type: 'array', description: '[longitude, latitude]', items: { type: 'number' } },
              },
            },
          },
        },
      },
      metadata: {
        type: 'object',
        description: 'Response metadata',
        properties: {
          timestamp: { type: 'string', required: true, description: 'ISO timestamp' },
          source: { type: 'string', description: 'Data source' },
        },
      },
    },
  },
  'crypto-price-agent': {
    type: 'object',
    description: 'Cryptocurrency price and market data',
    properties: {
      prices: {
        type: 'object',
        required: true,
        description: 'Price data by coin',
        properties: {
          bitcoin: {
            type: 'object',
            properties: {
              usd: { type: 'number', required: true, description: 'USD price', example: 98432.50 },
              usd_24h_change: { type: 'number', description: '24h % change', example: 2.34 },
              usd_market_cap: { type: 'number', description: 'Market cap in USD', example: 1940000000000 },
              last_updated_at: { type: 'number', description: 'Unix timestamp' },
            },
          },
          ethereum: {
            type: 'object',
            properties: {
              usd: { type: 'number', required: true, description: 'USD price', example: 3245.80 },
              usd_24h_change: { type: 'number', description: '24h % change' },
              usd_market_cap: { type: 'number', description: 'Market cap in USD' },
            },
          },
        },
      },
      defi: {
        type: 'object',
        description: 'DeFi TVL data',
        properties: {
          totalTvl: { type: 'number', description: 'Total value locked', example: 125000000000 },
          chains: {
            type: 'array',
            description: 'TVL by chain',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Ethereum' },
                tvl: { type: 'number', example: 65000000000 },
              },
            },
          },
        },
      },
      metadata: {
        type: 'object',
        properties: {
          timestamp: { type: 'string', required: true },
          sources: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
  'weather-intel-agent': {
    type: 'object',
    description: 'Weather conditions and forecasts',
    properties: {
      current: {
        type: 'object',
        required: true,
        description: 'Current conditions',
        properties: {
          temperature: { type: 'number', required: true, description: 'Temperature in °C', example: 22.5 },
          feels_like: { type: 'number', description: 'Feels like temperature', example: 24.1 },
          humidity: { type: 'number', description: 'Humidity %', example: 65 },
          wind_speed: { type: 'number', description: 'Wind speed in km/h', example: 12.3 },
          wind_direction: { type: 'number', description: 'Wind direction in degrees', example: 180 },
          conditions: { type: 'string', description: 'Weather description', example: 'Partly cloudy' },
          uv_index: { type: 'number', description: 'UV index', example: 6 },
        },
      },
      forecast: {
        type: 'array',
        description: 'Multi-day forecast',
        items: {
          type: 'object',
          properties: {
            date: { type: 'string', required: true, description: 'ISO date' },
            high: { type: 'number', required: true, description: 'High temperature' },
            low: { type: 'number', required: true, description: 'Low temperature' },
            conditions: { type: 'string', description: 'Weather description' },
            precipitation_chance: { type: 'number', description: 'Precipitation %' },
          },
        },
      },
      air_quality: {
        type: 'object',
        description: 'Air quality data',
        properties: {
          aqi: { type: 'number', description: 'Air Quality Index', example: 42 },
          pm2_5: { type: 'number', description: 'PM2.5 level' },
          pm10: { type: 'number', description: 'PM10 level' },
          category: { type: 'string', description: 'AQI category', example: 'Good' },
        },
      },
      alerts: {
        type: 'array',
        description: 'Active weather alerts',
        items: {
          type: 'object',
          properties: {
            event: { type: 'string', description: 'Alert type' },
            severity: { type: 'string', description: 'Severity level' },
            expires: { type: 'string', description: 'Expiration time' },
          },
        },
      },
      location: {
        type: 'object',
        required: true,
        properties: {
          lat: { type: 'number', required: true },
          lon: { type: 'number', required: true },
          name: { type: 'string' },
          timezone: { type: 'string' },
        },
      },
    },
  },
  'word-intel': {
    type: 'object',
    description: 'Word definitions and language data',
    properties: {
      word: { type: 'string', required: true, description: 'The queried word', example: 'serendipity' },
      phonetic: { type: 'string', description: 'Phonetic pronunciation', example: '/ˌsɛrənˈdɪpɪti/' },
      definitions: {
        type: 'array',
        required: true,
        description: 'Word definitions',
        items: {
          type: 'object',
          properties: {
            partOfSpeech: { type: 'string', required: true, example: 'noun' },
            definition: { type: 'string', required: true },
            example: { type: 'string', description: 'Usage example' },
          },
        },
      },
      synonyms: { type: 'array', description: 'Synonyms', items: { type: 'string' } },
      antonyms: { type: 'array', description: 'Antonyms', items: { type: 'string' } },
      relatedWords: { type: 'array', description: 'Related words', items: { type: 'string' } },
      rhymes: { type: 'array', description: 'Rhyming words', items: { type: 'string' } },
    },
  },
  'sports-intel': {
    type: 'object',
    description: 'Sports scores and schedules',
    properties: {
      matches: {
        type: 'array',
        required: true,
        description: 'Match data',
        items: {
          type: 'object',
          properties: {
            id: { type: 'number', required: true },
            competition: { type: 'string', required: true, example: 'Premier League' },
            homeTeam: { type: 'string', required: true },
            awayTeam: { type: 'string', required: true },
            score: {
              type: 'object',
              properties: {
                home: { type: 'number' },
                away: { type: 'number' },
              },
            },
            status: { type: 'string', description: 'Match status', example: 'FINISHED' },
            utcDate: { type: 'string', description: 'Match date/time' },
          },
        },
      },
      competition: {
        type: 'object',
        description: 'Competition info',
        properties: {
          name: { type: 'string' },
          country: { type: 'string' },
          season: { type: 'string' },
        },
      },
    },
  },
  'flight-intel': {
    type: 'object',
    description: 'Flight tracking data',
    properties: {
      flight: {
        type: 'object',
        required: true,
        properties: {
          icao24: { type: 'string', required: true, description: 'Aircraft ICAO24 address' },
          callsign: { type: 'string', description: 'Flight callsign', example: 'UAL123' },
          origin_country: { type: 'string', required: true },
          longitude: { type: 'number', required: true },
          latitude: { type: 'number', required: true },
          altitude: { type: 'number', description: 'Altitude in meters' },
          velocity: { type: 'number', description: 'Velocity in m/s' },
          heading: { type: 'number', description: 'Heading in degrees' },
          on_ground: { type: 'boolean' },
          last_contact: { type: 'number', description: 'Unix timestamp' },
        },
      },
      area: {
        type: 'object',
        description: 'Bounding box searched',
        properties: {
          lamin: { type: 'number' },
          lamax: { type: 'number' },
          lomin: { type: 'number' },
          lomax: { type: 'number' },
        },
      },
    },
  },
};

// Generic schema for agents without specific schema
const genericSchema: SchemaNode = {
  type: 'object',
  description: 'Standard agent response format',
  properties: {
    data: {
      type: 'object',
      required: true,
      description: 'Response payload - structure varies by endpoint',
      properties: {
        result: { type: 'any', description: 'Endpoint-specific data' },
      },
    },
    metadata: {
      type: 'object',
      description: 'Response metadata',
      properties: {
        timestamp: { type: 'string', required: true, description: 'ISO timestamp' },
        source: { type: 'string', description: 'Data source' },
        cached: { type: 'boolean', description: 'Whether response was cached' },
      },
    },
    error: {
      type: 'object',
      description: 'Present only on errors',
      properties: {
        code: { type: 'string', description: 'Error code' },
        message: { type: 'string', description: 'Error message' },
      },
    },
  },
};

interface SchemaNode {
  type: string;
  description?: string;
  required?: boolean;
  example?: string | number | boolean;
  properties?: Record<string, SchemaNode>;
  items?: SchemaNode;
}

function TypeBadge({ type, required }: { type: string; required?: boolean }) {
  const colors: Record<string, string> = {
    object: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    array: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    string: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    number: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    boolean: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    any: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  return (
    <span className="inline-flex items-center gap-1">
      <span className={`px-1.5 py-0.5 rounded text-xs font-mono ${colors[type] || colors.any}`}>
        {type}
      </span>
      {required && (
        <span className="px-1.5 py-0.5 rounded text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-medium">
          required
        </span>
      )}
    </span>
  );
}

function SchemaProperty({
  name,
  node,
  depth = 0,
  defaultExpanded = true,
}: {
  name: string;
  node: SchemaNode;
  depth?: number;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded && depth < 2);
  const hasChildren = node.properties || node.items;

  return (
    <div className={`${depth > 0 ? 'ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}`}>
      <div
        className={`flex items-start gap-2 py-2 ${hasChildren ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded px-2 -mx-2' : ''}`}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren && (
          <span className="text-gray-400 mt-0.5 w-4 flex-shrink-0">
            {expanded ? '▼' : '▶'}
          </span>
        )}
        {!hasChildren && <span className="w-4 flex-shrink-0" />}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <code className="text-sm font-semibold text-gray-900 dark:text-gray-100">{name}</code>
            <TypeBadge type={node.type} required={node.required} />
          </div>
          {node.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{node.description}</p>
          )}
          {node.example !== undefined && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
              Example: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{JSON.stringify(node.example)}</code>
            </p>
          )}
        </div>
      </div>

      {expanded && node.properties && (
        <div className="mt-1">
          {Object.entries(node.properties).map(([key, value]) => (
            <SchemaProperty key={key} name={key} node={value} depth={depth + 1} defaultExpanded={depth < 1} />
          ))}
        </div>
      )}

      {expanded && node.items && (
        <div className="mt-1 ml-4 border-l-2 border-dashed border-gray-300 dark:border-gray-600 pl-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Array items:</div>
          {node.items.properties ? (
            Object.entries(node.items.properties).map(([key, value]) => (
              <SchemaProperty key={key} name={key} node={value} depth={depth + 1} defaultExpanded={false} />
            ))
          ) : (
            <div className="py-1">
              <TypeBadge type={node.items.type} />
              {node.items.description && (
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">{node.items.description}</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SchemaViewer({ schema, agentId }: { schema: SchemaNode; agentId: string }) {
  const [viewMode, setViewMode] = useState<'tree' | 'json'>('tree');

  const schemaToJSON = useCallback((node: SchemaNode): object => {
    if (node.type === 'array' && node.items) {
      return [schemaToJSON(node.items)];
    }
    if (node.type === 'object' && node.properties) {
      const obj: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(node.properties)) {
        if (value.example !== undefined) {
          obj[key] = value.example;
        } else if (value.type === 'object' || value.type === 'array') {
          obj[key] = schemaToJSON(value);
        } else if (value.type === 'string') {
          obj[key] = '<string>';
        } else if (value.type === 'number') {
          obj[key] = 0;
        } else if (value.type === 'boolean') {
          obj[key] = false;
        } else {
          obj[key] = null;
        }
      }
      return obj;
    }
    return {};
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Response Schema</span>
          {schema.description && (
            <span className="text-xs text-gray-500 dark:text-gray-400">— {schema.description}</span>
          )}
        </div>
        <div className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('tree')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'tree'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Tree
          </button>
          <button
            onClick={() => setViewMode('json')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'json'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            JSON
          </button>
        </div>
      </div>

      <div className="p-4 max-h-[500px] overflow-y-auto">
        {viewMode === 'tree' ? (
          <div>
            {schema.properties &&
              Object.entries(schema.properties).map(([key, value]) => (
                <SchemaProperty key={key} name={key} node={value} defaultExpanded={true} />
              ))}
          </div>
        ) : (
          <pre className="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
            {JSON.stringify(schemaToJSON(schema), null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

export default function SchemasPage() {
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const liveAgents = agents.filter((a) => a.status === 'live');
  const filteredAgents = liveAgents.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentAgent = selectedAgent ? agents.find((a) => a.id === selectedAgent) : null;
  const currentSchema = selectedAgent ? agentSchemas[selectedAgent] || genericSchema : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4 inline-block">
            ← Back to Agents
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            📋 Response Schema Viewer
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
            Explore the response structure for each agent&apos;s API. Understand data types, required fields, and nested objects to build robust integrations.
          </p>
        </div>

        {/* Agent Selection */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sticky top-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Select Agent</h2>
              
              <input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="space-y-1 max-h-[400px] overflow-y-auto">
                {filteredAgents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedAgent === agent.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{agent.icon}</span>
                      <span className="font-medium">{agent.name}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 ml-6">
                      {agent.category}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            {currentAgent && currentSchema ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{currentAgent.icon}</span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{currentAgent.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{currentAgent.category}</p>
                  </div>
                </div>

                <SchemaViewer schema={currentSchema} agentId={currentAgent.id} />

                {/* Quick Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                  <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">💡 Integration Tips</h3>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Fields marked <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-1 rounded text-xs">required</span> are always present in responses</li>
                    <li>• Optional fields may be null or absent — handle gracefully</li>
                    <li>• Array fields may be empty — check length before iterating</li>
                    <li>• See <Link href={`/agents/${currentAgent.id}`} className="underline hover:no-underline">agent docs</Link> for full endpoint details</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select an Agent</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose an agent from the list to view its response schema and data structure.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Type Legend</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <TypeBadge type="object" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Nested object with properties</span>
            </div>
            <div className="flex items-center gap-2">
              <TypeBadge type="array" />
              <span className="text-sm text-gray-600 dark:text-gray-400">List of items</span>
            </div>
            <div className="flex items-center gap-2">
              <TypeBadge type="string" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Text value</span>
            </div>
            <div className="flex items-center gap-2">
              <TypeBadge type="number" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Numeric value</span>
            </div>
            <div className="flex items-center gap-2">
              <TypeBadge type="boolean" />
              <span className="text-sm text-gray-600 dark:text-gray-400">True/false</span>
            </div>
            <div className="flex items-center gap-2">
              <TypeBadge type="any" required />
              <span className="text-sm text-gray-600 dark:text-gray-400">Required field</span>
            </div>
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          <Link
            href="/playground"
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
          >
            <div className="text-2xl mb-2">🎮</div>
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
              API Playground
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Test endpoints live</p>
          </Link>
          <Link
            href="/sdk"
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
          >
            <div className="text-2xl mb-2">📦</div>
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
              SDK Generator
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Generate typed clients</p>
          </Link>
          <Link
            href="/errors"
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
          >
            <div className="text-2xl mb-2">⚠️</div>
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
              Error Reference
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Handle error responses</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
