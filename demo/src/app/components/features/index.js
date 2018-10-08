/**
 * Created by Yash Thakur
 * Date: 27/10/17
 * Time: 4:52 PM
 */

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Prism from '../prism';

export default class FeaturesIndex extends Component {
  render() {
    return (
      <article>
        <header>
          <h1 className="mt-4">Features</h1>
          <hr />
          <p>We have worked on many features. Checkout the list below:</p>
        </header>
        <section>
          <div className="card mt-4">
            <Link
              to="/features/pwa-progressive-web-application"
              className="text-dark"
            >
              <div className="card-body">
                <header>
                  <h4 className="card-title">Progressive Web Application</h4>
                </header>
                <p className="card-text">
                  Essentially, a PWA is a website that is capable of being promoted to being native-ish.
                  It gets many of the benefits of being a native app, but also has all the benefits of
                  being a website too.
                </p>
              </div>
            </Link>
          </div>

          <div className="card mt-4">
            <Link
              to="/features/access-offline"
              className="text-dark"
            >
              <div className="card-body">
                <h4 className="card-title">Offline support</h4>
                <p className="card-text">
                  Use Service Worker to connect with your users even when they're not
                </p>
              </div>
            </Link>
          </div>

          <div className="card mt-4">
            <Link
              to="/features/code-splitting"
              className="text-dark"
            >
              <div className="card-body">
                <h4 className="card-title">Code Splitting</h4>
                <p className="card-text">
                  Difficulty is faced when developing enterprise application with code splitting.
                  We don't need everything in single JS file.
                  Why not create individual JS files for respective module/page!
                  We make it really easy here to just create a page that return array of routes.
                  Code is split and loaded automatically when the respective route is called.
                </p>
              </div>
            </Link>
          </div>

          <div className="card mt-4">
            <Link
              to="/features/hot-reloading"
              className="text-dark"
            >
              <div className="card-body">
                <h4 className="card-title">Hot Reloading</h4>
                <p className="card-text">
                  The idea behind hot reloading is to keep the app running and to inject new versions of the files that you edited at runtime.
                  This way, you don't lose any of your state which is especially useful if you are tweaking the UI.
                </p>
              </div>
            </Link>
          </div>

          <div className="card mt-4">
            <Link
              to="/features/next-gen-js-es6-es7"
              className="text-dark"
            >
              <div className="card-body">
                <h4 className="card-title">Next Generation JavaScript</h4>
                <h6 className="card-subtitle mb-2 text-muted">ES6/7 Compatible</h6>
                <p className="card-text">
                  Using babel we support the next generation JavaScript syntax including Object/Array destructuring,
                  arrow functions, JSX syntax and more...
                </p>
              </div>
            </Link>
          </div>

          <div className="card mt-4">
            <Link
              to="/features/isomorphic-universal-routing"
              className="text-dark"
            >
              <div className="card-body">
                <h4 className="card-title">React Router</h4>
                <p className="card-text">
                  We are using the most accepted React router for routing the application.
                  Add your favorite /about, /contact, /dashboard pages easily.
                </p>
              </div>
            </Link>
          </div>

          <div className="card mt-4">
            <Link
              to="/features/seo-search-engine-optimization"
              className="text-dark"
            >
              <div className="card-body">
                <h4 className="card-title">SEO</h4>
                <h6 className="card-subtitle mb-2 text-muted">Enabled in production mode</h6>
                <p className="card-text">
                  Our customized routes enable creating meta tags to create Twitter, Google+, Linkedin, Facebook cards.
                  We know how important SEO is to an application.
                </p>
              </div>
            </Link>
          </div>

          <div className="card mt-4">
            <Link
              to="/features/caching"
              className="text-dark"
            >
              <div className="card-body">
                <h4 className="card-title">Page caching</h4>
                <h6 className="card-subtitle mb-2 text-muted">Enabled in production mode</h6>
                <p className="card-text">
                  Well now you can cache a page in SSR. Pretty simple. just add cache option to your route
                </p>
                <Prism code={'{ cache: { enable: true, duration: 10000}}'} />
                <p className="card-text">
                  this helps you cache page when rendered via server. Why increase server load when page is static and cacheable!
                </p>
              </div>
            </Link>
          </div>

          <div className="card mt-4">
            <Link
              to="/features/bundling"
              className="text-dark"
            >
              <div className="card-body">
                <h4 className="card-title">Bundling</h4>
                <p className="card-text">
                  Webpack is a module bundler that takes assets such as CSS, images or JavaScript
                  files with lots of dependencies and turns them into something that you can provide
                  to a client web page.
                </p>
              </div>
            </Link>
          </div>

          <div className="card mt-4">
            <Link
              to="/features/image-optimization"
              className="text-dark"
            >
              <div className="card-body">
                <h4 className="card-title">Image optimizations</h4>
                <p className="card-text">
                  You can use any type of Image during development and we will make sure that images get optimized before a build is generated.
                  This takes time but its totally worth it. Best user experience is what we all developers are looking for.
                  <i>We are using imagemin plugins to optimize SVG, JPEG, GIF & PNG</i>
                </p>
              </div>
            </Link>
          </div>

          <div className="card mt-4">
            <Link
              to="/features/hsts"
              className="text-dark"
            >
              <div className="card-body">
                <h4 className="card-title">HSTS Supported</h4>
                <h6 className="card-subtitle mb-2 text-muted">Using HTTPS ?</h6>
                <p className="card-text">
                  HSTS is enabled default for your secure sites. Options to define maxAge and preload of HSTS, all with very simple configuration.
                </p>
              </div>
            </Link>
          </div>

        </section>
      </article>
    );
  }
}
