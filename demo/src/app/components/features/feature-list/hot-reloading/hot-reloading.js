/**
 * Created by Yash Thakur
 * Date: 28/10/17
 * Time: 3:20 PM
 */

import React, { Component } from "react";
import HMR from "./images/hmr-architecture.png";

export default class HotReloading extends Component {
  render() {
    return (
      <article>
        <header>
          <h1 className="mt-4">Hot Reloading</h1>
          <hr/>
        </header>
        <section>
          <section>
            <header>
              <h3>What is Hot Reloading?</h3>
            </header>
            <p>
              <span className="font-weight-bold">Hot reloading</span> only refreshes the files that were changed without losing the state of the app.
              For example, if you were four links deep into your navigation and saved a change to some styling,
              the state would not change, but the new styles would appear on the page without having to navigate back to the page you are on because you would still be on the same page.
            </p>
          </section>
          <hr/>

          <section>
            <header>
              <h3 className="mt-4">How does it work?</h3>
            </header>
            <p>
              Hot Reloading is built on top of a feature <a href="https://webpack.github.io/docs/hot-module-replacement-with-webpack.html" target="_blank" rel="nofollow noopener">
              Hot Module Replacement</a>, or HMR.
              It was first introduced by Webpack and we implemented it inside of React Native Packager.
              HMR makes the Packager watch for file changes and send HMR updates to a thin HMR runtime included on the app.
            </p>
            <p>
              In a nutshell, the HMR update contains the new code of the JS modules that changed.
              When the runtime receives them, it replaces the old modules' code with the new one:
            </p>
            <p>
              <img src={HMR} className="mw-100"/>
            </p>
          </section>

        </section>
      </article>
    );
  }
}