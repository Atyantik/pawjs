/**
 * Created by Yash Thakur
 * Date: 2/11/17
 * Time: 2:27 PM
 */

import React, { Component } from 'react';
import Prism from '../../../prism/prism';

export default class PageWithSubroutes extends Component {
  render() {
    return (
      <article>
        <header>
          <h1 className="mt-4">Creating a Page with Sub-Routes</h1>
          <hr />
        </header>
        <div>
          <p>
            Suppose you want to create pages such that a component/function remains common
            in both the pages. Eg: SideBar.
            <br />
            Here we can use
            {' '}
            <strong>Page with Sub-Routes</strong>
            {' '}
to create such a page.
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
              2) Create another React Component for the Page, eg: Welcome component in file `src/app/components/welcome.js`
              <Prism code={`import React, { Component } from "react";

export default class Welcome extends Component {

  render() {
    return (
      <h1>Welcome to the ReactPWA boilerplate!</h1>
    );
  }
}`}
              />
            </li>
            <li className="mt-4">
              3) Create a Component that will work as an Abstract Component for the Page,
              eg: Index component in file `src/app/components/index.js`
              <Prism code={`import { Component } from "react";

export default class Index extends Component {

  render() {
    return (
      <div>
        <div style={{
          width: "20%",
          display: "inline",
          float: "left"
        }}>
          Sidebar
        </div>
        <div style={{
          width: "80%",
          display: "inline",
        }}>
          {this.props.children}
        </div>
      </div>
    );
  }
}`}
              />
            </li>
            <li className="mt-4">
              4) Create a new page in `src/pages/home.js`
              <Prism code={`import Home from "../app/components/home";
import Welcome from "../app/components/welcome";
import Index from "../app/components/index";

const routes = [
  {
    path: "/",
    abstract: true,
    component: Index,
    routes: [
      {
        path: "/",
        exact: true,
        component: Home
      },
      {
        path: "/welcome",
        exact: true,
        component: Welcome
      }
    ]
  }
];
export default routes;
`}
              />
            </li>
            <li className="mt-4">
              5) Edit
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
