import React from 'react';
// tslint:disable-next-line:no-submodule-imports
import BabelPolyfill from '@babel/polyfill/package.json';
import { metaKeys } from '../utils/seo';

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
  env?: any;
  preloadCssFiles: boolean;
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

const html = (props: React.PropsWithChildren<IHtmlProps> = {
  preloadedData: {},
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
}) => {
  const {
    preloadedData,
    env,
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
    noJS,
  } = props;

  const getPwaValue = (key: string, defaultValue = '') => {
    const { pwaSchema } = props;
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

  let loadingScript = '<>';
  const jsAssets: string [] = assets.filter(path => path.endsWith('.js'));
  if (!noJS) {
    if (env.react && env.react === 'cdn') {
      jsAssets.unshift(
        `https://unpkg.com/react@${React.version}/umd/react.production.min.js`,
        `https://unpkg.com/react-dom@${React.version}/umd/react-dom.production.min.js`,
      );
    }
    if (env.polyfill && env.polyfill === 'cdn') {
      jsAssets.unshift(
        `https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/${BabelPolyfill.version}/polyfill.min.js`,
      );
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
  /* tslint:disable */
  /* eslint-disable */
  return (
    <html lang={getPwaValue('lang')} dir={getPwaValue('dir')}>
      <head>
        <title>{`${getMetaValue('title').content}${process.env.APP_NAME ? ` | ${process.env.APP_NAME}` : ''}`}</title>
        {preloadCssFiles && <preload-css />}
        {cssFiles.map(path => (
          <link rel="stylesheet" type="text/css" key={path} href={path} />
        ))}
        {!noJS && (
          <script
            dangerouslySetInnerHTML={{
              __html: 'var loadPJS=function(e,a){var n=document.createElement("script");n.src=e,n.onload=a,n.onreadystatechange=a,document.body.appendChild(n)};var fnLoadPJS = function(e,a){return function() {return loadPJS(e,a)}};',
            }}
          />
        )}
        {!noJS && env.polyfill && env.polyfill === 'cdn' && (
          <link
            rel="dns-prefetch"
            href="//cdnjs.cloudflare.com/"
          />
        )}
        {!noJS && env.react && env.react === 'cdn' && (
          <link
            rel="dns-prefetch"
            href="//unpkg.com"
          />
        )}
        <link rel="manifest" href={`${appRootUrl}/manifest.json`} />
        {metaTags && metaTags.map(m => <meta key={JSON.stringify(m)} {...m} />)}
        {
          !noJS && preloadedData && (
            <script
              type="text/javascript"
              id="__pawjs_preloaded"
              dangerouslySetInnerHTML={{
                __html: `window.PAW_PRELOADED_DATA = ${JSON.stringify(b64EncodeUnicode(JSON.stringify(preloadedData)))};`,
              }}
            />
          )
        }
        {head}
      </head>
      <body>
        {Boolean(dangerouslySetInnerHTML && dangerouslySetInnerHTML.__html.length) && (
          <div id={clientRootElementId} dangerouslySetInnerHTML={dangerouslySetInnerHTML} />
        )}
        {!(dangerouslySetInnerHTML && dangerouslySetInnerHTML.__html.length) && (
          <div id={clientRootElementId}>{children || null}</div>
        )}
        {footer}
        <script
          dangerouslySetInnerHTML={{
            __html: `setTimeout(${loadingScript}, 400)`
          }}
        />
      </body>
    </html>
  );
};
export default html;