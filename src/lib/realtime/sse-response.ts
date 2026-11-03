export function createSseResponse(
  request: Request,
  subscribe: (send: (event: unknown) => void) => () => void
): Response {
  let cleanup = () => {};
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      let disposed = false;
      let unsubscribe = () => {};
      const heartbeat = setInterval(() => {
        if (!disposed) controller.enqueue(encoder.encode(': heartbeat\n\n'));
      }, 15_000);

      const dispose = () => {
        if (disposed) return;
        disposed = true;
        clearInterval(heartbeat);
        unsubscribe();
        request.signal.removeEventListener('abort', dispose);
      };
      cleanup = dispose;
      unsubscribe = subscribe((event) => {
        if (!disposed) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        }
      });
      request.signal.addEventListener('abort', dispose, { once: true });
      if (request.signal.aborted) dispose();
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
