/**
 * Created by Yash Thakur
 * Date: 2/11/17
 * Time: 2:27 PM
 */

import React, { Component } from 'react';
import Prism from '../../../prism/prism';

export default class PageWithLayout extends Component {
  render() {
    return (
      <article>
        <header>
          <h1 className="mt-4">Create a Page with a Layout</h1>
          <hr />
        </header>
        <div>
          <p>
            <strong>Headers</strong>
            {' '}
and
            <strong>Footers</strong>
            {' '}
are the most common
            things that you will see in websites nowadays. To automatically add it to
            your page once you have built the components for
            <strong>header</strong>
            {' '}
and&nbsp;
            <strong>footer</strong>
            {' '}
follow the steps below:
          </p>
          <ul className="list-unstyled">
            <li className="mt-4">
              1) Create a React Component for the Page, eg: Home component in file `src/app/components/home.js`
              <Prism code={`import React, { Component } from "react";

export default class Home extends Component {

  render() {
    return (
      <h1>Hello World!</h1>
    );
  }
}`}
              />
            </li>
            <li className="mt-4">
              2) Create a React Component for the Page Header, eg: Header component in file `src/app/components/header.js`
              <Prism code={`import React, { Component } from "react";

export default class Header extends Component {

  render() {
    return (
      <div>Header</div>
    );
  }
}`}
              />
            </li>
            <li className="mt-4">
              3) Create a React Component for the Page Footer, eg: Footer component in file `src/app/components/footer.js`
              <Prism code={`import React, { Component } from "react";

export default class Footer extends Component {

  render() {
    return (
      <div>Footer</div>
    );
  }
}`}
              />
            </li>
            <li className="mt-4">
              4) Create a React Component for the Page Layout, eg: Layout component in file `src/app/components/layout.js`
              <Prism code={`import React, { Component } from "react";
import Header from "./home";
import Footer from "./footer";

export default class defaultLayout extends Component {

  render() {
    return (
      <div>
        <Header/>
        {this.props.children}
        <Footer/>
      </div>
    );
  }
}`}
              />
            </li>
            <li className="mt-4">
              5) Create a new page in `src/pages/home.js`
              <Prism code={`import Home from "../app/components/home";
import defaultLayout from "../app/components/layout";

const routes = [
  {
    path: "/",
    exact: true,
    layout: defaultLayout,
    component: Home
  }
];
export default routes;
`}
              />
            </li>
            <li className="mt-4">
              6) Edit
              {' '}
              <i>`src/routes.js`</i>
              {' '}
and add route for home page.
              <Prism code={`import { configureRoutes } from "pawjs/src/utils/bundler";

// routes
import * as Home from "./pages/home";

export default configureRoutes([
  Home
]);`}
              />
              <p className="alert alert-info">
                <strong>NOTE:</strong>
                {' '}
Please maintain the import syntax as above, because we add bundleKey to the route via route-loader.
              </p>
            </li>
          </ul>
        </div>
      </article>
    );
  }
}
