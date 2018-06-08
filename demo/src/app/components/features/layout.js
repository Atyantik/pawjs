/**
 * Created by Yash Thakur
 * Date: 27/10/17
 * Time: 4:50 PM
 */

import React, { Component } from "react";
import Disqus from "../disqus";
import SidebarLinks from "./sidebar-links";
import SidebarNav from "../sidebar-nav";
import {renderRoutes} from "react-router-config";

export default class FeaturesLayout extends Component {
  render() {
    return (
      <div className="container">
        <div className="row">
          <SidebarNav className={"col-lg-3 p-2 mt-2"}>
            <SidebarLinks/>
            <p>We are busy writing documentation for the boilerplate. Thank you for your patience.</p>
            <div className="alert alert-warning mt-2">We are looking for contributors and queries to create useful documentation. Please contribute.</div>
          </SidebarNav>
          <div  className="col col-lg-9">
            <div className="mt-4">
              {renderRoutes(this.props.route.routes)}
            </div>
            <div className="alert alert-warning mt-5">We are looking for contributors and queries to create useful documentation. Please contribute.</div>
            <div className="mt-4">
              <Disqus />
            </div>
          </div>
        </div>
      </div>
    );
  }
}