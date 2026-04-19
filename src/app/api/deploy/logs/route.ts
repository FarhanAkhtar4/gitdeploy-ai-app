/**
 * SSE Endpoint for Real-time Deployment Logs
 *
 * Replaces Socket.io for Cloudflare Edge compatibility.
 * Endpoint: GET /api/deploy/logs?projectId=xxx
 *
 * Usage in client:
 *   const es = new EventSource('/api/deploy/logs?projectId=xxx');
 *   es.addEventListener('log', (e) => console.log(JSON.parse(e.data)));
 *   es.addEventListener('status', (e) => console.log(JSON.parse(e.data)));
 */

import { NextRequest } from 'next/server';
import { createSSEStream } from '@/lib/sse';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return new Response(JSON.stringify({ error: 'projectId is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return createSSEStream(async (send) => {
    // Simulated deployment log streaming
    // In production, this would connect to GitHub Actions API and stream logs
    const steps = [
      { message: 'Setting up repository...', type: 'info', progress: 10 },
      { message: 'Installing dependencies...', type: 'info', progress: 25 },
      { message: 'Running linter...', type: 'info', progress: 40 },
      { message: 'Building project...', type: 'info', progress: 60 },
      { message: 'Running tests...', type: 'info', progress: 75 },
      { message: 'Deploying to production...', type: 'info', progress: 90 },
      { message: 'Deployment complete!', type: 'success', progress: 100 },
    ];

    for (const step of steps) {
      send({
        event: 'log',
        data: { message: step.message, type: step.type, timestamp: new Date().toISOString() },
      });

      send({
        event: 'status',
        data: { status: step.type === 'success' ? 'completed' : 'deploying', progress: step.progress },
      });

      // Simulate step duration (in production, would poll GitHub API)
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    send({
      event: 'complete',
      data: { success: true, url: `https://${projectId}.vercel.app` },
    });
  });
}
