/**
 * Created by Yash Thakur
 * Date: 30/10/17
 * Time: 11:56 AM
 */

import React, { Component } from "react";

import SSRImage from "./images/ssr.png";
import CSRImage from "./images/csr.png";

export default class SSR extends Component {
  render() {
    return (
      <article>
        <header>
          <h1 className="mt-4">Server Side Rendering - SSR</h1>
          <hr/>
        </header>
        <section>
          <section>
            <header>
              <h3>What is Server Side Rendering - SSR ?</h3>
            </header>
            <p>
              The most common use case for server-side rendering is to handle
              the initial render when a user (or search engine crawler) first requests our app.
              When the server receives the request, it renders the required component(s) into an
              HTML string, and then sends it as a response to the client. From that point on,
              the client takes over rendering duties.
            </p>
          </section>
          <hr/>

          <section>
            <header>
              <h3 className="mt-4">How is Server Side Rendering beneficial?</h3>
            </header>
            <p>
              We are using server side rendering for mainly two reasons:
            </p>
            <ul>
              <li>Performance benefit for our users</li>
              <li>Consistent SEO performance</li>
            </ul>
            <p>
              Here is a very simple timeline diagram(super simple)to showcase the difference between SSR and CSR.
            </p>
            <h3 className="mt-4 text-center">SSR</h3>
            <div className="mw-100 text-center">
              <img
                src={SSRImage}
                alt="SSR Image"
                className="mw-100"
              />
            </div>
            <h3 className="mt-4 text-center">CSR</h3>
            <div className="mw-100 text-center">
              <img
                src={CSRImage}
                alt="CSR Image"
                className="mw-100"
              />
            </div>
            <p className="mt-4">
              The difference here is that for SSR the response of the server is the HTML page that is ready to
              be rendered, while the CSR sends the JS files to the browser with empty documents which will then
              be downloaded and executed by the browser after which the HTML view will be ready.
              In both cases, React will need to be downloaded and go through the same process of building a virtual
              dom and attaching events to make the page interactive — but for SSR, the user can start viewing
              the page while all of that is happening. For the CSR world, you need to wait for all of the above
              to happen and then have the virtual dom moved to the browser dom for the page to be viewable.
            </p>
          </section>

        </section>
      </article>
    );
  }
}