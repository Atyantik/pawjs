import React, { Component } from "react";
import { connect } from "react-redux";
import { SCREEN_STATE_LOADING } from "pawjs/src/components/screen/action";
import * as styles from "./loader.scss";
import Header from "../header";
import Footer from "../footer";
import Transition from "pawjs/src/components/transition";

export default @connect( state => {
  return {
    screenState: state.screen.state
  };
})
class Loader extends Component {
  render() {
    return (
      <div style={{ backgroundColor: "#f6f6f6"}}>
        <Header />
        {
          this.props.screenState === SCREEN_STATE_LOADING &&
          (
            <div className={styles["whole-page"]}>
              <div className={styles["thecube"]}>
                <div className={`${styles["cube"]} ${styles["c1"]}`} />
                <div className={`${styles["cube"]} ${styles["c2"]}`} />
                <div className={`${styles["cube"]} ${styles["c4"]}`} />
                <div className={`${styles["cube"]} ${styles["c3"]}`} />
              </div>
            </div>
          )
        }
        <Transition
          key="loader-transition"
          sectionName="page"
          className={styles["animator"]}
          onEnterClassName={styles["fade-in"]}
          onExitClassName={styles["fade-out"]}
        >
          {this.props.children || null}
        </Transition>
        <Footer />
      </div>
    );
  }
}
