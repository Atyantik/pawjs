import React, { Component } from "react";

class Html extends Component {
  render() {
    const { preloadedData } = this.props;
    return (
      <html lang="en" dir="ltr">
        <head>
          {
            this.props.meta.map((m, i) => {
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
            this.props.css &&
            this.props.css
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