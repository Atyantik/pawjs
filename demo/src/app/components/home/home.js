import React, { Component } from "react";
import { Link } from "react-router-dom";
import Prism from "../prism";
import AnimatedAtom from "../animated-atom";
import * as styles from "./home.scss";
// import firebase from "../../../../../packages/pawjs-firebase";

// console.log(firebase.database());

const supportsServiceWorker = function() {
  if (typeof window === "undefined") return false;
  return "serviceWorker" in window.navigator;
};

export default class Home extends Component {
  constructor(props){
    super(props);
    this.state = {
      supportsServiceWorker: false,
    };
  }
  componentDidMount() {
    if (supportsServiceWorker()) {
      this.setState({
        supportsServiceWorker: true,
      });
    }
  }
  
  render() {
    return (
      <div>
        <div className="container-fluid">
          <div className="hero bg-primary p-5 row align-items-center justify-content-center">
            <div className={`text-white mb-3 mb-md-0 ${styles["hero-left"]}`}>
              <h1 className="d-sm-none">React PWA</h1>
              <p className="h4 text-uppercase">
                <small>Create</small><br />
                <strong>Upgradable</strong><br /><strong>SEO Friendly</strong><br /><strong>Progressive web applications</strong></p>
            </div>
            <div className="m-auto">
              <AnimatedAtom />
            </div>
            <div className={`text-white mt-5 mt-md-0 ${styles["hero-right"]}`}>
              <p>
                It's fast and developer friendly, already loaded with Docker support and deployable with no need to install with npm dependencies!
                <br />
                <strong>And more importantly its <i>UPGRADABLE!</i></strong>
                <br />
                <Link to="/features" className="btn btn-pearl mt-3">View all features</Link>
              </p>
            </div>
            <div className="col-sm-12 text-center mt-5">
              <a
                className="btn btn-outline-pearl mr-2"
                href="https://github.com/Atyantik/react-pwa/archive/master.zip"
                target="_blank"
                rel="nofollow noopener"
              >
                Download and get started
              </a>
            </div>
          </div>
        </div>
        <div className="container">
          <p className="mt-5 text-center">
            <span className="h4">Lets get started with 3 simple steps:</span>
          </p>
          <div className="mt-5">
            <strong>1) Cloning the repository: </strong>
            <small className="text-muted">The command below will create a folder "react-pwa" relative to your current directory</small>
            <Prism code={"git clone https://github.com/Atyantik/react-pwa.git"} language="bash" />
          </div>
          <div className="mt-3">
            <strong>2) Moving to the repository & installing dependencies: &nbsp;</strong>
            <Prism code={"cd react-pwa && npm install"} language="bash" />
          </div>
          <div className="mt-3">
            <strong>3) Running the boilerplate: &nbsp;</strong>
            <Prism code={"npm start"} language="bash" />
          </div>
          <p className="text-center">
            Visit <a href="http://localhost:3003" rel="nofollow noopener" target="_blank">http://localhost:3003</a> to see the boilerplate in action!
          </p>
          <p className="mt-4">
            <i>For more detailed instruction please visit <Link to="/docs">docs</Link></i>
          </p>
          {this.state.supportsServiceWorker && (
            <div className="card text-white bg-info mb-3">
              <div className="card-header"><small>This is a </small> Progressive Web Application!</div>
              <div className="card-body">
                <h4 className="card-title">Add us to "Home screen"</h4>
                <p className="card-text">You might be interested to learn that current site is build using ReactPWA.
                  Why don't you add us to your Home Screen when prompted.
                  We are sure you will love the experience.</p>
              </div>
            </div>
          )}
        </div>
        <Link to="/test">Test</Link>
      </div>
    );
  }
}