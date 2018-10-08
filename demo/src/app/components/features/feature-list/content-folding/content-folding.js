/**
 * Created by Yash Thakur
 * Date: 31/10/17
 * Time: 2:20 PM
 */

import React, { Component } from 'react';

import FoldImage from './images/fold.png';

export default class ContentFolding extends Component {
  render() {
    return (
      <article>
        <header>
          <h1 className="mt-4">Content Folding</h1>
          <hr />
        </header>
        <section>
          <section>
            <header>
              <h3 className="mt-4">What is a Fold?</h3>
            </header>
            <p>
              Back in the day when people bought newspapers off street-side stands,
              newspapers&nbsp;employed a technique called “the fold” to encourage buying.
            </p>
            <p>
              The basic idea is this: the most important and interesting news story of the day
              was plastered across the top of the section. So, if the paper was folded in half
              and placed so that only this big news story was above this fold, facing upwards,
              then the papers would be able to draw attention to the most important story.
              The story would thereby intrigue readers and coax&nbsp;a purchase.
            </p>
            <p>
              On a webpage, the
              {' '}
              <strong>fold</strong>
              {' '}
is the area of a page displayed to the user
              without them having to scroll. Based on a 1366x768 pixel screen resolution (a little
              more on this choice later), the area highlighted in red is generally how content is
              presented to users on a landing page (i.e. above the fold)
            </p>
            <p>
              <img src={FoldImage} alt="Content Folding Image" className="mw-100" />
            </p>
          </section>
          <hr />

          <section>
            <header>
              <h3 className="mt-4">Why is Above the Fold Important?</h3>
            </header>
            <p>
              Content placement and layout is important as the content that appears above the fold is
              first visible when the page is loaded by the user.
            </p>
            <p>
              The content that you place above the fold should be the content that is most important
              to achieve your business goals as it is the highest visible part. The content should
              present them with the content that they are looking for and immediately grab the user’s
              attention so that they don’t bounce and visit another site.
            </p>
          </section>
        </section>
      </article>
    );
  }
}
