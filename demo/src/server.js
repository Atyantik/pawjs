// import ReduxServer from "../../packages/pawjs-redux/src/server";
import React from 'react';
import { Link } from 'react-router-dom';

import FirebaseServer from "../../packages/pawjs-firebase/src/server";
import FirebaseOptions from "../firebase.json";
import FirebaseServiceAccountDetails from "../serviceAccount.json";

new FirebaseServer(FirebaseOptions, FirebaseServiceAccountDetails);


export default class Server {
  apply(serverHandler) {
    serverHandler.hooks.renderRoutes.tapPromise('AddShell', async (AppRoutes) => {
      return AppRoutes.setRenderedRoutes(
        <div>
          <Link to="/home">Home</Link>
          {AppRoutes.getRenderedRoutes()}
        </div>,
      );
    });
  // serverHandler
  //   .hooks
  //   .reduxInitialState
  //   .tapPromise("AppInitialState", async (reduxState) => {
  //     reduxState.setInitialState({
  //       counter: 1
  //     });
  //   });
  }
}
