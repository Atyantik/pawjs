import ReduxClient from "../../packages/pawjs-redux/src/client";
import "./resources/css/style.scss";

export default class Client {
  constructor({addPlugin}) {

    const reduxClient = new ReduxClient();
    reduxClient.setReducers({
      counter: function(state = null) {
        return state;
      }
    });

    addPlugin(reduxClient);
  }
}