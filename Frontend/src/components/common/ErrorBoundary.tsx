import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-neutral-200 m-6">
          <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-base font-bold text-neutral-900">Something went wrong</h2>
          <p className="text-xs text-neutral-500 max-w-sm mt-1 mb-4">
            An unexpected error occurred while loading this view. You can refresh or return to the main dashboard.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs hover:bg-neutral-800"
          >
            <RefreshCw size={13} /> Refresh page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
