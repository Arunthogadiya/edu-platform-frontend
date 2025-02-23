import React, { Component, ErrorInfo } from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Dashboard error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  getErrorMessage(): { title: string; message: string } {
    const { error } = this.state;
    
    if (!error) return {
      title: "Something went wrong",
      message: "Please try refreshing the page"
    };

    // Handle specific error types
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return {
        title: "Network Error",
        message: "Unable to connect to the server. Please check your internet connection."
      };
    }

    if (error.message.includes('import') || error.message.includes('Cannot find module')) {
      return {
        title: "Application Error",
        message: "There was a problem loading some components. Please try clearing your browser cache and refreshing."
      };
    }

    if (error.message.includes('JSON')) {
      return {
        title: "Data Error",
        message: "There was a problem processing the data. We're using mock data for now."
      };
    }

    return {
      title: "Unexpected Error",
      message: error.message || "Please try refreshing the page"
    };
  }

  render() {
    if (this.state.hasError) {
      const { title, message } = this.getErrorMessage();
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-bold text-gray-900">
                {title}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {message}
              </p>
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear Cache and Refresh
                </button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-4 text-left p-4 bg-gray-100 rounded-lg">
                  <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                    Technical Details
                  </summary>
                  <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                    {this.state.error?.toString()}
                    {'\n'}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DashboardErrorBoundary;