import type { LeadPayload, SubmitResult } from './types';
export async function submitLead(_payload: LeadPayload, options: { mockError?: boolean; signal?: AbortSignal } = {}): Promise<SubmitResult> {
  await new Promise<void>((resolve, reject) => {
    if (options.signal?.aborted) { reject(new DOMException('Aborted', 'AbortError')); return; }
    const onAbort = () => { clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); };
    const timer = setTimeout(() => { options.signal?.removeEventListener('abort', onAbort); resolve(); }, 650);
    options.signal?.addEventListener('abort', onAbort, { once: true });
  });
  if (options.mockError) throw new Error('demo_error');
  return { status: 'demo_success' };
}
