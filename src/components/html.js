import React, { Component } from "react";

class Html extends Component {
  render() {
    return (
      <html lang="en" dir="ltr">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
          <title>Page Title less than 55 characters</title>
          <meta name="description" content="Description of the page less than 150 characters" />
          <link rel="icon" type="image/x-icon" href="https://example.com/favicon.ico" />
          <link rel="icon" type="image/png" href="https://example.com/favicon.png" />

          {/* Apple Touch Icon atleast 200x200px */}
          <link rel="apple-touch-icon" href="/custom-icon.png" />

          {/* To run web application in full-screen */}
          <meta name="apple-mobile-web-app-capable" content="yes" />
          {/* Status Bar Style (see Supported Meta Tags below for available values) */}
          <meta name="apple-mobile-web-app-status-bar-style" content="black" />

          {/* Microsoft Tiles */}
          <meta name="msapplication-config" content="browserconfig.xml" />

          {/* Open graph meta */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://example.com/page.html" />
          <meta property="og:title" content="Content Title" />
          <meta property="og:image" content="https://example.com/image.jpg" />
          <meta property="og:description" content="Description Here" />
          <meta property="og:site_name" content="Site Name" />
          <meta property="og:locale" content="en_US" />

          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />

          {/* Twitter Card */}
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:site" content="@site_account" />
          <meta name="twitter:creator" content="@individual_account" />
          <meta name="twitter:url" content="https://example.com/page.html" />
          <meta name="twitter:title" content="Content Title" />
          <meta name="twitter:description" content="Content description less than 200 characters" />
          <meta name="twitter:image" content="https://example.com/image.jpg" />
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