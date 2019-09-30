import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BabelPolyfill from '@babel/polyfill/package.json';
import { metaKeys } from '../utils/seo';


let toBase64;
// Base64 polyfill
if (typeof atob === 'undefined' && typeof Buffer !== 'undefined') {
  toBase64 = (str) => {
    if (!str) return str;
    return Buffer.from(str, 'latin1').toString('base64');
  };
} else if (typeof atob !== 'undefined') {
  toBase64 = atob;
}

// first we use encodeURIComponent to get percent-encoded UTF-8,
// then we convert the percent encodings into raw bytes which
// can be fed into btoa.
const b64EncodeUnicode = str => toBase64(
  encodeURIComponent(str)
    .replace(
      /%([0-9A-F]{2})/g,
      (match, p1) => String.fromCharCode(`0x${p1}`),
    ),
);

class Html extends Component {
  static propTypes = {
    metaTags: PropTypes.arrayOf(PropTypes.shape({})),
    pwaSchema: PropTypes.shape({}),
    cssFiles: PropTypes.arrayOf(PropTypes.shape({})),
    env: PropTypes.shape({}),
    preloadCssFiles: PropTypes.bool,
    assets: PropTypes.arrayOf(PropTypes.string),
    head: PropTypes.arrayOf(PropTypes.any),
    footer: PropTypes.arrayOf(PropTypes.any),
    appRootUrl: PropTypes.string,
    clientRootElementId: PropTypes.string,
    dangerouslySetInnerHTML: PropTypes.shape({
      __html: PropTypes.string,
    }),
    noJS: PropTypes.bool,
  };

  static defaultProps = {
    metaTags: [],
    pwaSchema: {},
    env: {},
    cssFiles: [],
    preloadCssFiles: false,
    assets: [],
    head: [],
    footer: [],
    appRootUrl: '/',
    clientRootElementId: 'app',
    dangerouslySetInnerHTML: {
      __html: '',
    },
    noJS: false,
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
      // eslint-disable-next-line
      preloadedData,
      env,
      metaTags,
      appRootUrl,
      preloadCssFiles,
      cssFiles,
      head,
      dangerouslySetInnerHTML,
      clientRootElementId,
      // eslint-disable-next-line
      children,
      footer,
      assets,
      noJS,
    } = this.props;

    return (
      <html lang={this.getPwaValue('lang')} dir={this.getPwaValue('dir')}>
        <head>
          <title>{this.getMetaValue('title').content}</title>
          {preloadCssFiles && (<preload-css />)}
          {
            cssFiles
              .map(path => <link rel="stylesheet" type="text/css" key={path} href={path} />)
          }
          {env.polyfill && env.polyfill === 'cdn' && ([
            <link rel="dns-prefetch" key="dns-cdnjs-cloudflare-com" href="//cdnjs.cloudflare.com/" />,
            <script key="dns-cdnjs-cloudflare-com-babel-polyfill" defer src={`https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/${BabelPolyfill.version}/polyfill.min.js`} />,
          ])}
          {env.react && env.react === 'cdn' && ([
            <link rel="dns-prefetch" key="dns-unpkg-com" href="//unpkg.com" />,
            <script key="cdn-react-unpkg-com" defer crossOrigin="true" src={`https://unpkg.com/react@${React.version}/umd/react.production.min.js`} />,
            <script key="cdn-react-dom-unpkg-com" defer crossOrigin="true" src={`https://unpkg.com/react-dom@${React.version}/umd/react-dom.production.min.js`} />,
          ])}
          <link rel="manifest" href={`${appRootUrl}/manifest.json`} />
          {
            metaTags.map(m => <meta key={JSON.stringify(m)} {...m} />)
          }
          { !noJS && preloadedData && (
            <script
              type="text/javascript"
              id="__pawjs_preloaded"
              // eslint-disable-next-line
              dangerouslySetInnerHTML={{
                __html: `window.PAW_PRELOADED_DATA = ${JSON.stringify(b64EncodeUnicode(JSON.stringify(preloadedData)))};`,
              }}
            />
          ) }
          {head}
        </head>
        <body>
          {
            // eslint-disable-next-line
            Boolean(dangerouslySetInnerHTML.__html.length) && (
              // eslint-disable-next-line
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
            !noJS && assets
              .filter(path => path.endsWith('.js'))
              .map(path => <script defer key={path} src={path} />)
          }
        </body>
      </html>
    );
  }
}

export default Html;
