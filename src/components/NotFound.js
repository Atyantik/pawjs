import React from "react";
import Status from "./RouteStatus";
export default ({ location }) => (
  <Status code={404}>
    <div style={{textAlign: "center"}}>
      <h1>Page not found</h1>
      <h2 style={{color: "#666"}}>{location.pathname}</h2>
      <small>We could not found the above page</small>
    </div>
  </Status>
);