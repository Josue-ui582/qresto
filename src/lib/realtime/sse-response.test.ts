import { describe, expect, it, vi } from 'vitest';
import { createSseResponse } from './sse-response';

describe('createSseResponse', () => {
  it('streams events and releases subscriptions when the request disconnects', async () => {
    const abortController = new AbortController();
    const unsubscribe = vi.fn();
    let send: ((event: unknown) => void) | undefined;
    const response = createSseResponse(
      new Request('http://localhost/events', { signal: abortController.signal }),
      (sendEvent) => {
        send = sendEvent;
        return unsubscribe;
      }
    );
    const reader = response.body?.getReader();

    expect(response.headers.get('Content-Type')).toContain('text/event-stream');
    send?.({ type: 'order.updated', trackingCode: 'QR-ABCDEFG2' });
    const event = await reader?.read();
    expect(new TextDecoder().decode(event?.value)).toContain(
      'data: {"type":"order.updated","trackingCode":"QR-ABCDEFG2"}'
    );

    abortController.abort();

    expect(unsubscribe).toHaveBeenCalledOnce();
    await expect(reader?.read()).resolves.toEqual({ done: true, value: undefined });
    await reader?.cancel();
  });
});
