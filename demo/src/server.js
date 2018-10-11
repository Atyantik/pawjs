// import ReduxServer from "../../packages/pawjs-redux/src/server";
import React from 'react';
import { Link } from 'react-router-dom';

export default class Server {
  // constructor({addPlugin}) {
  //
  //   // const reduxServer = new ReduxServer();
  //   // reduxServer.setReducers({
  //   //   counter: function(state = null) {
  //   //     return state;
  //   //   }
  //   // });
  //   //
  //   // addPlugin(reduxServer);
  // }
  //
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
