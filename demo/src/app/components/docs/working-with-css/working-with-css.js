import React, { Component } from "react";
import Prism from "../../prism";

export default class WorkingWithCss extends Component {
  render() {
    return (
      <article>
        <header>
          <h1>Working With CSS</h1>
          <hr />
        </header>
        <section>
          <p>
            A serious problem we face while developing a big enterprise application is managing the size of assets, including JS, CSS & Images.
            CSS is very important for presentation and can sometimes become heavy as styles for different pages are included in single CSS file.
            <br />
            If we create different styles for different pages, it becomes difficult to mange updates.
            Thus we came up with solution of adding component specific CSS.
          </p>
          <p>
            What we kept in mind while adding CSS support:
            <ol>
              <li>Should support SASS</li>
              <li>No need for developer to write prefix like -ms, -mox, -web-kit etc</li>
              <li>Provide support for CSSNEXT (well it is totally worth it)</li>
              <li>Only create css for specific page/module. Not including unnecessary other module css.</li>
              <li>There should be no conflict of css when used with same identifiers in different component.</li>
            </ol>
          </p>
          <p>
            We took care that CSS not required on the page is not included at all! <i>( Until and unless you decide to add it. )</i>
          </p>
          <hr />
        </section>
        <section>
          <header>
            <h2>Global CSS</h2>
          </header>
          <p>
            Well lets start with global css. There is no such thing like global css we just named it that way. CSS which is part of library and whose class names should remain intact is global css.
            For example Boostrap, foundation etc..
          </p>
          <p>The boilerplate is shipped with Bootstrap library and the library is located inside `src/resources/css` </p>
          <div className="alert alert-danger">
            <p className="alert-heading"><strong>src/resources/css/style.scss</strong></p>
            It is very important to note that file `src/resources/css/style.scss` should not be deleted in any case.
            You may empty the file, remove folders in same directory, but removing the style.scss will result in errors.
          </div>
          <p>So now we want to add boostrap to our boilerplate and use classes from it, so there would be 2 way to do it.</p>
          <section>
            <header>
              <h4>Adding from node_modules</h4>
            </header>
            <p>Step 1) Add Bootstrap</p>
            <Prism code="npm i bootstrap --save-dev" language="bash" />
            <p className="mt-4">
              Step 2) Import the CSS in `src/client.js`
            </p>
            <Prism code={`// .... import { trackPageView } from "pawjs/src/utils/analytics";

// Importing bootstrap
import "bootstrap/dist/css/bootstrap-theme.css";
import "bootstrap/dist/css/bootstrap.css";

// ....`} />
            <div className="alert alert-danger">
              <strong>DO NOT IMPORT MINIMIZED CSS <strike>.min.css</strike>. We are taking care of minimization ourselves. Minimized CSS has absolute paths and are not resolved properly. </strong>
            </div>
            <p className="mt-4">
              Once you have imported the css you can directly use in a dump component as below without importing any CSS.
            </p>
            <Prism code={`import React from "react";

export default function DumpComponent() {
  return (
    <div className="text-center">
        This is awesome. I can use bootstrap class (which may change in upcoming releases)
    </div>
  );
}`} />
          </section>
          <section className="mt-4">
            <header>
              <h4>Adding from resources folder</h4>
            </header>
            <p>Step 1) Download Bootstrap (scss if possible - no specific reason, I am just a control freak)</p>
            <p>
              Step 2) import css in `src/resources/css/style.scss`
            </p>
            <Prism code={`// ...
import "<relative path to downloaded .css>";
// ...`} />
            <div className="alert alert-danger">
              <strong>AGAIN! DO NOT IMPORT MINIMIZED CSS <strike>.min.css</strike>.</strong>
            </div>
            <p className="mt-4">
              Once you have imported the css you can directly use in a dump component as below without importing any CSS.<br />
              <strong>NOTE:</strong> There is not need to import CSS in `src/client.js`
            </p>
            <Prism code={`import React from "react";

export default function DumpComponent() {
  return (
    <div className="text-center">
        This is awesome. I can use bootstrap class (which may change in upcoming releases)
    </div>
  );
}`} />
          </section>
          <div className="alert alert-secondary mt-4">
            <p className="alert-heading"><strong>Minimize Usage of Global CSS</strong></p>
            <p>We highly discourage use of global CSS as it increases asset size of css. Please use it wisely and where its unavoidable.</p>
          </div>
        </section>
        <hr />
        <section>
          <header>
            <h2>CSS for Page</h2>
          </header>
          <div className="mt-3">
            <h3>Source Code</h3>
            <p>A very simple example of adding CSS to a component would be simply importing it in component.</p>
            
            <p>So for example we have a component called DumbComponent in `src/app/components/dumb/index.js` and a style file (sass, css or css-next) as `src/app/components/dumb/styles.css`</p>
  
            <p className="mb-0 mt-4">File: `src/app/components/dumb/styles.css`</p>
            <Prism code={`.text-blue {
   color: blue;
 }
 .centered {
   display: flex;
   align-items: center;
   justify-content: center;
}
`} language="css" />
            
            <p className="mb-0 mt-4">File: `src/app/components/dumb/index.js`</p>
            <Prism code={`import React from "react";
import * as styles from "./styles.css";

export default function DumpComponent() {
  return <div className={\`$\{styles["text-blue"]} $\{styles["centered"]}\`}>This is blue text!</div>;
}
`} />
            <hr />
            <h3>Converted Code</h3>
            <p>The above code will be converted to following: </p>
            <p className="mt-4">
              The css code above will be converted to below code:
            </p>
            <Prism code={`.text-blue {
   color: blue;
 }
.centered {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
}
`} language="css" />
            <p className="mt-4">
              The JSX snippet is converted to simple namespaced class name (in development mode) as below:
            </p>
            <Prism code={"<div class=\"style__text-blue style__centered\">This is blue text!</div>"} />
  
            <p className="mt-4">
              The JSX snippet is converted to hashed class name (in production mode) as below:
            </p>
            <Prism code={"<div class=\"style_text-blue_zDDtR style_centered_B3xTw\">This is blue text!</div>"} />
          </div>
        </section>
      </article>
    );
  }
}