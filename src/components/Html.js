import React, { Component } from "react";
import { metaKeys } from "../utils/seo";
import PropTypes from "prop-types";

class Html extends Component {
  static propTypes = {
    metaTags: PropTypes.array,
    pwaSchema: PropTypes.object,
    cssFiles: PropTypes.array,
    assets: PropTypes.array
  };

  static defaultProps = {
    metaTags: [],
    pwaSchema: {},
    cssFiles: [],
    assets: [],
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
          {
            this.props.metaTags.map((m, i) => {
              return <meta key={`meta_${i}`} {...m} />;
            })
          }
          <script
            type="text/javascript"
            id="__pawjs_preloaded"
            dangerouslySetInnerHTML={{
              __html: `window.__preloaded_data = ${JSON.stringify(preloadedData)};`
            }}
          />
          {
            this.props.cssFiles
              .map(path => <link rel="stylesheet" type="text/css" key={path} href={path} async={true} />)
          }
        </head>
        <body>
          <div id="app">{this.props.children}</div>
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