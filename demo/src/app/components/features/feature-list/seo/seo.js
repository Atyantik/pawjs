/**
 * Created by Yash Thakur
 * Date: 31/10/17
 * Time: 3:20 PM
 */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class SEO extends Component {
  render() {
    return (
      <article>
        <header>
          <h1 className="mt-4">Search Engine Optimization - SEO</h1>
          <hr />
        </header>
        <section>
          <header>
            <h3 className="mt-4">What is Search Engine Optimization - SEO ?</h3>
          </header>
          <p>
            Search Engine Optimization (SEO) is the process of optimizing your website
            such that it is search engine friendly and increases the quantity and quality of
            organic traffic on the website.
          </p>
          <h3 className="mt-4">How does SEO work?</h3>
          <p>
            Here's how it works: The Search Engine has a crawler that goes out and gathers
            information about all the content they can find on the Internet. The crawlers
            bring all those 1s and 0s back to the search engine to build an index. That index
            is then fed through an algorithm that tries to match all that data with your query.
          </p>

          <div className="card mt-4">
            <Link
              to="/features/seo-search-engine-optimization/social-sharing"
              className="text-dark"
            >
              <div className="card-body">
                <h4 className="card-title">Social Sharing</h4>
                <p className="card-text">
                  Also known as Social Previews, allow you to choose the image, title,
                  and description that will display on social media platforms when you or
                  someone else shares your content.
                </p>
              </div>
            </Link>
          </div>

          <div className="card mt-4">
            <Link
              to="/features/seo-search-engine-optimization/ssr-server-side-rendering"
              className="text-dark"
            >
              <div className="card-body">
                <h4 className="card-title">Server side rendering</h4>
                <h6 className="card-subtitle mb-2 text-muted">Enabled in production mode</h6>
                <p className="card-text">
                  The best way to get your application SEO-ed is enable Server side rendering i.e.
                  Universal applications.
                </p>
              </div>
            </Link>
          </div>

          <div className="card mt-4">
            <Link
              to="/features/seo-search-engine-optimization/content-folding"
              className="text-dark"
            >
              <div className="card-body">
                <h4 className="card-title">Content Folding</h4>
                <h6 className="card-subtitle mb-2 text-muted">Enabled in production mode</h6>
                <p className="card-text">
                  We do not just worry about SEO. We provide tools to optimize SEO.
                  Show only relevant data when loading via server. Fold your content to save bytes.
                </p>
              </div>
            </Link>
          </div>
        </section>
      </article>
    );
  }
}
