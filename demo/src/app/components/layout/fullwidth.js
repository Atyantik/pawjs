import React, { Component } from "react";

export default class Layout extends Component {
  render() {
    return (
      <main>
        {this.props.children}
      </main>
    );
  }
}