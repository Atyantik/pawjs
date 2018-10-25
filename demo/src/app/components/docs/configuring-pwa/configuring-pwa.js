import React, { Component } from 'react';
import Prism from '../../prism/prism';

export default class Docs extends Component {
  render() {
    return (
      <article>
        <header>
          <h1>Configuring PWA</h1>
          <hr />
        </header>
        <section>
          <header>
            <h2>Web App Manifest</h2>
          </header>
          <div>
            <p>
              The web app manifest provides information about an application (such as name, author, icon, and description) in a JSON text file.
              The purpose of the manifest is to install web applications to the homescreen of a device, providing users with quicker access and
              a richer experience.
              <br />
              Web app manifest are part of Progressive Web Applications
            </p>
            <p>
              Below is an example manifest.json file.
            </p>
            <Prism code={`{
	"name": "React PWA",
	"short_name": "ReactPWA",
	"dir": "ltr",
	"lang": "en-US",
	"orientation": "any",
	"start_url": "/",
	"background_color": "#17a2b8",
	"theme_color": "#17a2b8",
	"display": "standalone",
	"description": "A highly scalable, Progressive Web Application foundation with the best Developer Experience.",
	"icons": [{
		"src": "/build/images/resources/images/pwa/ec1fa5f40405b10b364c2ee8e6eeffce.png",
		"sizes": "72x72"
	}, {
		"src": "/build/images/resources/images/pwa/3f9898f6af26a26506fd2108a89a7eb1.png",
		"sizes": "96x96"
	}, {
		"src": "/build/images/resources/images/pwa/6fbcdbb3daf975a48ae2c9beaae06377.png",
		"sizes": "128x128"
	}, {
		"src": "/build/images/resources/images/pwa/f4d19f8b22528eb9c178eb8815727b13.png",
		"sizes": "144x144"
	}, {
		"src": "/build/images/resources/images/pwa/32ec86bcd8f6ee28451a4d76d53a7002.png",
		"sizes": "152x152"
	}, {
		"src": "/build/images/resources/images/pwa/715d8373bad8c370c2922f09e90f4224.png",
		"sizes": "192x192"
	}, {
		"src": "/build/images/resources/images/pwa/2fe409d86d099f7eb0f88d35abf1013a.png",
		"sizes": "384x384"
	}, {
		"src": "/build/images/resources/images/pwa/3a8136a792cfe525ff82f7488883fa1d.png",
		"sizes": "512x512"
	}]
}`}
            />
          </div>

          <div className="mt-4">
            <p>This can be easily managed by configuring few settings and adding appropriate images in resources. Let start with simple configuration:</p>
            <p>1) Open file `src/config/config.js` and edit the following section: </p>
            <Prism
              code={`export default {
  // ...
  pwa: {
    "name": "React PWA",
    "short_name": "ReactPWA",
    // Possible values ltr(left to right)/rtl(right to left)
    "dir": "ltr",
    
    // language: Default en-US
    "lang": "en-US",
    
    // Orientation of web-app possible:
    // any, natural, landscape, landscape-primary, landscape-secondary, portrait, portrait-primary, portrait-secondary
    "orientation": "any",
    
    "start_url": "/",
    // Background color of the application
    "background_color": "#17a2b8",
    
    // Theme color, used to modify the status bar color etc
    "theme_color": "#17a2b8",
    
    "display": "standalone",
    "description": "A highly scalable, Progressive Web Application foundation with the best Developer Experience."
  },
  // ...
};`}
            />
            <div className="alert alert-danger">
              Do not copy paste the above code to `src/config/config.js`. We just need to update the
              {' '}
              <strong>pwa</strong>
              {' '}
section.
              Modify it with your app details.
            </div>
            More details about Web App Manifest can be found at
            {' '}
            <a href="https://developer.mozilla.org/en-US/docs/Web/Manifest" target="_blank" rel="nofollow noopener">https://developer.mozilla.org/en-US/docs/Web/Manifest</a>
          </div>
        </section>

        <hr />
        <section className="mt-4">
          <header>
            <h2>App Icons</h2>
          </header>
          <div>
            <p>
              In the above section we didn't included icons like:
            </p>
            <Prism code={`"icons": [
    // ...
    {
		"src": "/build/images/resources/images/pwa/ec1fa5f40405b10b364c2ee8e6eeffce.png",
		"sizes": "72x72"
	}, {
		"src": "/build/images/resources/images/pwa/3f9898f6af26a26506fd2108a89a7eb1.png",
		"sizes": "96x96"
	}
	//...
]`}
            />
            <p>
              The reason we didn't included then is because we are including the Images directly from `src/resources/images/pwa` and it is mandatory to use the same naming convention:
            </p>
            <Prism
              code="icon-72x72.png
icon-96x96.png
icon-128x128.png
icon-144x144.png
icon-152x152.png
icon-192x192.png
icon-384x384.png
icon-512x512.png
"
              language="text"
            />
            <p>
              Create and replace files in `src/resources/images/pwa` folder with your own application logo-images making sure you have all the above sizes included or the application won't work as expected.
            </p>
          </div>
        </section>
        <p>That is all folks. Pretty easy huh?!</p>
      </article>
    );
  }
}
