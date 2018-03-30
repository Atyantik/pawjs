/**
 * Created by Yash Thakur
 * Date: 30/10/17
 * Time: 12:45 PM
 */

import React, { Component } from "react";

export default class UniversalRouting extends Component {
  render() {
    return (
      <article>
        <header>
          <h1 className="mt-4">Isomorphic/Universal Routing</h1>
          <hr/>
        </header>
        <section>
          <section>
            <header>
              <h3 className="mt-4">What is Universality?</h3>
            </header>
            <p>
              Universality, sometimes called “isomorphism”, refers to ability to run nearly the same code
              on both client and server – a concept that was born out of the trials and tribulations in
              the past of creating applications on the web, availability of new technologies,
              and the ever-growing complexity of developing and maintaining these applications.
            </p>
          </section>
          <hr/>

          <section>
            <header>
              <h3 className="mt-4">Reusing code with Universal Routing</h3>
            </header>
            <p>
              Suppose you create a web app in the latest technology i.e. React only to find that
              the user has to wait for the entire JS to be downloaded and rendered before the user
              can see anything in the browser window.
            </p>
            <p>
              React provides Server Side Rendering - SSR which can be used to generate HTML on
              the server and send the markup down on the initial request for faster page loads
              and to allow search engines to crawl your pages for SEO purposes.
            </p>
          </section>

        </section>
      </article>
    );
  }
}