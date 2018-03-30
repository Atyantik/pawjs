/**
 * Created by Yash Thakur
 * Date: 27/10/17
 * Time: 5:00 PM
 */

import React, { Component } from "react";
import Link from "pawjs/src/components/link";
import * as styles from "./features.scss";

export default class SidebarLinks extends Component {
  render() {
    return (
      <ul className={`list-unstyled ${styles["padded-nav"]}`}>
        <li>
          <Link animateSection="features-content" to="/features" className="text-lead">Features</Link>
        </li>
        <li>
          <Link animateSection="features-content" to="/features/pwa-progressive-web-application" className="text-lead">PWA</Link>
        </li>
        <li>
          <Link animateSection="features-content" to="/features/access-offline" className="text-lead">Offline Accessibility</Link>
        </li>
        <li>
          <Link animateSection="features-content" to="/features/code-splitting" className="text-lead">Code Splitting</Link>
        </li>
        <li>
          <Link animateSection="features-content" to="/features/hot-reloading" className="text-lead">Hot Reloading</Link>
        </li>
        <li>
          <Link animateSection="features-content" to="/features/next-gen-js-es6-es7" className="text-lead">Next Gen JS</Link>
        </li>
        <li>
          <Link animateSection="features-content" to="/features/isomorphic-universal-routing" className="text-lead">Isomorphic/Universal Routing</Link>
        </li>
        <li>
          <Link animateSection="features-content" to="/features/seo-search-engine-optimization" className="text-lead">SEO</Link>
          <ul>
            <li>
              <Link animateSection="features-content" to="/features/seo-search-engine-optimization/social-sharing" className="text-lead">Social Sharing</Link>
            </li>
            <li>
              <Link animateSection="features-content" to="/features/seo-search-engine-optimization/ssr-server-side-rendering" className="text-lead">SSR</Link>
            </li>
            <li>
              <Link animateSection="features-content" to="/features/seo-search-engine-optimization/content-folding" className="text-lead">Content Folding</Link>
            </li>
          </ul>
        </li>
        <li>
          <Link animateSection="features-content" to="/features/caching" className="text-lead">Caching</Link>
        </li>
        <li>
          <Link animateSection="features-content" to="/features/bundling" className="text-lead">Bundling</Link>
        </li>
        <li>
          <Link animateSection="features-content" to="/features/image-optimization" className="text-lead">Image Optimization</Link>
        </li>
        <li>
          <Link animateSection="features-content" to="/features/hsts" className="text-lead">HSTS</Link>
        </li>
      </ul>
    );
  }
}