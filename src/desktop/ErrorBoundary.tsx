import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  label: string;
}

// Error boundaries still require a class component in React 18.
export class ErrorBoundary extends Component<Props, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    return (
      <div role="alert" className="p-6 text-sm" style={{ color: 'var(--muted)' }}>
        {this.props.label} hit an error. Close this window and open it again.
      </div>
    );
  }
}
