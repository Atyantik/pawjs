import React, { Component } from "react";
import { metaKeys } from "../utils/seo";
import PropTypes from "prop-types";

let toBase64;
// Base64 polyfill
if (typeof atob === "undefined" && typeof Buffer !== "undefined") {
  toBase64 = function (str) {
    if (!str) return str;
    return Buffer.from(str).toString("base64");
  };
} else if (typeof atob !== "undefined") {
  toBase64 = atob;
}


class Html extends Component {
  static propTypes = {
    metaTags: PropTypes.array,
    pwaSchema: PropTypes.object,
    cssFiles: PropTypes.array,
    preloadCssFiles: PropTypes.array,
    assets: PropTypes.array,
    head: PropTypes.array,
    footer: PropTypes.array,
    appRootUrl: PropTypes.string,
    clientRootElementId: PropTypes.string,
    dangerouslySetInnerHTML: PropTypes.shape({
      __html: PropTypes.string,
    })
  };
  
  static defaultProps = {
    metaTags: [],
    pwaSchema: {},
    cssFiles: [],
    preloadCssFiles: [],
    assets: [],
    head: [],
    footer: [],
    appRootUrl: "/",
    clientRootElementId: "app",
    dangerouslySetInnerHTML: {
      __html: ""
    }
  };
  
  getPwaValue(key, defaultValue = "") {
    if (typeof this.props.pwaSchema[key] !== "undefined") {
      return this.props.pwaSchema[key];
    }
    return defaultValue;
  }
  
  /**
   * Get meta tag after searching through meta tags
   * @param key
   * @param defaultValue
   * @returns {object}
   */
  getMetaValue(key, defaultValue = "") {
    let metaTag = {};
    this.props.metaTags.forEach(m => {
      if (Object.keys(metaTag).length) return;
      metaKeys.forEach(mKey => {
        if (m[mKey] && m[mKey] === key) {
          metaTag = Object.assign({}, m);
        }
      });
    });
    let handler = {
      get: function(target, name) {
        return name in target ? target[name] : defaultValue;
      }
    };
    return new Proxy(metaTag, handler);
  }
  
  /**
   * Render the code
   * @returns {*}
   */
  render() {
    const { preloadedData } = this.props;
    return (
      <html lang={this.getPwaValue("lang")} dir={this.getPwaValue("dir")}>
        <head>
          <title>{this.getMetaValue("title").content}</title>
          <link rel="manifest" href={`${this.props.appRootUrl}/manifest.json`} />
          {
            this.props.metaTags.map((m, i) => {
              return <meta key={`meta_${i}`} {...m} />;
            })
          }
          <script
            type="text/javascript"
            id="__pawjs_preloaded"
            dangerouslySetInnerHTML={{
              __html: `window.__preloaded_data = ${JSON.stringify(toBase64(JSON.stringify(preloadedData)))};`
            }}
          />
          {Boolean(this.props.preloadCssFiles.length) && (<preload-css />)}
          {
            this.props.cssFiles
              .map(path => <link rel="stylesheet" type="text/css" key={path} href={path} />)
          }
          {this.props.head}
        </head>
        <body>
          {
            Boolean(this.props.dangerouslySetInnerHTML.__html.length) && (
              <div id={this.props.clientRootElementId} dangerouslySetInnerHTML={this.props.dangerouslySetInnerHTML} />
            )
          }
          {
            !this.props.dangerouslySetInnerHTML.__html.length && (
              <div id={this.props.clientRootElementId}>{this.props.children || null}</div>
            )
          }
          {this.props.footer}
          {
            this.props.assets
              .filter(path => path.endsWith(".js"))
              .map(path => <script key={path} src={path} async={true} />)
          }
        </body>
      </html>
    );
  }
}

export default Html;