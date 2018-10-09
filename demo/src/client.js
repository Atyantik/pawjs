// import ReduxClient from "../../packages/pawjs-redux/src/client";
import './resources/css/style.scss';
import React from 'react';
import { Link } from 'react-router-dom';

export default class Client {
  // constructor({addPlugin}) {
  //
  //   // const reduxClient = new ReduxClient();
  //   // reduxClient.setReducers({
  //   //   counter: function(state = null) {
  //   //     return state;
  //   //   }
  //   // });
  //
  //   // addPlugin(reduxClient);
  // }
  apply(clientHandler) {
    clientHandler.hooks.renderRoutes.tap('AddShell', (AppRoutes) => {
      AppRoutes.setRenderedRoutes(
        <div>
          <Link to="/home">Home</Link>
          {AppRoutes.getRenderedRoutes()}
        </div>,
      );
    });
  }
}
