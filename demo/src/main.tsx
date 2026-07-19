import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class RootErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('WeekendBuddy runtime error:', error);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleClearRouteCache = () => {
    localStorage.removeItem('weekendbuddy.savedRoutes');
    localStorage.removeItem('weekendbuddy.favoritePois');
    localStorage.removeItem('weekendbuddy.favoriteRoutes');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center px-6">
          <section className="max-w-md rounded-[1.75rem] border border-purple-100 bg-white/90 p-6 text-center shadow-[0_22px_70px_rgba(91,33,182,0.16)]">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-600">WeekendBuddy</p>
            <h1 className="mt-3 text-2xl font-extrabold text-purple-950">页面刚刚走神了</h1>
            <p className="mt-3 text-sm font-semibold leading-6 text-purple-500">
              页面运行时遇到异常。可以先刷新；如果仍然打不开，再清理本地路线缓存。
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={this.handleRefresh}
                className="rounded-full bg-gradient-to-r from-purple-600 via-purple-700 to-purple-900 px-5 py-3 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(124,58,237,0.32)]"
              >
                刷新页面
              </button>
              <button
                type="button"
                onClick={this.handleClearRouteCache}
                className="rounded-full border border-purple-200 bg-white px-5 py-3 text-sm font-extrabold text-purple-700"
              >
                清理路线缓存
              </button>
            </div>
          </section>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </React.StrictMode>,
);
