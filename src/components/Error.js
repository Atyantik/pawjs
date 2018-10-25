import React from 'react';
import PropTypes from 'prop-types';

export default class Error extends React.PureComponent {
  static propTypes = {
    error: PropTypes.shape({
      message: PropTypes.string,
      stack: PropTypes.any,
    }),
    info: PropTypes.shape({
      componentStack: PropTypes.any,
    }),
  };

  static defaultProps = {
    error: {
      message: '',
      stack: '',
    },
    info: {
      componentStack: '',
    },
  };

  render() {
    const { error, info } = this.props;
    return (
      <div>
        <h1>An error occurred</h1>
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
            {info && info.componentStack}
          </pre>
        </code>
      </div>
    );
  }
}
