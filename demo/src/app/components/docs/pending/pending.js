import React, { Component } from 'react';

export default class Pending extends Component {
  render() {
    return (
      <div>
        <h1 className="mb-3">{this.props.title}</h1>
        <div className="alert alert-primary">
          <h3>Work in progress...</h3>
          We have already a provision for this, but its not documented yet. We are working on it and will
          get it up really soon. Thank you for your patience.
        </div>
      </div>
    );
  }
}
