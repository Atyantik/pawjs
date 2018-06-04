import React, {Component} from "react";

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
    if (this.state.hasError) {
      const ErrorComponent = this.props.ErrorComponent;
      if (!ErrorComponent) { return null; }
      // You can render any custom fallback UI
      return <ErrorComponent {...this.props} error={this.state.error} info={this.state.errorInfo} />;
    }
    return this.props.children;
  }
}
