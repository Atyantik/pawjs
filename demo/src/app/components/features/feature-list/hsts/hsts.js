/**
 * Created by Yash Thakur
 * Date: 30/10/17
 * Time: 5:06 PM
 */

import React, { Component } from 'react';
import { Redirect } from 'react-router';
import Prism from '../../../prism/prism';
import HSTSImage from './images/hsts.gif';

export default class HSTS extends Component {
  render() {
    if (true) {
      return <Redirect to="/" />;
    }
    return (
      <article>
        <header>
          <h1 className="mt-4">HTTP Strict Transport Security - HSTS</h1>
          <hr />
        </header>
        <section>
          <section>
            <p>
              <img className="mw-100" src={HSTSImage} />
            </p>
            <header>
              <h3 className="mt-4">What is HSTS?</h3>
            </header>

            <p>
              Servers are usually not connected directly to each other, they must pass their
              requests and responses through a series of network routers. These routers, located
              in-between servers, have complete access to requests sent via HTTP connections.
              Since the data is transferred as unencrypted plain text, the routers can act
              as a “man in the middle” and read or manipulate data in transit.
            </p>
            <p>
              This can cause users to receive manipulated information or be directed to hostile
              servers used by attackers to steal information like passwords and credit card info.
              This kind of interception can go undetected since a compromised HTTP response looks
              the same as a genuine response.
            </p>
            <p>
              The HSTS policy forces all responses to pass through HTTPS connections instead of
              plain text HTTP. This ensures that the entire channel is encrypted before any data
              is sent, making it impossible for attackers to read or modify the data in transit.
            </p>
          </section>
          <hr />

          <section>
            <header>
              <h3 className="mt-4">How HSTS works?</h3>
            </header>
            <p>
              Enabling HSTS on a server involves adding the following HSTS response header in an HTTPS reply:
            </p>

            <Prism
              code="Strict-Transport-Security: max-age=expireTime [; includeSubdomains]"
              language="bash"
            />
            <br />
              For example:
            <Prism
              code="Strict-Transport-Security: max-age=16070400; includeSubDomains"
              language="bash"
            />
            <p>
              The minimum parameter is the 'max-age' in seconds. This specifies the time
              the browser should connect to the server using the HTTPS connection. However,
              it’s recommended to include the subdirectories so that the browser uses the HTTPS
              connection for existing and future subdomains.
            </p>
            <p className="font-weight-bold">
              When the browser accesses the website, the server replies with the HSTS header.
            </p>
            <p>
              This instructs the browser to only connect to the server and the entire domain
              through HTTPS. The browser will then remember to use the HTTPS connection for the
              specified 'max-age'.
            </p>
            <p>
              Even if a user types http://www.domain.com, types the domain name without http,
              uses a bookmark, or a third party HTTP link, the browser will automatically upgrade
              the request to HTTPS. Once the 'max-age' expires, the browser starts accessing
              the server through HTTP unless the user specifies HTTPS.
            </p>
            <p className="font-weight-bold">
              After receiving the HSTS header, the browser sends an HTTPS request.
            </p>
          </section>
          <hr />

          <section>
            <header>
              <h3 className="mt-4">What are the benefits of using HSTS?</h3>
            </header>

            <ul>
              <li>
                <p>
                  Protection against HTTP downgrade attacks (SSL stripping attacks) by
                  requiring all traffic to utilize HTTPS. It rewrites requests that do not
                  point to encrypted sources.
                </p>
              </li>
              <li>
                <p>
                  Mixed content defense. HSTS automatically upgrades fetches to HTTPS
                  in situations where a domain has mixed content.
                </p>
              </li>
              <li>
                <p>
                  Better security in general: An HSTS-compliant browser aborts the
                  connection to an HSTS-compliant server whenever the security of a
                  certificate can’t be confirmed. Plus, users can’t click through
                  self-signed certificates.
                </p>
              </li>
            </ul>
          </section>

        </section>
      </article>
    );
  }
}
