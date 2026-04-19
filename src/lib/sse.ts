/**
 * Server-Sent Events (SSE) Real-time Service
 *
 * Replaces Socket.io for Cloudflare Edge compatibility.
 * SSE works on Edge Runtime since it's HTTP-based (no persistent WebSocket needed).
 *
 * Features:
 * - Real-time deployment log streaming
 * - Heartbeat keep-alive
 * - Auto-reconnect on client side
 * - Compatible with Cloudflare Workers/Pages
 */

export interface SSEMessage {
  event: string;
  data: unknown;
  id?: string;
}

/**
 * Create an SSE response stream for deployment logs
 * Compatible with Edge Runtime (uses ReadableStream, no Node.js deps)
 */
export function createSSEStream(
  onMessage: (send: (msg: SSEMessage) => void) => void | Promise<void>,
  heartbeatInterval = 15000
): Response {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection event
      controller.enqueue(encoder.encode(': connected\n\n'));

      // Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeat);
        }
      }, heartbeatInterval);

      // Message sender
      const send = (msg: SSEMessage) => {
        try {
          let formatted = '';
          if (msg.event) formatted += `event: ${msg.event}\n`;
          if (msg.id) formatted += `id: ${msg.id}\n`;
          formatted += `data: ${JSON.stringify(msg.data)}\n\n`;
          controller.enqueue(encoder.encode(formatted));
        } catch {
          clearInterval(heartbeat);
        }
      };

      try {
        await onMessage(send);
      } catch (error) {
        send({
          event: 'error',
          data: { message: error instanceof Error ? error.message : 'Stream error' },
        });
      } finally {
        clearInterval(heartbeat);
        try {
          controller.close();
        } catch {
          // Already closed
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

/**
 * Client-side SSE hook for real-time updates
 * Drop-in replacement for socket.io-client in components
 */
export function connectSSE(
  url: string,
  handlers: {
    onLog?: (data: { message: string; type: string }) => void;
    onStatus?: (data: { status: string; progress: number }) => void;
    onComplete?: (data: { success: boolean; url?: string }) => void;
    onError?: (data: { message: string }) => void;
    onConnect?: () => void;
  },
  options: { withCredentials?: boolean } = {}
): EventSource {
  const es = new EventSource(url, { withCredentials: options.withCredentials });

  es.onopen = () => {
    handlers.onConnect?.();
  };

  es.addEventListener('log', (event) => {
    try {
      const data = JSON.parse(event.data);
      handlers.onLog?.(data);
    } catch { /* ignore parse errors */ }
  });

  es.addEventListener('status', (event) => {
    try {
      const data = JSON.parse(event.data);
      handlers.onStatus?.(data);
    } catch { /* ignore parse errors */ }
  });

  es.addEventListener('complete', (event) => {
    try {
      const data = JSON.parse(event.data);
      handlers.onComplete?.(data);
    } catch { /* ignore parse errors */ }
  });

  es.addEventListener('error', () => {
    // SSE auto-reconnects, but we can notify the handler
    handlers.onError?.({ message: 'Connection lost, reconnecting...' });
  });

  return es;
}
