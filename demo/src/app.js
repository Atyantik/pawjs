import React from "react";
import { hot } from "react-hot-loader";
import a from "./name";
import TestImage from "./test.png";
import GalaxyImage from "./galaxy.jpg";

import * as styles from "./index.scss";
const b = () => a + " Bodawala is a programmer....";



class App extends React.Component {
  render() {
    return (
      <div className={styles["row"]}>
        <div className={styles["column"]}>
          <img src={TestImage} />
          <img src={GalaxyImage} />
          {b()}
        </div>
      </div>
    );
  }
}

export default hot(module)(App);

if(module.hot) module.hot.accept();
