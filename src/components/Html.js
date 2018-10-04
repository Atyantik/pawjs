import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { metaKeys } from '../utils/seo';

let toBase64;
// Base64 polyfill
if (typeof atob === 'undefined' && typeof Buffer !== 'undefined') {
  toBase64 = (str) => {
    if (!str) return str;
    return Buffer.from(str).toString('base64');
  };
} else if (typeof atob !== 'undefined') {
  toBase64 = atob;
}


class Html extends Component {
  static propTypes = {
    metaTags: PropTypes.shape([]),
    pwaSchema: PropTypes.shape({}),
    cssFiles: PropTypes.shape([]),
    preloadCssFiles: PropTypes.shape([]),
    assets: PropTypes.shape([]),
    head: PropTypes.shape([]),
    footer: PropTypes.shape([]),
    appRootUrl: PropTypes.string,
    clientRootElementId: PropTypes.string,
    dangerouslySetInnerHTML: PropTypes.shape({
      __html: PropTypes.string,
    }),
  };

  static defaultProps = {
    metaTags: [],
    pwaSchema: {},
    cssFiles: [],
    preloadCssFiles: [],
    assets: [],
    head: [],
    footer: [],
    appRootUrl: '/',
    clientRootElementId: 'app',
    dangerouslySetInnerHTML: {
      __html: '',
    },
  };

  getPwaValue(key, defaultValue = '') {
    const { pwaSchema } = this.props;
    if (typeof pwaSchema[key] !== 'undefined') {
      return pwaSchema[key];
    }
    return defaultValue;
  }

  /**
   * Get meta tag after searching through meta tags
   * @param key
   * @param defaultValue
   * @returns {object}
   */
  getMetaValue(key, defaultValue = '') {
    let metaTag = {};
    const { metaTags } = this.props;
    metaTags.forEach((m) => {
      if (Object.keys(metaTag).length) return;
      metaKeys.forEach((mKey) => {
        if (m[mKey] && m[mKey] === key) {
          metaTag = Object.assign({}, m);
        }
      });
    });
    const handler = {
      get(target, name) {
        return name in target ? target[name] : defaultValue;
      },
    };
    return new Proxy(metaTag, handler);
  }

  /**
   * Render the code
   * @returns {*}
   */
  render() {
    const {
      preloadedData,
      metaTags,
      appRootUrl,
      preloadCssFiles,
      cssFiles,
      head,
      dangerouslySetInnerHTML,
      clientRootElementId,
      children,
      footer,
      assets,
    } = this.props;
    return (
      <html lang={this.getPwaValue('lang')} dir={this.getPwaValue('dir')}>
        <head>
          <title>{this.getMetaValue('title').content}</title>
          <link rel="manifest" href={`${appRootUrl}/manifest.json`} />
          {
            metaTags.map(m => <meta key={JSON.stringify(m)} {...m} />)
          }
          <script
            type="text/javascript"
            id="__pawjs_preloaded"
            dangerouslySetInnerHTML={{
              __html: `window.PAW_PRELOADED_DATA = ${JSON.stringify(toBase64(JSON.stringify(preloadedData)))};`,
            }}
          />
          {Boolean(preloadCssFiles.length) && (<preload-css />)}
          {
            cssFiles
              .map(path => <link rel="stylesheet" type="text/css" key={path} href={path} />)
          }
          {head}
        </head>
        <body>
          {
            // eslint-disable-next-line
            Boolean(dangerouslySetInnerHTML.__html.length) && (
              <div id={clientRootElementId} dangerouslySetInnerHTML={dangerouslySetInnerHTML} />
            )
          }
          {
            // eslint-disable-next-line
            !dangerouslySetInnerHTML.__html.length && (
              <div id={clientRootElementId}>{children || null}</div>
            )
          }
          {footer}
          {
            assets
              .filter(path => path.endsWith('.js'))
              .map(path => <script key={path} src={path} async />)
          }
        </body>
      </html>
    );
  }
}

export default Html;
