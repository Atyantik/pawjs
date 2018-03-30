/**
 * Created by Yash Thakur
 * Date: 3/11/17
 * Time: 12:26 PM
 */

import React, { Component } from "react";
import Prism from "../../prism/prism";
import Link from "pawjs/src/components/link/link";

export default class OverrideCore extends Component {
  render(){
    return(
      <article>
        <header>
          <h1>Overriding Core Components</h1>
          <hr/>
        </header>
        <section>
          <section>
            <p>
              When a developer is developing something using a ready-made boilerplate
              the first question that comes to the mind is how should I change the core
              components and override it with my own components.
            </p>
            <p>
              We have already defined how to override the&nbsp;
              <Link to="/docs/customizing-loader">loader</Link> and&nbsp;
              <Link to="/docs/error-pages">error pages</Link>.
            </p>
            <p>
              To override the core components the most important file is : <i>`src/config/classMap.js`</i>&nbsp;
              which contains all the core components.
            </p>
            <Prism
              code={`import Err404 from "pawjs/src/components/error/404";
import Err500 from "pawjs/src/components/error/500";
import Offline from "pawjs/src/components/error/offline";
import Loader from "pawjs/src/components/loader";
import Fold from "pawjs/src/components/fold";
import Root from "pawjs/src/components/root";

  /**
   * Specify Mapping of components respective to
   * src folder
   * @type Object
   */
  export default {
    "error/404": Err404,
    "error/500": Err500,
    "error/offline": Offline,
    "loader": Loader,
    "fold": Fold,
    "root": Root
  };
  `}
            />
          </section>
          <hr/>

          <section>
            <header>
              <h3 className="mt-4">Overriding Root component</h3>
            </header>
            <div>
              <p>
                Root component is the component that will be loaded as a <i>parent</i> of all
                pages. Hence you can put the CSS and JS, to be loaded in head tags, here.
              </p>
              <p>
                Steps to override the root component:
              </p>
              <ul className="list-unstyled">
                <li className="mt-4">
                  1) Make a Root component in <i>`src/app/components/root.js`</i>
                  <Prism code={`import { Component } from "react";

export default class AppRoot extends Component {

  //Here you can load your custom functions and load them in componentDidMount() {}

  render() {
    return (this.props.children || null);
  }
}`} />
                </li>
                <li className="mt-4">
                  2) import the AppRoot component in <i>`src/config/classMap.js`</i> and replace it with Root of core.
                  <Prism code={`import Err404 from "pawjs/src/components/error/404";
import Err500 from "pawjs/src/components/error/500";
import Offline from "pawjs/src/components/error/offline";
import Loader from "pawjs/src/components/loader";
import Fold from "pawjs/src/components/fold";
import AppRoot from "../app/components/root";

  /**
   * Specify Mapping of components respective to
   * src folder
   * @type Object
   */
  export default {
    "error/404": Err404,
    "error/500": Err500,
    "error/offline": Offline,
    "loader": Loader,
    "fold": Fold,
    "root": AppRoot
  };
  `} />
                </li>
              </ul>
            </div>
          </section>
          <hr/>

          <section>
            <header>
              <h3 className="mt-4">Overriding Fold component</h3>
            </header>
            <div>
              <p>
                Similar to the <strong>Root</strong> component you can override the&nbsp;
                <strong>Fold</strong> component.
              </p>
            </div>
          </section>
          <hr/>

          <section>
            <header>
              <h3>Overriding Offline Component</h3>
            </header>
            <div>
              <p>
                Offline component is used to display the offline page/component to the user
                when the user is trying to fetch data using API call but is offline(not connected to internet).
              </p>
              <p>
                Steps to override the core offline component:
              </p>
              <ul className="list-unstyled">
                <li>
                  1) Make a component for Offline <i>`src/app/components/offline/offline.js`</i>
                  <Prism
                    code={`import React, { Component } from "react";

export default class OfflinePage extends Component {

  render () {

    return (
      <div className="container text-center mt-5">
        <h1 className="mt-5">You are Offline</h1>
        <p className="h3">Kindly connect to network to load content for this page.</p>
      </div>
    );
  }
}
                    `}
                  />
                </li>
                <li className="mt-4">
                  2) import the OfflinePage component in <i>`src/config/classMap.js`</i> and replace it with Offline of core.
                  <Prism code={`import Err404 from "pawjs/src/components/error/404";
import Err500 from "pawjs/src/components/error/500";
import OfflinePage from "../app/components/offline";
import Loader from "pawjs/src/components/loader";
import Fold from "pawjs/src/components/fold";
import AppRoot from "../app/components/root";

  /**
   * Specify Mapping of components respective to
   * src folder
   * @type Object
   */
  export default {
    "error/404": Err404,
    "error/500": Err500,
    "error/offline": OfflinePage,
    "loader": Loader,
    "fold": Fold,
    "root": AppRoot
  };
  `} />
                </li>
              </ul>
            </div>
          </section>

        </section>
      </article>
    );
  }
}