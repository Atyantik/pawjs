import { Component } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { loadStyle } from 'pawjs/src/utils';
import { screenLoaded } from 'pawjs/src/components/screen/action';
import { loadScript } from 'pawjs/src/utils/utils';

const __development = process.env.NODE_ENV === 'development';

export default @connect(state => ({
  screen: state.screen,
}))
class CoreRoot extends Component {
  async loadPreloadCSS() {
    const linksPromise = [];
    if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
      _.forEach(window.document.querySelectorAll('link[rel=preload]'), (link) => {
        linksPromise.push(loadStyle(link.href));
      });
      if (linksPromise.length) {
        await Promise.all(linksPromise);
      }
    }
    return Promise.resolve();
  }

  loadGoogleAnalytics() {
    if (typeof window === 'undefined') return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js',
    });
    loadScript('https://www.googletagmanager.com/gtm.js?id=GTM-K68ZJZT').catch();
  }

  componentDidMount() {
    // Trigger screenLoaded once all the preload-css are loaded
    this.loadPreloadCSS().then(() => {
      this.props.dispatch(screenLoaded());
    });

    // Load google analytics
    !__development && this.loadGoogleAnalytics();
    // !__development && this.loadTwakChat();
    !__development && this.loadGitterChat();
    !__development && this.loadSumo();
  }

  loadGitterChat() {
    if (typeof window === 'undefined') return;
    ((window.gitter = {}).chat = {}).options = {
      room: 'react-pwa/Lobby',
    };
    return loadScript('https://sidecar.gitter.im/dist/sidecar.v1.js').catch();
  }

  // loadTwakChat() {
  //   // eslint-disable-next-line
  //   window.Tawk_API= window.Tawk_API||{};
  //   // eslint-disable-next-line
  //   window.Tawk_LoadStart =new Date();
  //
  //   // eslint-disable-next-line
  //   const s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
  //   s1.async=true;
  //   s1.src="https://embed.tawk.to/5a6182a0d7591465c706e568/default";
  //   s1.charset="UTF-8";
  //   s1.setAttribute("crossorigin","*");
  //   s0.parentNode.insertBefore(s1,s0);
  // }

  loadSumo() {
    // eslint-disable-next-line
    const s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = '//load.sumome.com/';
    s1.setAttribute('data-sumo-site-id', '110138f66c3c23754ff97de8b4bdf49eaa28ea67852c7a62647e171852e741a2');
    s0.parentNode.insertBefore(s1, s0);
  }

  render() {
    return this.props.children || null;
  }
}
