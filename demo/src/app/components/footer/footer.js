import React, { Component } from 'react';
import BrowserStackLogo from './BrowserStackLogo.png';
import EventerpriseLogo from './EventerpriseLogo.png';
import * as styles from './style.scss';

export default class Header extends Component {
  render() {
    return (
      <div className="container-fluid bg-light mt-5">
        <div className="row p-3">
          <div className="d-block w-100 text-center">
            <span>Powered by:&nbsp;</span>
            <a
              href="https://www.atyantik.com"
              target="_blank"
              className="text-black"
              rel="nofollow noopener"
            >
              Atyantik Technologies Private Limited
            </a>
          </div>
          <hr className="w-100" />
          <div className="d-block w-100 text-center">
            <span className="w-100 m-r-2">Supporters: </span>
            <a
              href="https://www.browserstack.com"
              target="_blank"
              className="text-black d-inline-block v-middle  ml-2"
              rel="nofollow noopener"
            >
              <img className={styles['supporter-img']} src={BrowserStackLogo} alt="Browser Stack Logo" />
            </a>
            <a
              href="https://www.eventerprise.com"
              target="_blank"
              className="text-black d-inline-block v-middle ml-2"
              rel="nofollow noopener"
            >
              <img className={styles['eventerprise-log']} src={EventerpriseLogo} alt="Eventerprise Logo" />
              Eventerprise
            </a>
          </div>
        </div>
      </div>
    );
  }
}
