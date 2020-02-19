import React from 'react';
import BabelPolyfill from '@babel/polyfill/package.json';
import { metaKeys } from '../utils/seo';

/**
 * CDN Packages for ReactJS and PolyfillJS
 */
const reactCDN = [
  `https://unpkg.com/react@${React.version}/umd/react.production.min.js`,
  `https://unpkg.com/react-dom@${React.version}/umd/react-dom.production.min.js`,
];
const polyfillVer = BabelPolyfill.version > '7.6.0' ? '7.6.0' : BabelPolyfill.version;
const polyfillCDN = [
  `https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/${polyfillVer}/polyfill.min.js`,
];

/**
 * toBase64: atob polyfill with Buffer
 */
let toBase64: (arg0: string) => string;
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
const b64EncodeUnicode = (str: string) => toBase64(
  encodeURIComponent(str)
    .replace(
      /%([0-9A-F]{2})/g,
      (match, p1) => String.fromCharCode(parseInt(`0x${p1}`, 16)),
    ),
);

interface IHtmlProps {
  preloadedData?: any;
  metaTags?: any [];
  pwaSchema: any;
  cssFiles: any [];
  jsToBePreloaded?: any[];
  env?: any;
  assets: string [];
  head?: any [];
  footer?: any [];
  appRootUrl: string;
  clientRootElementId: string;
  dangerouslySetInnerHTML?: {
    __html: string,
  };
  noJS: boolean;
}

export default (props: React.PropsWithChildren<IHtmlProps> = {
  preloadedData: {},
  metaTags: [],
  pwaSchema: {},
  env: {},
  cssFiles: [],
  jsToBePreloaded: [],
  assets: [],
  head: [],
  footer: [],
  appRootUrl: '/',
  clientRootElementId: 'app',
  dangerouslySetInnerHTML: {
    __html: '',
  },
  noJS: false,
}) => {
  const {
    preloadedData,
    env,
    metaTags,
    appRootUrl,
    cssFiles,
    jsToBePreloaded,
    pwaSchema,
    head,
    dangerouslySetInnerHTML,
    clientRootElementId,
    children,
    footer,
    assets,
    noJS,
  } = props;

  const getPwaValue = (key: string, defaultValue = '') => {
    if (typeof pwaSchema[key] !== 'undefined') {
      return pwaSchema[key];
    }
    return defaultValue;
  };

  /**
   * Get meta tag after searching through meta tags
   * @param key
   * @param defaultValue
   * @returns {object}
   */
  const getMetaValue = (key: string, defaultValue: any = '') => {
    let metaTag = {};
    if (!metaTags) return defaultValue;
    metaTags.forEach((m) => {
      if (Object.keys(metaTag).length) return;
      metaKeys.forEach((mKey) => {
        if (m[mKey] && m[mKey] === key) {
          metaTag = { ...m };
        }
      });
    });
    const handler = {
      get(target: any, name: string) {
        return name in target ? target[name] : defaultValue;
      },
    };
    return new Proxy(metaTag, handler);
  };

  /**
   * Get page title
   * @returns string
   */
  const getTitle = () => {
    const appName = process.env.APP_NAME || '';
    const titleSeparator = process.env.PAGE_TITLE_SEPARATOR || '|';
    const metaTitle = getMetaValue('title').content;
    if (!appName) {
      return metaTitle;
    }
    if (metaTitle === appName) {
      return metaTitle;
    }
    if (!metaTitle && appName) {
      return appName;
    }
    return `${metaTitle} ${titleSeparator} ${appName}`;
  };
  const getHtmlClass = () => '';
  const getBodyClass = () => '';
  /**
   * Render components above the content root
   * Can be used for rendering script tags such as google tag manager
   */
  const renderPreContent = () => null;
  /**
   * Render components below the content root, mostly used to include
   * something before the main inclusion of javascript files and after the content
   */
  const renderPostContent = () => footer;

  /**
   * Render CSS Files
   */
  const renderCSSFiles = () => cssFiles.map(path => (
    (
      <link rel="stylesheet" type="text/css" key={path} href={path} />
    )
  ));
  /**
   * loadPJS is a function that loads the javascript file and call the callback function
   * Format of loadPJS = (js-path, callback)
   */
  const renderJSLoader = () => {
    if (noJS) {
      return null;
    }
    return (
      <script
        dangerouslySetInnerHTML={{ __html: 'var loadPJS=function(e,a){var n=document.createElement("script");n.src=e,n.onload=a,n.onreadystatechange=a,document.body.appendChild(n)};var fnLoadPJS = function(e,a){return function() {return loadPJS(e,a)}};' }}
      />
    );
  };
  const renderDNSPrefetch = () => {
    if (noJS) return null;
    const prefetchArray = [];
    if (env.polyfill && env.polyfill === 'cdn') {
      prefetchArray.push((
        <link
          rel="dns-prefetch"
          href="//cdnjs.cloudflare.com/"
          key="cdnjs-cloudflare-dns-prefetch"
        />
      ));
    }
    if (env.react && env.react === 'cdn') {
      prefetchArray.push((
        <link
          rel="dns-prefetch"
          href="//unpkg.com"
          key="unpkg-dns-prefetch"
        />
      ));
    }
    return prefetchArray;
  };
  const renderPreLoadedData = () => {
    if (noJS || !preloadedData) return null;
    const PAW_PRELOADED_DATA = JSON.stringify(b64EncodeUnicode(JSON.stringify(preloadedData)));
    return (
      <script
        type="text/javascript"
        id="__pawjs_preloaded"
        dangerouslySetInnerHTML={{ __html: `window.PAW_PRELOADED_DATA = ${PAW_PRELOADED_DATA};` }}
      />
    );
  };
  const renderJsToBePreloaded = () => {
    if (noJS || !jsToBePreloaded || !jsToBePreloaded.length) return null;
    const PAW_PRELOAD_JS = JSON.stringify(b64EncodeUnicode(JSON.stringify(jsToBePreloaded)));
    return (
      <script
        type="text/javascript"
        id="__pawjs_preload_js"
        dangerouslySetInnerHTML={{ __html: `window.PAW_PRELOAD_JS = ${PAW_PRELOAD_JS};` }}
      />
    );
  };

  /**
   * Render the content inside body and the client root element
   */
  const renderContent = () => {
    // eslint-disable-next-line no-underscore-dangle
    if (dangerouslySetInnerHTML && dangerouslySetInnerHTML.__html.length) {
      return (
        <div id={clientRootElementId} dangerouslySetInnerHTML={dangerouslySetInnerHTML} />
      );
    }
    // eslint-disable-next-line no-underscore-dangle
    if (!(dangerouslySetInnerHTML && dangerouslySetInnerHTML.__html.length)) {
      return (
        <div id={clientRootElementId}>{children || null}</div>
      );
    }
    return null;
  };

  let loadingScript = '<>';
  const jsAssets: string [] = assets.filter(path => path.endsWith('.js'));
  if (!noJS) {
    if (env.react && env.react === 'cdn') {
      jsAssets.unshift(...reactCDN);
    }
    if (env.polyfill && env.polyfill === 'cdn') {
      jsAssets.unshift(...polyfillCDN);
    }
    jsAssets
      .forEach((path: string) => {
        loadingScript = loadingScript.replace(
          '<>',
          `fnLoadPJS(${JSON.stringify(path)}, <>)`,
        );
      });
  }
  loadingScript = loadingScript.replace('<>', 'function(){}');

  /**
   * Render the code
   * @returns {*}
   */
  return (
    <html
      lang={getPwaValue('lang')}
      dir={getPwaValue('dir')}
      className={`${getHtmlClass()}`}
    >
      <head>
        <title>{getTitle()}</title>
        {env.asyncCSS && <preload-css />}
        {renderCSSFiles()}
        {renderJSLoader()}
        {renderDNSPrefetch()}
        <link rel="manifest" href={`${appRootUrl}/manifest.json`} />
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        {metaTags && metaTags.map(m => <meta key={JSON.stringify(m)} {...m} />)}
        {renderPreLoadedData()}
        {head}
      </head>
      <body className={getBodyClass()}>
        {renderPreContent()}
        {renderContent()}
        {renderPostContent()}
        {renderJsToBePreloaded()}
        {/* tslint:disable-next-line */}
        {
          !process.env.asyncJS && jsAssets.map(path => <script key={path} src={path} />)
        }
        {/* tslint:disable-next-line */}
        {
          process.env.asyncJS && (
            <script dangerouslySetInnerHTML={{ __html: `setTimeout(function(){ ${loadingScript}() }, 1);` }} />
          )
        }
      </body>
    </html>
  );
};
