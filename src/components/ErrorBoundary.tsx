import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Luckymate UI recovery boundary caught error:', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#0c121b] px-5 text-white">
          <div className="w-full max-w-md rounded-2xl border border-[#243245] bg-[#141c27] p-6 text-center shadow-2xl space-y-4">
            <div className="inline-flex items-center font-display text-xl font-black uppercase tracking-[0.06em]">
              <span className="text-[#f5c417]">LUCKY</span>
              <span className="text-white">MATE</span>
            </div>
            <h1 className="font-display text-lg font-bold text-white">
              Something went wrong
            </h1>
            <p className="text-xs leading-relaxed text-[#94a3b8]">
              An unexpected display issue occurred. Tap below to reload Luckymate cleanly.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="min-h-[44px] w-full rounded-xl bg-[#7bc114] px-5 py-2.5 text-sm font-extrabold text-[#0b1404] hover:bg-[#8cd61e] cursor-pointer"
            >
              Reload Luckymate
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
