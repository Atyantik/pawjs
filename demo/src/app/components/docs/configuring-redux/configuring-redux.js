/**
 * Created by Yash Thakur
 * Date: 21/12/17
 * Time: 3:38 PM
 */

import React, { Component } from "react";
import Prism from "../../prism/prism";

export default class ConfiguringRedux extends Component {

  render() {
    return(
      <article>
        <header>
          <h1>Configuring Redux</h1>
          <hr />
        </header>
        <section>
          <header>
            <h2>Creating an action and a reducer</h2>
          </header>
          <p>
            Here we will take an example of Increment counter.
          </p>
          <p>
            Create a reducer <strong>`src/app/components/counter/reducer.js`</strong>
          </p>
          <Prism code={`import _ from "lodash";

const initialState = {
  count: 0,
};

export const INCREMENT_COUNT = "INCREMENT_COUNT";
export const DECREMENT_COUNT = "DECREMENT_COUNT";

export const counter = (state = initialState, action) => {
switch (action.type) {
  case INCREMENT_COUNT:
    return _.assignIn({}, state, {
      Count: ++initialState.Count,
    });
  case DECREMENT_COUNT:
    return _.assignIn({}, state, {
      Count: --initialState.Count,
    });
  default:
    return state;
}
};`}/><br/>
          <p>
            Create an action for the same reducer <strong>`src/app/components/counter/action.js`</strong>
          </p>
          <Prism code={`import { INCREMENT_COUNT, DECREMENT_COUNT } from "./reducer";

export const incrementCounter = () => {
  return {
    type: INCREMENT_COUNT,
  };
};
export const decrementCounter = () => {
  return {
    type: DECREMENT_COUNT,
  };
};`}/>
        </section>
        <hr/>
        <section>
          <header>
            <h2>Exporting reducers</h2>
          </header>
          <p>
            Create a file reducers.js. i.e. <strong>`src/app/reducers.js`</strong>
          </p>
          <Prism code={`//export all the reducers using this file
export * from "./components/counter/reducer";
`}/>
        </section>
        <hr/>
        <section>
          <header>
            <h2>
              Export appReducers to client.js and server.js
            </h2>
            <p>Import the appReducers from app and export from client.js</p>
            <Prism code={`// ...other imports
import * as appReducers from "./app/reducers";

// ...
export const reduxReducers = appReducers;
// ...
`}/><br/>
            <p>Import the appReducers from app and export from server.js</p>
            <Prism code={`// ...other imports
import * as appReducers from "./app/reducers";

// ...
/**
 * --- Your custom code START ---
 */
app.use((req, res, next) => {
  res.locals.reduxReducers = appReducers;
  next();
});

/**
 * --- Your custom code END ---
 */
 // ...
`}/>

          </header>
        </section>
        <hr/>
        <section>
          <h2>Configuring Redux InitialState</h2>
          <p>
            Suppose in the example above, We want to start the counter from '5' instead of '0'.
            Hence to do it you can set the initial state for the redux store.
          </p>
          <p>You can set reduxInitialState for <strong>client.js</strong></p>
          <Prism code={`// ...other imports

// ...
export const reduxInitialState = {
  // Set your initial state here.
  counter: {
    count: 5,
  }
}
// ...
`}/><br/>
          <p>Set the same initialState for <strong>server.js</strong></p>
          <Prism code={`// ...other imports

// ...
/**
 * --- Your custom code START ---
 */
app.use((req, res, next) => {
  res.locals.reduxInitialState = {
  //your reduxInitialState here
  counter: {
    count: 5,
  }
  };
  next();
});

/**
 * --- Your custom code END ---
 */
 // ...
`}/>
        </section>
      </article>
    );
  }
}