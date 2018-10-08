import React, { Component } from 'react';
import { processCode } from '../../utils/markdown';

export default class DocsPage extends Component {
  componentWillReceiveProps() {
    this.initPrism();
  }

  componentDidMount() {
    this.initPrism();
  }

  initPrism() {
    if (typeof window === 'undefined') return;
    if (!this.prism) {
      this.prism = require('prismjs');
    }
    this.prism.highlightAll();
  }

  render() {
    const data = this.props.preLoadedData;
    return (
      <article>
        <header>
          <h1 dangerouslySetInnerHTML={{ __html: data.title.rendered }} />
          <hr />
        </header>
        <section dangerouslySetInnerHTML={{
          __html: processCode(data.content.rendered),
        }}
        />
      </article>
    );
  }
}
