import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import * as styles from "./style.scss";

@withRouter
export default class SidebarNav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      state: "close"
    };
  }
  componentDidUpdate(prevProps) {
    if (
      this.props.location !== prevProps.location
      && this.state.state !== "close"
    ) {
      this.closeNav();
    }
  }
  openNav(e) {
    e && e.preventDefault && e.preventDefault();
    this.setState({
      state: "open"
    });
  }
  closeNav(e) {
    e && e.preventDefault && e.preventDefault();
    this.setState({
      state: "close"
    });
  }
  
  
  render() {
    return (
      <div className={this.props.className}>
        <nav className={`${styles["mobile-nav"]} ${this.state.state === "open" ? styles["open"]: ""}`}>
          <div className="d-block w-100 mb-4 mb-md-0 pt-2">
            <strong className="text-muted">Navigate to:</strong>
            <button
              onClick={e => this.closeNav(e)}
              className={`btn btn-outline-primary float-right ${styles["btn-close"]}`}
            >
              Close
            </button>
          </div>
          {this.props.children}
        </nav>
        <div className={styles["opener"]} onClick={e => this.openNav(e)}/>
      </div>
    );
  }
}