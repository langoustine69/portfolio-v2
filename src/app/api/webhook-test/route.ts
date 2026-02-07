import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { url, headers, body, contentType } = await request.json();
    
    // Validate URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing or invalid URL' 
      }, { status: 400 });
    }
    
    // Basic URL validation
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid URL format' 
      }, { status: 400 });
    }
    
    // Block localhost/internal IPs for security
    const hostname = parsedUrl.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local')
    ) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot send webhooks to localhost or internal addresses' 
      }, { status: 400 });
    }
    
    // Prepare headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': contentType || 'application/json',
      'User-Agent': 'Langoustine69-WebhookTest/1.0',
      ...headers
    };
    
    // Send the webhook
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: requestHeaders,
        body: body,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const endTime = Date.now();
      
      // Read response body
      let responseBody = '';
      try {
        const text = await response.text();
        // Limit response size
        responseBody = text.slice(0, 10000);
      } catch {
        responseBody = '(Could not read response body)';
      }
      
      return NextResponse.json({
        success: response.ok,
        statusCode: response.status,
        statusText: response.statusText,
        responseTime: endTime - startTime,
        responseBody
      });
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json({
          success: false,
          error: 'Request timed out after 30 seconds',
          statusCode: 0
        });
      }
      
      return NextResponse.json({
        success: false,
        error: fetchError instanceof Error ? fetchError.message : 'Fetch failed',
        statusCode: 0
      });
    }
    
  } catch (err) {
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : 'Internal error' 
    }, { status: 500 });
  }
}
