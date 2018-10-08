/**
 * Created by Yash Thakur
 * Date: 30/10/17
 * Time: 4:46 PM
 */

import React, { Component } from 'react';

export default class Caching extends Component {
  render() {
    return (
      <article>
        <header>
          <h1 className="mt-4">Caching</h1>
          <hr />
        </header>
        <section>
          <section>
            <header>
              <h3 className="mt-4">What is Caching?</h3>
            </header>
            <p>
              <b>Caching</b>
              {' '}
is an area of a computer’s memory devoted to temporarily storing recently used
              information. The content, which includes HTML pages, images, files and Web objects, is
              stored on the local hard drive in order to make it faster for the user to access it,
              which helps improve the efficiency of the computer and its overall performance.
            </p>
            <p>
              Most caching occurs without the user knowing about it. For example, when a user
              returns to a Web page they have recently accessed, the browser can pull those files
              from the cache instead of the original server because it has stored the user’s activity.
              The storing of that information saves the user time by getting to it faster, and lessens
              the traffic on the network.
              <br />
            </p>
          </section>
          <hr />

          <section>
            <header>
              <h3 className="mt-4">What is Page Caching and how is it useful?</h3>
            </header>

            <p>
              Page caching is another method which can help you to improve the load time of your
              web pages and thus optimize your site for the search engines. Page load time can
              significantly impact your user experience and your site’s ability into convert visitors
              into buyers or into leads. In fact, experiments at Google have revealed that just a half
              second’s difference in load times can cause up to a 20% reduction in web traffic.
              For this reason, the search engine companies are considering page load time to be an
              increasingly important factor for determining your site’s rank in the search results.
              This means you’ll need to take measure in reducing the size of your image files and
              your pages as a part of your SEO strategy.
            </p>
            <p>
              Cached pages are served up as static HTML versions of a page in order to avoid
              potentially time-consuming queries to your database. Cached pages are created
              when search engine companies like Google store a “back-up” version of your
              page which can be served up to a user in place of the most recent version of your page.
              This is beneficial when serving the most recent version of a page requires
              accessing database information, which can take more time than serving up an
              already stored (cached) version of the page.
            </p>
          </section>
          <hr />

        </section>
      </article>
    );
  }
}
