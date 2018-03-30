import React, { Component } from "react";
import Link from "pawjs/src/components/link";
import Transition from "pawjs/src/components/transition/transition";
import SidebarNav from "../sidebar-nav";
import * as styles from "./styles.scss";
import Disqus from "../disqus";

export default class DocsLayout extends Component {
  render() {
    return (
      <div className="row">
        <SidebarNav className={"col-lg-3 p-2 mt-2"}>
          <ul className={`list-unstyled ${styles["padded-nav"]}`}>
            <li>
              <Link animateSection="docs-content" to="/docs">Getting Started - Hello World!</Link>
            </li>
            <li>
              <Link animateSection="docs-content" to="/docs/configuring-pwa">Configuring PWA</Link>
            </li>
            <li>
              <Link animateSection="docs-content" to="/docs/customizing-loader">Customizing Loader</Link>
            </li>
            <li>
              <Link animateSection="docs-content" to="/docs/working-with-css">Working with CSS</Link>
            </li>
            <li>
              <Link animateSection="docs-content" to="/docs/error-pages">Error Pages</Link>
            </li>
            <li>
              <Link animateSection="docs-content" to="/docs/overriding-core-components">Overriding Core Components</Link>
            </li>
            <li>
              <Link animateSection="docs-content" to="/docs/pages-routing">Pages and routing</Link>
              <ul >
                <li>
                  <Link animateSection="docs-content" to="/docs/pages-routing/create-new-page">
                    Simple Page with Routes
                  </Link>
                </li>
                <li>
                  <Link animateSection="docs-content" to="/docs/pages-routing/page-with-subroutes">
                    Page with Sub-Routes
                  </Link>
                </li>
                <li>
                  <Link animateSection="docs-content" to="/docs/pages-routing/page-with-layout">
                    Create a Page with Layout
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <Link animateSection="docs-content" to="/docs/external-script-libraries">Using external script libraries</Link>
            </li>
            <li>
              <Link animateSection="docs-content" to="/docs/page-transitions">Page Transitions</Link>
            </li>
            <li>
              <Link animateSection="docs-content" to="/docs/ssr-server-side-rendering">Server Side Rendering (SSR)</Link>
            </li>
            <li>
              <Link animateSection="docs-content" to="/docs/configuring-redux">Configuring Redux</Link>
            </li>
          </ul>
          <p>We are busy writing documentation for the boilerplate. Thank you for your patience.</p>
          <div className="alert alert-warning mt-2">We are looking for contributors and queries to create useful documentation. Please contribute.</div>
        </SidebarNav>
        <div  className="col-lg-9">
          <Transition
            sectionName={"docs-content"}
            className={styles["animator"]}
            onEnterClassName={styles["fade-in"]}
            onExitClassName={styles["fade-out"]}
          >
            <div className="mt-4">
              {this.props.children}
            </div>
          </Transition>
          <div className="alert alert-warning mt-5">We are looking for contributors and queries to create useful documentation. Please contribute.</div>
          <div className="mt-4">
            <Disqus />
          </div>
        </div>
      </div>
    );
  }
}
