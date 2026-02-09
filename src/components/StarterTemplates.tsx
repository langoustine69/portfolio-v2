'use client';

import { useState } from 'react';
import CodeBlock from './CodeBlock';

interface Template {
  id: string;
  name: string;
  icon: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  files: { name: string; content: string; language: string }[];
  setupCommands: string[];
  features: string[];
}

const templates: Template[] = [
  {
    id: 'nextjs',
    name: 'Next.js',
    icon: '▲',
    description: 'Full-stack React framework with API routes and x402 integration',
    difficulty: 'beginner',
    features: ['TypeScript', 'API Routes', 'React Hooks', 'Environment Config'],
    setupCommands: [
      'npx create-next-app@latest my-x402-app --typescript',
      'cd my-x402-app',
      'npm install',
      '# Copy the files below into your project',
      'npm run dev',
    ],
    files: [
      {
        name: 'lib/x402.ts',
        language: 'typescript',
        content: `// x402 Payment Client for Next.js
const X402_GATEWAY = 'https://x402.org';

interface PaymentResult {
  success: boolean;
  data?: any;
  error?: string;
}

export async function callAgent(
  agentUrl: string,
  params: Record<string, any> = {}
): Promise<PaymentResult> {
  try {
    // Initial request
    const response = await fetch(agentUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    // If 402, handle payment
    if (response.status === 402) {
      const paymentDetails = await response.json();
      
      // In production, connect to user's wallet
      // This example uses a server-side payment flow
      const paymentResponse = await fetch(\`\${X402_GATEWAY}/pay\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payTo: paymentDetails.payTo,
          amount: paymentDetails.amount,
          agentUrl,
        }),
      });

      if (!paymentResponse.ok) {
        return { success: false, error: 'Payment failed' };
      }

      const { receipt } = await paymentResponse.json();

      // Retry with payment receipt
      const paidResponse = await fetch(agentUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Payment-Receipt': receipt,
        },
        body: JSON.stringify(params),
      });

      const data = await paidResponse.json();
      return { success: true, data };
    }

    // Non-402 response
    const data = await response.json();
    return { success: response.ok, data, error: response.ok ? undefined : data.error };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}`,
      },
      {
        name: 'pages/api/agent.ts',
        language: 'typescript',
        content: `// API Route: /api/agent
import type { NextApiRequest, NextApiResponse } from 'next';
import { callAgent } from '../../lib/x402';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { agentUrl, params } = req.body;

  if (!agentUrl) {
    return res.status(400).json({ error: 'agentUrl is required' });
  }

  const result = await callAgent(agentUrl, params || {});

  if (result.success) {
    return res.status(200).json(result.data);
  } else {
    return res.status(500).json({ error: result.error });
  }
}`,
      },
      {
        name: 'hooks/useAgent.ts',
        language: 'typescript',
        content: `// React Hook for calling x402 agents
import { useState, useCallback } from 'react';

interface UseAgentResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  call: (agentUrl: string, params?: Record<string, any>) => Promise<void>;
}

export function useAgent<T = any>(): UseAgentResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const call = useCallback(async (agentUrl: string, params?: Record<string, any>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentUrl, params }),
      });

      const result = await response.json();

      if (response.ok) {
        setData(result);
      } else {
        setError(result.error || 'Request failed');
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, call };
}`,
      },
      {
        name: '.env.local',
        language: 'bash',
        content: `# x402 Configuration
X402_GATEWAY=https://x402.org
WALLET_PRIVATE_KEY=your_private_key_here

# Agent endpoints (examples)
WEATHER_AGENT=https://agents.langoustine69.dev/weather
CRYPTO_AGENT=https://agents.langoustine69.dev/crypto-prices`,
      },
    ],
  },
  {
    id: 'express',
    name: 'Express.js',
    icon: '🟢',
    description: 'Minimal Node.js server with x402 middleware',
    difficulty: 'beginner',
    features: ['TypeScript', 'Middleware Pattern', 'Error Handling', 'Logging'],
    setupCommands: [
      'mkdir my-x402-server && cd my-x402-server',
      'npm init -y',
      'npm install express dotenv',
      'npm install -D typescript @types/node @types/express ts-node',
      'npx tsc --init',
      '# Copy files below, then:',
      'npx ts-node src/index.ts',
    ],
    files: [
      {
        name: 'src/index.ts',
        language: 'typescript',
        content: `import express from 'express';
import { x402Client } from './x402';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Example endpoint calling an x402 agent
app.post('/api/weather', async (req, res) => {
  const { city } = req.body;

  if (!city) {
    return res.status(400).json({ error: 'city is required' });
  }

  try {
    const result = await x402Client.call(
      process.env.WEATHER_AGENT!,
      { city }
    );

    res.json(result);
  } catch (error) {
    console.error('Agent call failed:', error);
    res.status(500).json({ error: 'Failed to fetch weather' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`🦞 Server running on port \${PORT}\`);
});`,
      },
      {
        name: 'src/x402.ts',
        language: 'typescript',
        content: `// x402 Payment Client
const X402_GATEWAY = process.env.X402_GATEWAY || 'https://x402.org';

class X402Client {
  private wallet: string;

  constructor() {
    this.wallet = process.env.WALLET_PRIVATE_KEY || '';
  }

  async call(agentUrl: string, params: Record<string, any> = {}): Promise<any> {
    // Initial request
    let response = await fetch(agentUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    // Handle 402 Payment Required
    if (response.status === 402) {
      const paymentDetails = await response.json();
      console.log('Payment required:', paymentDetails.amount, 'USDC');

      // Execute payment
      const paymentResponse = await fetch(\`\${X402_GATEWAY}/pay\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payTo: paymentDetails.payTo,
          amount: paymentDetails.amount,
          wallet: this.wallet,
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error('Payment failed');
      }

      const { receipt } = await paymentResponse.json();

      // Retry with receipt
      response = await fetch(agentUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Payment-Receipt': receipt,
        },
        body: JSON.stringify(params),
      });
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(\`Agent error: \${error}\`);
    }

    return response.json();
  }
}

export const x402Client = new X402Client();`,
      },
      {
        name: 'package.json',
        language: 'json',
        content: `{
  "name": "x402-express-starter",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "dotenv": "^16.0.0",
    "express": "^4.18.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "ts-node": "^10.9.0"
  }
}`,
      },
    ],
  },
  {
    id: 'fastapi',
    name: 'FastAPI',
    icon: '⚡',
    description: 'Modern Python API with async x402 support',
    difficulty: 'beginner',
    features: ['Async/Await', 'Pydantic Models', 'Auto Docs', 'Type Hints'],
    setupCommands: [
      'mkdir my-x402-api && cd my-x402-api',
      'python -m venv venv',
      'source venv/bin/activate  # or venv\\Scripts\\activate on Windows',
      'pip install fastapi uvicorn httpx python-dotenv',
      '# Copy files below, then:',
      'uvicorn main:app --reload',
    ],
    files: [
      {
        name: 'main.py',
        language: 'python',
        content: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from x402_client import X402Client
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="x402 Agent API",
    description="Example FastAPI server calling x402 agents",
    version="1.0.0"
)

x402 = X402Client()


class WeatherRequest(BaseModel):
    city: str


class WeatherResponse(BaseModel):
    city: str
    temperature: float
    conditions: str


@app.post("/weather", response_model=WeatherResponse)
async def get_weather(request: WeatherRequest):
    """Fetch weather from x402 weather agent"""
    try:
        result = await x402.call(
            os.getenv("WEATHER_AGENT"),
            {"city": request.city}
        )
        return WeatherResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    return {"status": "ok"}`,
      },
      {
        name: 'x402_client.py',
        language: 'python',
        content: `import httpx
import os
from typing import Any, Dict, Optional


class X402Client:
    """Async x402 payment client for Python"""

    def __init__(self):
        self.gateway = os.getenv("X402_GATEWAY", "https://x402.org")
        self.wallet = os.getenv("WALLET_PRIVATE_KEY", "")

    async def call(
        self,
        agent_url: str,
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Call an x402 agent, handling payment if required"""

        async with httpx.AsyncClient() as client:
            # Initial request
            response = await client.post(
                agent_url,
                json=params or {},
                timeout=30.0
            )

            # Handle 402 Payment Required
            if response.status_code == 402:
                payment_details = response.json()
                print(f"Payment required: {payment_details['amount']} USDC")

                # Execute payment
                payment_response = await client.post(
                    f"{self.gateway}/pay",
                    json={
                        "payTo": payment_details["payTo"],
                        "amount": payment_details["amount"],
                        "wallet": self.wallet,
                    }
                )
                payment_response.raise_for_status()
                receipt = payment_response.json()["receipt"]

                # Retry with receipt
                response = await client.post(
                    agent_url,
                    json=params or {},
                    headers={"X-Payment-Receipt": receipt},
                    timeout=30.0
                )

            response.raise_for_status()
            return response.json()`,
      },
      {
        name: 'requirements.txt',
        language: 'text',
        content: `fastapi>=0.100.0
uvicorn[standard]>=0.23.0
httpx>=0.24.0
python-dotenv>=1.0.0
pydantic>=2.0.0`,
      },
      {
        name: '.env',
        language: 'bash',
        content: `X402_GATEWAY=https://x402.org
WALLET_PRIVATE_KEY=your_private_key_here
WEATHER_AGENT=https://agents.langoustine69.dev/weather`,
      },
    ],
  },
  {
    id: 'go',
    name: 'Go',
    icon: '🐹',
    description: 'High-performance Go server with x402 client',
    difficulty: 'intermediate',
    features: ['net/http', 'Goroutines', 'JSON Encoding', 'Error Handling'],
    setupCommands: [
      'mkdir my-x402-server && cd my-x402-server',
      'go mod init my-x402-server',
      '# Copy files below, then:',
      'go run .',
    ],
    files: [
      {
        name: 'main.go',
        language: 'go',
        content: `package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
)

func main() {
	client := NewX402Client()

	http.HandleFunc("/weather", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req struct {
			City string \`json:"city"\`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		result, err := client.Call(
			os.Getenv("WEATHER_AGENT"),
			map[string]interface{}{"city": req.City},
		)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(result)
	})

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🦞 Server running on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}`,
      },
      {
        name: 'x402.go',
        language: 'go',
        content: `package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

type X402Client struct {
	gateway string
	wallet  string
	client  *http.Client
}

func NewX402Client() *X402Client {
	gateway := os.Getenv("X402_GATEWAY")
	if gateway == "" {
		gateway = "https://x402.org"
	}
	return &X402Client{
		gateway: gateway,
		wallet:  os.Getenv("WALLET_PRIVATE_KEY"),
		client:  &http.Client{},
	}
}

func (c *X402Client) Call(agentURL string, params map[string]interface{}) (map[string]interface{}, error) {
	body, _ := json.Marshal(params)

	// Initial request
	resp, err := c.client.Post(agentURL, "application/json", bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Handle 402 Payment Required
	if resp.StatusCode == http.StatusPaymentRequired {
		var paymentDetails struct {
			PayTo  string \`json:"payTo"\`
			Amount string \`json:"amount"\`
		}
		json.NewDecoder(resp.Body).Decode(&paymentDetails)

		// Execute payment
		payBody, _ := json.Marshal(map[string]string{
			"payTo":  paymentDetails.PayTo,
			"amount": paymentDetails.Amount,
			"wallet": c.wallet,
		})
		payResp, err := c.client.Post(c.gateway+"/pay", "application/json", bytes.NewBuffer(payBody))
		if err != nil {
			return nil, err
		}
		defer payResp.Body.Close()

		var payResult struct {
			Receipt string \`json:"receipt"\`
		}
		json.NewDecoder(payResp.Body).Decode(&payResult)

		// Retry with receipt
		req, _ := http.NewRequest("POST", agentURL, bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Payment-Receipt", payResult.Receipt)
		resp, err = c.client.Do(req)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("agent error: %d", resp.StatusCode)
	}

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	return result, nil
}`,
      },
      {
        name: 'go.mod',
        language: 'go',
        content: `module my-x402-server

go 1.21`,
      },
    ],
  },
  {
    id: 'rust',
    name: 'Rust (Axum)',
    icon: '🦀',
    description: 'Blazing fast Rust server with Axum framework',
    difficulty: 'advanced',
    features: ['Axum', 'Tokio Async', 'Serde', 'Tower Middleware'],
    setupCommands: [
      'cargo new my-x402-server && cd my-x402-server',
      '# Update Cargo.toml with dependencies below',
      '# Copy src files',
      'cargo run',
    ],
    files: [
      {
        name: 'src/main.rs',
        language: 'rust',
        content: `use axum::{
    extract::State,
    http::StatusCode,
    response::Json,
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

mod x402;
use x402::X402Client;

#[derive(Clone)]
struct AppState {
    x402: Arc<X402Client>,
}

#[derive(Deserialize)]
struct WeatherRequest {
    city: String,
}

#[derive(Serialize)]
struct WeatherResponse {
    city: String,
    temperature: f64,
    conditions: String,
}

async fn get_weather(
    State(state): State<AppState>,
    Json(req): Json<WeatherRequest>,
) -> Result<Json<WeatherResponse>, (StatusCode, String)> {
    let agent_url = std::env::var("WEATHER_AGENT")
        .unwrap_or_else(|_| "https://agents.langoustine69.dev/weather".to_string());

    let params = serde_json::json!({ "city": req.city });

    match state.x402.call(&agent_url, params).await {
        Ok(result) => {
            let response: WeatherResponse = serde_json::from_value(result)
                .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
            Ok(Json(response))
        }
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

async fn health_check() -> Json<serde_json::Value> {
    Json(serde_json::json!({ "status": "ok" }))
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let state = AppState {
        x402: Arc::new(X402Client::new()),
    };

    let app = Router::new()
        .route("/weather", post(get_weather))
        .route("/health", get(health_check))
        .with_state(state);

    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".to_string());
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", port))
        .await
        .unwrap();

    println!("🦞 Server running on port {}", port);
    axum::serve(listener, app).await.unwrap();
}`,
      },
      {
        name: 'src/x402.rs',
        language: 'rust',
        content: `use reqwest::Client;
use serde_json::Value;
use std::error::Error;

pub struct X402Client {
    gateway: String,
    wallet: String,
    client: Client,
}

impl X402Client {
    pub fn new() -> Self {
        Self {
            gateway: std::env::var("X402_GATEWAY")
                .unwrap_or_else(|_| "https://x402.org".to_string()),
            wallet: std::env::var("WALLET_PRIVATE_KEY").unwrap_or_default(),
            client: Client::new(),
        }
    }

    pub async fn call(&self, agent_url: &str, params: Value) -> Result<Value, Box<dyn Error>> {
        // Initial request
        let response = self
            .client
            .post(agent_url)
            .json(&params)
            .send()
            .await?;

        // Handle 402 Payment Required
        if response.status().as_u16() == 402 {
            let payment_details: Value = response.json().await?;

            // Execute payment
            let pay_response = self
                .client
                .post(format!("{}/pay", self.gateway))
                .json(&serde_json::json!({
                    "payTo": payment_details["payTo"],
                    "amount": payment_details["amount"],
                    "wallet": self.wallet,
                }))
                .send()
                .await?;

            let pay_result: Value = pay_response.json().await?;
            let receipt = pay_result["receipt"].as_str().unwrap_or("");

            // Retry with receipt
            let response = self
                .client
                .post(agent_url)
                .header("X-Payment-Receipt", receipt)
                .json(&params)
                .send()
                .await?;

            return Ok(response.json().await?);
        }

        if !response.status().is_success() {
            return Err(format!("Agent error: {}", response.status()).into());
        }

        Ok(response.json().await?)
    }
}`,
      },
      {
        name: 'Cargo.toml',
        language: 'toml',
        content: `[package]
name = "x402-server"
version = "0.1.0"
edition = "2021"

[dependencies]
axum = "0.7"
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
reqwest = { version = "0.11", features = ["json"] }
dotenvy = "0.15"
tower = "0.4"`,
      },
    ],
  },
  {
    id: 'flask',
    name: 'Flask',
    icon: '🐍',
    description: 'Lightweight Python microframework with x402',
    difficulty: 'beginner',
    features: ['Blueprints', 'Request Handling', 'JSON APIs', 'Simple Setup'],
    setupCommands: [
      'mkdir my-x402-flask && cd my-x402-flask',
      'python -m venv venv',
      'source venv/bin/activate',
      'pip install flask requests python-dotenv',
      '# Copy files below, then:',
      'flask run',
    ],
    files: [
      {
        name: 'app.py',
        language: 'python',
        content: `from flask import Flask, request, jsonify
from x402_client import X402Client
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
x402 = X402Client()


@app.route('/weather', methods=['POST'])
def get_weather():
    """Fetch weather from x402 agent"""
    data = request.get_json()
    city = data.get('city')

    if not city:
        return jsonify({'error': 'city is required'}), 400

    try:
        result = x402.call(
            os.getenv('WEATHER_AGENT'),
            {'city': city}
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health')
def health_check():
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    app.run(debug=True, port=5000)`,
      },
      {
        name: 'x402_client.py',
        language: 'python',
        content: `import requests
import os
from typing import Any, Dict, Optional


class X402Client:
    """Synchronous x402 payment client for Flask"""

    def __init__(self):
        self.gateway = os.getenv('X402_GATEWAY', 'https://x402.org')
        self.wallet = os.getenv('WALLET_PRIVATE_KEY', '')

    def call(
        self,
        agent_url: str,
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Call an x402 agent, handling payment if required"""

        # Initial request
        response = requests.post(
            agent_url,
            json=params or {},
            timeout=30
        )

        # Handle 402 Payment Required
        if response.status_code == 402:
            payment_details = response.json()
            print(f"Payment required: {payment_details['amount']} USDC")

            # Execute payment
            payment_response = requests.post(
                f"{self.gateway}/pay",
                json={
                    'payTo': payment_details['payTo'],
                    'amount': payment_details['amount'],
                    'wallet': self.wallet,
                }
            )
            payment_response.raise_for_status()
            receipt = payment_response.json()['receipt']

            # Retry with receipt
            response = requests.post(
                agent_url,
                json=params or {},
                headers={'X-Payment-Receipt': receipt},
                timeout=30
            )

        response.raise_for_status()
        return response.json()`,
      },
      {
        name: 'requirements.txt',
        language: 'text',
        content: `flask>=3.0.0
requests>=2.31.0
python-dotenv>=1.0.0`,
      },
    ],
  },
];

const difficultyColors = {
  beginner: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
  intermediate: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
  advanced: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
};

export function StarterTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const copyToClipboard = async (content: string, fileName: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedFile(fileName);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const copyAllFiles = async (template: Template) => {
    const allContent = template.files
      .map((f) => `// ========== ${f.name} ==========\n\n${f.content}`)
      .join('\n\n\n');
    await navigator.clipboard.writeText(allContent);
    setCopiedFile('all');
    setTimeout(() => setCopiedFile(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => {
              setSelectedTemplate(template);
              setActiveFileIndex(0);
            }}
            className={`p-6 rounded-xl border text-left transition-all hover:shadow-lg ${
              selectedTemplate?.id === template.id
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{template.icon}</span>
              <div>
                <h3 className="font-semibold text-lg">{template.name}</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    difficultyColors[template.difficulty]
                  }`}
                >
                  {template.difficulty}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {template.description}
            </p>
            <div className="flex flex-wrap gap-1">
              {template.features.map((feature) => (
                <span
                  key={feature}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded"
                >
                  {feature}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Selected Template Details */}
      {selectedTemplate && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedTemplate.icon}</span>
              <div>
                <h2 className="font-bold text-xl">{selectedTemplate.name} Starter</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedTemplate.files.length} files • Ready to copy
                </p>
              </div>
            </div>
            <button
              onClick={() => copyAllFiles(selectedTemplate)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {copiedFile === 'all' ? '✓ Copied All!' : 'Copy All Files'}
            </button>
          </div>

          {/* Setup Commands */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span>⚡</span> Quick Setup
            </h3>
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto">
              {selectedTemplate.setupCommands.map((cmd, i) => (
                <div key={i} className={cmd.startsWith('#') ? 'text-gray-500' : ''}>
                  {cmd.startsWith('#') ? cmd : `$ ${cmd}`}
                </div>
              ))}
            </div>
          </div>

          {/* File Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {selectedTemplate.files.map((file, index) => (
              <button
                key={file.name}
                onClick={() => setActiveFileIndex(index)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeFileIndex === index
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                📄 {file.name}
              </button>
            ))}
          </div>

          {/* File Content */}
          <div className="relative">
            <button
              onClick={() =>
                copyToClipboard(
                  selectedTemplate.files[activeFileIndex].content,
                  selectedTemplate.files[activeFileIndex].name
                )
              }
              className="absolute top-3 right-3 z-10 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-md transition-colors"
            >
              {copiedFile === selectedTemplate.files[activeFileIndex].name
                ? '✓ Copied!'
                : 'Copy'}
            </button>
            <CodeBlock
              code={selectedTemplate.files[activeFileIndex].content}
              language={selectedTemplate.files[activeFileIndex].language}
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedTemplate && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <span className="text-4xl mb-4 block">👆</span>
          <p>Select a template above to get started</p>
        </div>
      )}
    </div>
  );
}
