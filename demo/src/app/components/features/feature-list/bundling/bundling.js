/**
 * Created by Yash Thakur
 * Date: 31/10/17
 * Time: 4:07 PM
 */

import React, { Component } from "react";

import WebpackImage from "./images/webpack.png";

export default class Bundling extends Component {
  render() {
    return (
      <article>
        <header>
          <h1 className="mt-4">Bundling</h1>
          <hr/>
        </header>
        <section>
          <h3 className="mt-4">Bundling using <strong>WebPack</strong></h3>
          <p>
            <img src={WebpackImage} alt="WebPack Image" className="mw-100" />
          </p>
          <p>
            Webpack is a module bundler that takes assets such as CSS, images or JavaScript
            files with lots of dependencies and turns them into something that you can provide
            to a client web page. It uses loaders that you specify in your configuration file
            to know how to transpile these assets. In our case, we want to transpile the JSX to
            JavaScript and ES6 code to browser-compliant ES5 code. We can do this by providing
            a JavaScript file as an entry point for Webpacks loader pipeline. Webpack will
            analyze this file and all of the subsequent dependencies used in your code to
            generate a bundle for you to include in your HTML. To tell Webpack about our React
            components, all we need to do is import those JavaScript files.
          </p>
        </section>
      </article>
    );
  }
}