/**
 * Created by Yash Thakur
 * Date: 27/10/17
 * Time: 5:49 PM
 */

import React, { Component } from "react";

import PWAImage from "./images/pwa.gif";
import TwitterLogo from "./images/twitter-logo.png";
import WPLogo from "./images/WP-Logo.png";
import FlipboardLogo from "./images/Flipboard-Logo.png";
import PaperPlanesLogo from "./images/PaperPlanes-Logo.png";

export default class PWA extends Component {
  render() {
    return (
      <article>
        <header>
          <h1 className="mt-4">PWA - Progressive Web Application</h1>
          <hr/>
        </header>
        <section>
          <div className="text-center">
            <img src={PWAImage} alt="Progressive Web Application" className="mw-100 m-auto"/>
          </div>
          <section>
            <div>
              <header>
                <h3 className="mt-4">What is PWA?</h3>
              </header>
              <p>
                <span className="font-italic font-weight-bold">The web…but better</span><br/>
                A Progressive Web App (PWA) is a web app that uses modern web capabilities to deliver an app-like experience to users.
                These apps meet certain requirements (see below), are deployed to servers, accessible through URLs, and indexed by search engines.
              </p>
            </div>
            <div>
              <h3 className="mt-5 h5">Progressive Web Apps are:</h3>
              <dl>
                <dt>Progressive </dt>
                <dd>
                  They are built with progressive enhancement as the core principle and it works for every
                  user regardless of the browser used by the user.
                </dd>

                <dt>Responsive</dt>
                <dd>
                  Fits to whatever size of screen it is, whether it is desktop, tablet, mobile device or any future gadget.
                </dd>

                <dt>Connectivity Independent</dt>
                <dd>
                  Capable of working offline and slow internet networks.
                </dd>

                <dt>App-like</dt>
                <dd>
                  Utilizes the app-shell model which provides app-style navigations and interactions.
                </dd>

                <dt>Fresh</dt>
                <dd>
                  Always up-to-date thanks to the service worker update process.
                </dd>

                <dt>Safe</dt>
                <dd>
                  Served by means of TLS to avert snooping and guarantee content hasn't been tampered.
                </dd>

                <dt>Discoverable</dt>
                <dd>
                  Are identifiable as “applications” thanks to W3C manifests and service worker registration scope permitting web indexes to discover them.
                </dd>

                <dt>Installable</dt>
                <dd>
                  Enable users to "keep" applications they find most valuable on their home screen without the bothering about an application store.
                </dd>

                <dt>Linkable</dt>
                <dd>Effortlessly share by means of URL and not require complex installation.</dd>
              </dl>
            </div>
          </section>
          <hr/>

          <section>
            <header>
              <h3 className="mt-4">Why Progressive Apps?</h3>
            </header>
            <p>
              <span className="font-weight-bold">Case 1 :</span> Users nowadays doesn't want to install app every
              time when they have to get their work done, User doesn't have to wait to download app from a app store then use it.
              Instead web apps provide same experience on the mobile browser to complete user's task.
              <span className="font-weight-bold">&nbsp;- No more waiting</span>
            </p>

            <p>
              <span className="font-weight-bold">Case 2 :</span> In the world of millions apps and 30+ apps already on users phone with
              an average of 10+ app updates daily it really becomes hard for user to update apps every time
              there is new version launched, Whereas web apps makes it simpler for user.
              <span className="font-weight-bold">&nbsp;Ease of use</span>
            </p>

            <p>
              <span className="font-weight-bold">Case 3 :</span> Data bandwith, User who is on mobile with
              a mobile data and with limited bandwith(2g) or a user from remote area cannot really cannot download app
              and cannot actually use app with low speed, Whereas in browser with PWA it becomes easier for user and
              makes the experience delightful.
            </p>
          </section>
          <hr/>

          <section>
            <header>
              <h3 className="mt-4">How is PWA implemented?</h3>
            </header>
            <p>PWAs are based on a set of things on which Web Apps are already based on:</p>
            <ul>
              <li><span lang="en">Responsive Web Design</span> (<abbr lang="en" title="Responsive Web Design">RWD</abbr>), of course, to adapt interfaces to all screens;</li>
              <li><span lang="en">Web Services</span> and <span lang="en">Web Sockets</span> provided by servers and which allow access to information or actions implementation via web actions;</li>
              <li>Some <abbr lang="en" title="Application Programming Interface">API</abbr> provided by browsers, which allow to take full advantage of the context (for example, we would have access to different APIs depending on the capabilities of the consulting hardware: audio, video, acceleration, geolocation, transcription, vibration, etc.).</li>
            </ul>

            <p>However, they are distinguished by two recent technical components:</p>
            <ul>
              <li><span lang="en"><a href="https://developer.mozilla.org/fr/docs/Web/API/Service_Worker_API/Using_Service_Workers" target="_blank" rel="nofollow noopener">Service Workers</a></span>&nbsp;: This is a browser capability to provide an intermediate layer between the Web App and the network, which runs in the background (even when the application is closed). This “network” layer is capable of listening and sending requests, notifications or even capturing connectivity changes;</li>
              <li>The <span lang="en"><a href="https://developer.mozilla.org/fr/docs/Utilisation_des_web_workers" target="_blank" rel="nofollow noopener">Web Workers</a></span> are also background capabilities but they are rather dedicated to calculations and “services” oriented development.</li>
            </ul>
          </section>
          <hr/>

          <section>
            <header>
              <h3 className="mt-4">Who are using PWA?</h3>
            </header>
            <a href="https://mobile.twitter.com/" target="_blank" rel="nofollow noopener" className="list-inline px-2">
              <img src={TwitterLogo} width="100px"/>
            </a>
            <a href="https://www.washingtonpost.com/pwa" target="_blank" rel="nofollow noopener" className="list-inline px-2">
              <img src={WPLogo} width="100px"/>
            </a>
            <a href="https://flipboard.com/" target="_blank" rel="nofollow noopener" className="list-inline px-2">
              <img src={FlipboardLogo} width="100px"/>
            </a>
            <a href="https://paperplanes.world/" target="_blank" rel="nofollow noopener" className="list-inline px-2">
              <img src={PaperPlanesLogo} width="100px"/>
            </a>
          </section>

        </section>
      </article>
    );
  }
}