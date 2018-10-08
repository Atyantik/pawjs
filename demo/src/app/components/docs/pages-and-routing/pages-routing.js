/**
 * Created by Yash Thakur
 * Date: 1/11/17
 * Time: 2:39 PM
 */

import React, { Component } from 'react';
import Link from 'pawjs/src/components/link/link';
import Prism from '../../prism/prism';

export default class PagesAndRouting extends Component {
  render() {
    return (
      <article>
        <header>
          <h1>Pages and Routing</h1>
          <hr />
        </header>
        <section>

          <section>
            <header>
              <h3 className="mt-4">Options for Routes in a Page</h3>
              <p>
                We are using the&nbsp;
                <a
                  href="https://reacttraining.com/react-router/web/guides/philosophy"
                  target="_blank"
                  rel="nofollow noopener"
                >
                  React-Router
                </a>
                {' '}
what additionally we provide is mentioned below:
              </p>
              <div className="mw-100">
                <table className="w-100 table">
                  <thead className="thead-dark">
                    <tr className="font-weight-bold">
                      <th scope="col" className="bg-dark text-white">Option</th>
                      <th scope="col" className="bg-dark text-white">Value</th>
                      <th scope="col" className="bg-dark text-white">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>preloadData</td>
                      <td>function</td>
                      <td>This option is used to fetch data from api and pass it to component.</td>
                    </tr>
                    <tr>
                      <td>layout</td>
                      <td>component</td>
                      <td>You can define the layout of a page (Eg: Header, Footer)</td>
                    </tr>
                    <tr>
                      <td>props</td>
                      <td>object</td>
                      <td>You can define the custom props to be passed to the component here.</td>
                    </tr>
                    <tr>
                      <td>seo</td>
                      <td>object</td>
                      <td>
You define the parameters for SEO in this option.
                        <br />
Eg:
                        <Prism
                          code={`seo: {
  title: "Name",
  description: "Your custom description here",
  keywords: "multiple,keywords,comma-separated",
  type: "article",
  image: "url to the image file"
}`
                          }
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>caching</td>
                      <td>object</td>
                      <td>
It defines the amount of time for which the page should be cached in the browser.
                        <br />
Eg:
                        <Prism
                          code={'cache: { enable: true, duration: 10000 }'}
                        />
                      </td>
                    </tr>
                  </tbody>

                </table>
              </div>
            </header>
          </section>
          <hr />

          <section>
            <header>
              <h3 className="mt-4">Cases</h3>
            </header>
            <div>
              <div className="card mt-4">
                <Link
                  animateSection="docs-content"
                  to="/docs/pages-routing/create-new-page"
                  className="text-dark"
                >
                  <div className="card-body">
                    <h4 className="card-title">Create a Simple Page with Routes</h4>
                    <p className="card-text">
                      Create a simple page with "Hello World" text.
                    </p>
                  </div>
                </Link>
              </div>

              <div className="card mt-4">
                <Link
                  animateSection="docs-content"
                  to="/docs/pages-routing/page-with-subroutes"
                  className="text-dark"
                >
                  <div className="card-body">
                    <h4 className="card-title">Create a Page with Sub-Routes</h4>
                    <p className="card-text">
                      Create pages such that a component/function remains common in both the pages.
                    </p>
                  </div>
                </Link>
              </div>

              <div className="card mt-4">
                <Link
                  animateSection="docs-content"
                  to="/docs/pages-routing/page-with-layout"
                  className="text-dark"
                >
                  <div className="card-body">
                    <h4 className="card-title">Create a Page with Layout</h4>
                    <p className="card-text">
                      Create pages with Header and Footer.
                    </p>
                  </div>
                </Link>
              </div>

            </div>
          </section>

        </section>
      </article>
    );
  }
}
