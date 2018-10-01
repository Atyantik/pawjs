import React, {Component} from "react";
import { Link } from "react-router-dom";
import WhiteLogo from "../../../resources/images/reactpwa-logo-white.png";
import GithubImage from "./github-icon-white.png";
import Storage from "pawjs/src/libs/storage";

export default class Header extends Component {
  state = {
    showNeedContributors: false,
  };
  componentDidMount() {
    //let showNeedContributors = Storage.getItem("showNeedContributors");
    let showNeedContributors = Storage.getItem("showNeedContributorsUpgrade");
    showNeedContributors = typeof showNeedContributors === "undefined";
    this.setState({
      showNeedContributors
    });
  }
  hideNeedContributors(e) {
    e && e.preventDefault && e.preventDefault();
    this.setState({
      showNeedContributors: false,
    });
    Storage.setItem("showNeedContributorsUpgrade", "shown");
  }
  render() {
    return (
      <div className="container-fluid bg-primary">
        {
          this.state.showNeedContributors && (
            <div className="bg-dark row text-white p-4">
              <div className="float-left mr-4">
                <h1>Upgrading!</h1>
                <h3>Thanks for your support to ReactPWA. We are upgrading PawJS, the core of ReactPWA, with great optimization changes.</h3>
                <p className="mb-1">
                  Please support us at <a className="text-white" href="https://opencollective.com/react-pwa" target="_blank" rel="nofollow noopener"><u>OpenCollective</u></a>. Your small contribution motivates us and helps us moving forward, thus improving the project.
                </p>
                <p>
                  You can also visit our github repository: <a className="text-white" href="https://github.com/Atyantik/react-pwa" target="_blank" rel="nofollow noopener"><u>https://github.com/Atyantik/react-pwa</u></a> and star our repo.
                </p>
              </div>
              <a href="/" className="text-white ml-md-auto" onClick={e => this.hideNeedContributors(e)}><strong>[x] close</strong></a>
            </div>
          )
        }
        
        <div className="row p-2">
          <div className="col text-white h3 mb-0">
            <div className="d-inline-block" style={{ width: "32px" }}>
              <Link to="/">
                <img src={WhiteLogo} alt="ReactPWA" className="mw-100"/>
              </Link>
            </div>
            <Link to="/" className="d-none d-sm-inline text-white ml-2 align-bottom" style={{ textDecoration: "none"}}>React PWA</Link>
          </div>
          <a className="mr-2" href="https://github.com/Atyantik/react-pwa" target="_blank" rel="nofollow noopener" style={{ width: "32px" }}>
            <img src={GithubImage} alt="ReactPWA" className="mw-100"/>
          </a>
          <Link to="/features" className="text-white pull-right mr-3" style={{ textDecoration: "none", lineHeight: "2rem"}}>Features</Link>
          <Link to="/docs" className="d-none d-sm-block text-white pull-right" style={{ textDecoration: "none", lineHeight: "2rem"}}>Documentation</Link>
          <Link to="/docs" className="d-sm-none text-white pull-right" style={{ textDecoration: "none", lineHeight: "2rem"}}>Docs</Link>
        </div>
      </div>
    );
  }
}
