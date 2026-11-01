import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  label: string;
}

const RELOAD_FLAG = 'chunk-reload';
const isChunkError = (error: unknown): boolean =>
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i.test(String((error as Error)?.message ?? error));

// Error boundaries still require a class component in React 18.
export class ErrorBoundary extends Component<Props, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    // A stale lazy chunk after a deploy: reload once to pick up the new build. The flag prevents a reload loop.
    if (!isChunkError(error)) return;
    try {
      if (sessionStorage.getItem(RELOAD_FLAG)) return;
      sessionStorage.setItem(RELOAD_FLAG, '1');
      location.reload();
    } catch {
      // sessionStorage unavailable: do not risk a reload loop; show the error UI.
    }
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    return (
      <div role="alert" className="p-6 text-sm" style={{ color: 'var(--muted)' }}>
        <p className="m-0 mb-3">{this.props.label} hit an error. Reload to try again.</p>
        <button type="button" onClick={() => location.reload()} className="rounded-md px-3 py-1 text-[13px]" style={{ border: '1px solid var(--hairline)', color: 'var(--ink)' }}>Reload</button>
      </div>
    );
  }
}
