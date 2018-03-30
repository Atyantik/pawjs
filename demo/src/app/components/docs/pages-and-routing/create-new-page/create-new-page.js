/**
 * Created by Yash Thakur
 * Date: 2/11/17
 * Time: 2:27 PM
 */

import React, { Component } from "react";
import Prism from "../../../prism/prism";

export default class CreateNewPage extends Component {
  render() {
    return(
      <article>
        <header>
          <h1 className="mt-4">Create a Simple Page and its Route</h1>
          <hr/>
        </header>
        <section>
          <div>
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
}`} />
              </li>
              <li className="mt-4">
                2) Create a new page in `src/pages/home.js`
                <Prism code={`import Home from "../app/components/home";

const routes = [
  {
    path: "/",
    exact: true,
    component: Home
  }
];
export default routes;
`} />
              </li>
              <li className="mt-4">
                3) Edit <i>`src/routes.js`</i> and add route for home page.
                <Prism code={`import { configureRoutes } from "pawjs/src/utils/bundler";

// routes
import * as Home from "./pages/home";

export default configureRoutes([
  Home
]);`} />
                <p className="alert alert-info">
                  <strong>NOTE:</strong> Please maintain the import syntax as above, because we add bundleKey to the route via route-loader.
                </p>
              </li>
            </ul>
          </div>
        </section>
      </article>
    );
  }
}