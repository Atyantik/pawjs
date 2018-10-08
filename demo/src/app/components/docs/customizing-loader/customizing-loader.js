import React, { Component } from 'react';
import Link from 'pawjs/src/components/link';
import Prism from '../../prism/prism';

export default class Docs extends Component {
  render() {
    return (
      <article>
        <header>
          <h1>Customizing Loader</h1>
          <hr />
        </header>
        <section>
          <header>
            <h2>Creating the loader component</h2>
          </header>
          <p>
If you followed the
            <Link to="/docs" animateSection="docs-content"><i>Get Started - Starting Fresh</i></Link>
            {' '}
tutorial then you are probably using the default loader shipped with the Boilerplate.
          </p>
          <p>If not then lets delete the loader and create one from scratch</p>
          <div className="alert alert-primary">
            <strong className="alert-heading">Remove existing loader</strong>
            <p>
              Remove folder `src/app/components/loader` if present.
            </p>
            <p><i><u>Please note, this step is not compulsory and should be executed only if you want to create your custom loader from scratch..</u></i></p>
          </div>

          <div className="mt-4">
            <p>
Copy folder
              <strong>`src/core/components/loader`</strong>
              {' '}
to
              <strong>`src/app/components/loader`</strong>
              {' '}
as a start
            </p>
            <p>A loader consists of typically 2 files only.</p>
            <ol>
              <li>loader.js</li>
              <li>loader.scss (optional)</li>
            </ol>
            <div className="alert alert-warning">
              Do not forget to edit loader.js and loader.scss to correct the import paths after copying them
            </div>
          </div>

          <div className="mt-4">
            <p>
Modify your config file at
              <strong>`src/config/classMap.js`</strong>
              {' '}
to include the loader from
              <strong>`src/app`</strong>
              {' '}
rather than using it from
              <strong>`src/core/components`</strong>
            </p>
            <Prism code={`// ... other imports
import Loader from "../app/components/loader"; // Make sure the path is correct
// ... other imports

// ...
export default {
  // ...
  "loader": Loader,
  // ...
};`}
            />
          </div>
          <p>Voila! Now you can play with your custom loader.</p>
        </section>
        <section>
          <header>
            <h2>Precautions</h2>
          </header>
          <p>While playing with custom loader, You need to make sure that you render children. Loader is a parent component to sub-rendered routes as shown below:</p>
          <Prism code={`//..
<RootComponent
  api={api}
  storage={storage}
  routes={routes}
>
  <Loader>
    <Switch>
      {_.map(currentRoutes, (route, i) => {
        return <RouteWithSubRoutes
          key={i}
          route={route}
          storage={storage}
          api={api}
        />;
      })}
    </Switch>
  </Loader>
</RootComponent>
//....`}
          />
          <p>So however you modify the loader do not forget to add the below code in render else you will notice none of your data is rendered:</p>
          <Prism code="{this.props.children}" />
        </section>
        <hr />
        <section className="mt-4">
          <header>
            <h2>Monitoring screen state change</h2>
          </header>
          <p>Loader should mainly listen to `screen.state` from redux via @connect</p>
          <Prism code={`@connect( state => {
  return {
    screenState: state.screen.state
  };
})`}
          />
          <p>Screen state consist of two main state.. "loading" & "loaded", accessible via SCREEN_STATE_LOADING. SCREEN_STATE_LOADED in `src/core/components/screen/action`. These states are used when a module bundle is loading or preLoad Promises are executed.</p>
          <p>Also as you see we show the loader as below:</p>
          <Prism code={`{
  this.props.screenState === SCREEN_STATE_LOADING &&
  (
    <div className={styles["loader-section"]}>
      <div className={styles["screen-loader"]} />
    </div>
  )
}`}
          />
          <p>You may customize the styles as you like or the content as per your needs.</p>
          <p>
Well this should give you a good start for modifying loaders. Will explain Transition component in "
            <Link to="/docs/page-transitions" animateSection="docs-content">Page Transition</Link>
" section
          </p>
        </section>
      </article>
    );
  }
}
