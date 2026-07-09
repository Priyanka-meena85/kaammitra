import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.error("Component Stack:", errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md border border-gray-200">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong.</h1>
            <p className="text-gray-600 mb-8">We're sorry, an unexpected error occurred.</p>
            <div className="flex justify-center gap-4">
                <button onClick={() => window.location.href = '/'} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-sm">Go Home</button>
                <button onClick={() => window.location.reload()} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-bold shadow-sm">Reload Page</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children; 
  }
}

export default ErrorBoundary;
