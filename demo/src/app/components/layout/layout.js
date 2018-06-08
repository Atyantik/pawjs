import React, { Component } from "react";
import Header from "../header";

export default class Layout extends Component {
  render() {
    return [
      <Header key="header"/>,
      <main key="content">
        {this.props.children}
      </main>
    ];
  }
}