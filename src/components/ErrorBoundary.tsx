import React, { Component } from 'react';

interface IErrorProps {
  ErrorComponent: React.ComponentType<any>;
}
interface IErrorState {
  hasError: boolean;
  error: null | Error;
  errorInfo: any;
}

class ErrorBoundary extends Component<React.PropsWithChildren<IErrorProps>, IErrorState> {
  constructor(props: Readonly<React.PropsWithChildren<IErrorProps>>) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, info: any) {
    // Display fallback UI
    this.setState({
      error,
      hasError: true,
      errorInfo: info,
    });
  }

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { ErrorComponent, children } = this.props;
    if (hasError) {
      if (!ErrorComponent) { return null; }
      // You can render any custom fallback UI
      return <ErrorComponent error={error} info={errorInfo} />;
    }
    return children;
  }
}

export default ErrorBoundary;
