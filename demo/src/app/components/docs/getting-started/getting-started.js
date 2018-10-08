import React, { Component } from 'react';
import Prism from '../../prism/prism';

export default class Docs extends Component {
  render() {
    return (
      <article>
        <header>
          <h1>Getting Started</h1>
          <hr />
        </header>
        <section>
          <header>
            <h2>Starting Fresh - "Hello World!"</h2>
          </header>
          <div>
            <p>
              Lets start by downloading a fresh copy of react-pwa.
              You can use git clone if you are already familiar with git or
              you can click
              {' '}
              <a href="https://github.com/Atyantik/react-pwa/archive/master.zip" target="_blank" rel="nofollow noopener">this link to download the copy of code</a>
            </p>
            <Prism code="git clone https://github.com/Atyantik/react-pwa.git" language="bash" />
            <p>This will create a directory "react-pwa" in your current folder</p>
          </div>

          <div>
            <Prism code="cd react-pwa && npm install" />
          </div>

          <div className="alert alert-danger mt-4">
            <strong>The PYTHON error: </strong>
            <Prism
              code={"Can't find Python executable \"python\", you can set the PYTHON env variable."}
              language="bash"
            />
            <p>
You will need to install
              <strong>node-gyp</strong>
            </p>
            <div className="alert alert-danger">
              <p>If you're using Windows you can now install all node-gyp dependencies with single command (NOTE: Run As Admin in Windows PowerShell):</p>
              <Prism code="npm install -g windows-build-tools" language="bash" />
            </div>
            <Prism code="npm install -g node-gyp" language="bash" />
            <p>
Please refer to detailed docs at
              <a target="_blank" href="https://github.com/nodejs/node-gyp" rel="nofollow noopener">https://github.com/nodejs/node-gyp</a>
            </p>
          </div>

          <div>
            <p>Once the installation is completed, you can now test if the example app is working</p>
            <Prism code="npm start" language="bash" />
            <p>Once the compilation is completed by webpack dev server it should output the below: </p>
            <Prism
              code={`cross-env NODE_ENV=development nodemon --exec babel-node --watch ./src/server.js --watch ./src/client.js --watch ./src/core --watch ./webpack ./src/server.js
[nodemon] 1.12.1
[nodemon] to restart at any time, enter \`rs\`
[nodemon] watching: ./src/server.js ./src/client.js /home/tirthbodawala/workspace/reactpwa.com/src/core/**/* /home/tirthbodawala/workspace/reactpwa.com/webpack/**/*
[nodemon] starting \`babel-node ./src/server.js\`
Creating bundle with Webpack dev server.. Please wait..
Listening at http://0.0.0.0:3003
`}
              language="bash"
            />
            <p>
You can access your local application at
              <i>http://localhost:3003</i>
            </p>
          </div>
          <hr />
          <section>
            <header>
              <h3>Removing the example application</h3>
              <small>Before removing, make sure you have closed the running instance of example app</small>
            </header>
            <div>
              <ul className="list-unstyled">
                <li>
1) Remove everything from
                  <i>`src/app/components`</i>
.
                </li>
                <li>
2) Remove all files from
                  <i>`src/pages`</i>
                  {' '}
folder.
                </li>
                <li>
                  3) Edit
                  {' '}
                  <i>`src/routes.js`</i>
                  {' '}
and remove all the previous routes.
                  <Prism code={`import { configureRoutes } from "pawjs/src/utils/bundler";

// routes

export default configureRoutes([
]);`}
                  />
                </li>
              </ul>
            </div>
          </section>
          <hr />
          <section>
            <header>
              <h3>Creating Home Component & Route</h3>
            </header>
            <div>
              <ul className="list-unstyled">
                <li>
                  1) As simple as creating React Component create Home component in file `src/app/components/home.js`
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
                <li>
                  2) Create new page in `src/pages/home.js`
                  <Prism code={`import Home from "../app/components/home";

const routes = [
  {
    path: "/",
    exact: true,
    component: Home
  }
];
export default routes;
`}
                  />
                </li>
                <li>
                  3) Edit
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
              <p>
That's all start your application with
                <strong>npm start</strong>
                {' '}
and you will have your
                <strong>Hello world!</strong>
                {' '}
home page ready.
              </p>
            </div>
          </section>
        </section>
      </article>
    );
  }
}
