/**
 * Created by Yash Thakur
 * Date: 30/10/17
 * Time: 11:56 AM
 */

import React, { Component } from 'react';
import SocialCard from './images/social-card.png';

export default class SocialSharing extends Component {
  render() {
    return (
      <article>
        <header>
          <h1 className="mt-4">Social Sharing</h1>
          <hr />
        </header>
        <section>
          <section>
            <header>
              <h3 className="mt-4">What is Social Sharing ?</h3>
            </header>
            <p>
              Have you ever pasted a link into Facebook or Twitter to find
              that the associated image has nothing to do with the content of that page,
              or that the post description reads like:
            </p>
            <p>
              <img src={SocialCard} alt="Social Card" className="mw-100" />
            </p>
            <p>
              The above image is an example of social card. You can control the social media
              content your page generates through social meta tags.
              The title, description and image that automatically pops up when a user shares a
              link on many social networks can all be specified by the content publisher.
              When the social share content is optimized, the social media content looks good
              and is more likely to get a click.
            </p>
          </section>
          <hr />

          <section>
            <header>
              <h3 className="mt-4">How does it improve SEO?</h3>
            </header>
            <p>
              We strive to include social media metadata in all new pieces of content that we publish.
              This allows us to optimize for sharing
              {' '}
              <strong>Twitter</strong>
,
              {' '}
              <strong>Facebook</strong>
, and&nbsp;
              <strong>Google+</strong>
              {' '}
by defining exactly how titles,
              descriptions, images and more appear in social streams.
            </p>
            <p>
              Think of it as conversion rate optimization for social exposure.
            </p>
            <p>
              The implications for SEO are also significant. We know from experience and studies that the right data,
              including optimized images, helps content to spread, which often leads to increased links and mentions.
            </p>
          </section>

        </section>
      </article>
    );
  }
}
