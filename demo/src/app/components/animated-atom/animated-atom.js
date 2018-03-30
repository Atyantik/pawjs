import React from "react";
import * as styles from "./style.scss";

export default props => {
  return (
    <div className={`${styles["animated-atom"]} ${styles[props.size? props.size: "sm"]} ${props.className? props.className:""}`}>
      <div><div /></div>
      <div><div /></div>
      <div><div /></div>
      <div><div /></div>
    </div>
  );
};