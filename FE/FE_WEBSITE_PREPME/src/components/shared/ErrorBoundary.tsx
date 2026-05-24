import { Component, type ReactNode } from 'react';
import { Button } from '@components/ui/Button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-8 dark:bg-slate-950">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
            Something went wrong
          </h1>
          <p className="mb-6 max-w-sm text-center text-slate-500 dark:text-slate-400">
            An unexpected error occurred. Our team has been notified.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mb-6 max-w-lg overflow-auto rounded-lg bg-red-50 p-4 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-400">
              {this.state.error.message}
            </pre>
          )}
          <Button onClick={this.handleReset}>Go back to Home</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
