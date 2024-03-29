import React, { PureComponent, SyntheticEvent } from 'react';
import { Link } from 'react-router-dom';

export default class Header extends PureComponent<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      open: false,
    };
    this.closeMenuBar = this.closeMenuBar.bind(this);
    this.toggleMenuBar = this.toggleMenuBar.bind(this);
  }

  toggleMenuBar(e: SyntheticEvent) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    this.setState((prevState: any) => ({
      open: !prevState.open,
    }));
  }

  closeMenuBar() {
    this.setState({ open: false });
  }

  render() {
    const { open } = this.state;
    const buttonStyle = {
      background: 'none',
      border: 'none',
      outline: 'none',
    };
    return (
      <div>
        <nav className="navbar" role="navigation" aria-label="main navigation">
          <div className="container">
            <div className="navbar-brand">
              <Link to="/" className=" navbar-item"><strong>ReactPWA</strong></Link>
              <button
                type="button"
                onClick={this.toggleMenuBar}
                className={`navbar-burger ${open ? 'is-active' : ''}`}
                aria-label="menu"
                aria-expanded="false"
                style={buttonStyle}
              >
                <span aria-hidden="true" />
                <span aria-hidden="true" />
                <span aria-hidden="true" />
              </button>
            </div>
            <div className={`navbar-menu ${open ? 'is-active' : ''}`}>
              <Link className="navbar-item" to="/home" onClick={this.closeMenuBar}>
                Home
              </Link>
              <Link className="navbar-item" to="/global-local-css" onClick={this.closeMenuBar}>
                Global & Local CSS
              </Link>
              <Link className="navbar-item" to="/typescript-counter/tirthbodawala" onClick={this.closeMenuBar}>
                TypeScript Counter
              </Link>
              <Link className="navbar-item" to="/skeleton-loading" onClick={this.closeMenuBar}>
                Skeleton Loading
              </Link>
              <Link className="navbar-item" to="/nested" onClick={this.closeMenuBar}>
                Nested
              </Link>
              <Link className="navbar-item" to="/invalid-path" onClick={this.closeMenuBar}>
                Invalid Path
              </Link>
              <Link className="navbar-item" to="/login" onClick={this.closeMenuBar}>
                Auth
              </Link>
              <Link className="navbar-item" to="/contribute" onClick={this.closeMenuBar}>
                Contribute
              </Link>
              <a
                className="navbar-item has-text-danger"
                href="https://www.reactpwa.com"
                onClick={this.closeMenuBar}
              >
                Visit ReactPWA.com
              </a>
            </div>
          </div>
        </nav>
      </div>
    );
  }
}
