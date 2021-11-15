import React, { Component } from 'react';
import { HttpStatus, Redirect } from './Paw';
import NotFoundError from '../errors/not-found';
import RedirectError from '../errors/redirect';

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
      if (error instanceof RedirectError) {
        return <Redirect to={error.getRedirect()} statusCode={error.getStatusCode()} />;
      }
      if (ErrorComponent) {
        return (
          <ErrorComponent error={error} info={errorInfo} />
        );
      }
      // You can render any custom fallback UI
      return (
        <HttpStatus statusCode={500}>
          <div>
            <h1>An error occurred</h1>
            <h2>Error Stack:</h2>
            {!!error?.message && (
              <p>{error && error.message}</p>
            )}
            {!!error?.stack && (
              <code>
                <pre>
                  {error && error.stack}
                </pre>
              </code>
            )}
            {!!errorInfo?.componentStack && (
              <>
                <h3>Component Stack:</h3>
                <code>
                  <pre>
                    {errorInfo && errorInfo.componentStack}
                  </pre>
                </code>
              </>
            )}
          </div>
        </HttpStatus>
      );
    }
    return children;
  }
}

export default ErrorBoundary;
