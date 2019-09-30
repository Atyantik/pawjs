import React, { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({
      hasError: true,
      error,
      errorInfo: info,
    });
  }

  render() {
    const { hasError, error, errorInfo } = this.state;
    // eslint-disable-next-line
    const { ErrorComponent, children } = this.props;
    if (hasError) {
      if (!ErrorComponent) { return null; }
      // You can render any custom fallback UI
      return <ErrorComponent {...this.props} error={error} info={errorInfo} />;
    }
    return children;
  }
}
