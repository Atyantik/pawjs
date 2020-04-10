import '@babel/polyfill';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute, setDefaultHandler } from 'workbox-routing';
import {
  NetworkFirst,
  NetworkOnly,
  StaleWhileRevalidate,
  CacheFirst,
} from 'workbox-strategies';

// eslint-disable-next-line no-restricted-globals
const serviceWorker = self;

// eslint-disable-next-line no-underscore-dangle,no-restricted-globals
precacheAndRoute(self.__WB_MANIFEST);
// eslint-disable-next-line no-underscore-dangle,no-restricted-globals
precacheAndRoute(self.__PAW_MANIFEST);


// // eslint-disable-next-line
// const serviceWorker = self;
//
serviceWorker.addEventListener('install', () => {
  serviceWorker.skipWaiting();
});
serviceWorker.addEventListener('activate', () => {
  serviceWorker.clients.claim();
});

const getOfflineHtml = () => {
  const scripts = serviceWorker.paw__offline_assets.filter(a => a.endsWith('.js')).map(js => `<script type="text/javascript" src="${js}" async></script>`).join('');
  return `<!DOCTYPE html><html><head></head><body><div id="${serviceWorker.paw__injected_variables.clientRootElementId}"></div>${scripts}</body></html>`;
};

registerRoute(
  new RegExp(`^${serviceWorker.location.origin}/.*__hmm_update.*`),
  new NetworkOnly(),
);

const assetsRegExp = /\.(css|js|jpg|png|jpeg|gif|woff|woff2|ttf|eot|ico|mp4|avi)$/;

setDefaultHandler(({ event }) => {
  const { request } = event;
  const requestMethod = request.method.toUpperCase();

  if (requestMethod !== 'GET') {
    return fetch(event.request);
  }
  if (
    request.url.indexOf(serviceWorker.location.origin) !== -1
    && assetsRegExp.test(request.url)
  ) {
    return new CacheFirst().handle({ event, request });
  }

  if (
    request.url.indexOf(serviceWorker.location.origin) === -1
    && assetsRegExp.test(request.url)
  ) {
    return new StaleWhileRevalidate().handle({ event, request });
  }

  if (
    request.url.indexOf(serviceWorker.location.origin) !== -1
    && request.headers.get('accept').indexOf('html') !== -1
    && request.mode === 'navigate'
  ) {
    return new NetworkFirst().handle({ event, request }).then((response) => {
      if (!response) {
        return new Response(
          getOfflineHtml(),
          { headers: { 'Content-Type': 'text/html' } },
        );
      }
      return response;
    }).catch(() => new Response(
      getOfflineHtml(),
      { headers: { 'Content-Type': 'text/html' } },
    ));
  }

  return new NetworkFirst().handle({ event, request });
});

// eslint-disable-next-line no-underscore-dangle
const resolve = obj => (obj && obj.__esModule ? obj.default : obj);
// eslint-disable-next-line import/no-unresolved
const projectSW = resolve(require('pawProjectSW'));

if (typeof projectSW === 'function') {
  projectSW();
}
