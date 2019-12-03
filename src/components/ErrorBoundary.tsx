import React, { Component } from 'react';
import Status from './RouteStatus';
import NotFoundError from '../errors/not-found';

interface IErrorProps {
  ErrorComponent?: React.ComponentType<any>;
  NotFoundComponent?: React.ComponentType<any>;
  error?: null | Error;
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
      hasError: props.error instanceof Error,
      error: props.error || null,
      errorInfo: props.error && props.error.stack ? props.error.stack : null,
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
    const { ErrorComponent, NotFoundComponent, children } = this.props;
    if (hasError) {
      if (error instanceof NotFoundError && NotFoundComponent) {
        return <NotFoundComponent error={error} info={errorInfo} />;
      }
      if (ErrorComponent) {
        return (
          <Status code={500}>
            <ErrorComponent error={error} info={errorInfo} />
          </Status>
        );
      }
      // You can render any custom fallback UI
      return (
        <Status code={500}>
          <div>
            <h1>An error occurred, not handled by your error handler or at top of the router</h1>
            <h2>Error Stack:</h2>
            <p>{error && error.message}</p>
            <code>
              <pre>
                {error && error.stack}
              </pre>
            </code>
            <h3>Component Stack:</h3>
            <code>
              <pre>
                {errorInfo && errorInfo.componentStack}
              </pre>
            </code>
          </div>
        </Status>
      );
    }
    return children;
  }
}

export default ErrorBoundary;
