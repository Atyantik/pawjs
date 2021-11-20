import React from 'react';
import serialize from 'serialize-javascript';
import { metaKeys } from '../utils/seo';

interface IHtmlProps {
  preloadedData?: any;
  metaTags?: any [];
  pwaSchema: any;
  cssFiles: any [];
  assets: string [];
  head?: any [];
  footer?: any [];
  appRootUrl: string;
  clientRootElementId: string;
  dangerouslySetInnerHTML?: {
    __html: string,
  };
  serverError?: React.ReactNode,
}

export default (props: React.PropsWithChildren<IHtmlProps> = {
  preloadedData: {},
  metaTags: [],
  pwaSchema: {},
  cssFiles: [],
  assets: [],
  head: [],
  footer: [],
  appRootUrl: '/',
  clientRootElementId: 'app',
  dangerouslySetInnerHTML: {
    __html: '',
  },
  serverError: null,
}) => {
  const {
    preloadedData,
    metaTags,
    appRootUrl,
    cssFiles,
    pwaSchema,
    head,
    dangerouslySetInnerHTML,
    clientRootElementId,
    children,
    footer,
    assets,
    serverError,
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
    if (!metaTitle) {
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
    <link rel="stylesheet" type="text/css" key={path} href={path} />
  ));
  const renderPreLoadedData = () => {
    if (!preloadedData) return null;
    const PAW_PRELOADED_DATA = serialize(preloadedData);
    if (PAW_PRELOADED_DATA.length > 200000) {
      // eslint-disable-next-line no-console
      console.warn('PRELOADED DATA is too lengthy to append to html');
      return null;
    }
    return (
      <script
        type="text/javascript"
        id="__pawjs_preloaded"
        dangerouslySetInnerHTML={{ __html: `window.PAW_PRELOADED_DATA = ${PAW_PRELOADED_DATA};` }}
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

  const jsAssets: string [] = assets.filter(path => (path.endsWith('.js') && path.indexOf('hot-update') === -1));

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
        {renderCSSFiles()}
        <link rel="manifest" href={`${appRootUrl}/manifest.json`} />
        {metaTags && metaTags.map(m => <meta key={JSON.stringify(m)} {...m} />)}
        {renderPreLoadedData()}
        {head}
      </head>
      <body className={getBodyClass()}>
        {serverError}
        {renderPreContent()}
        {renderContent()}
        {renderPostContent()}
        {jsAssets.map(js => (
          <script key={js} src={js} defer async />
        ))}
      </body>
    </html>
  );
};
