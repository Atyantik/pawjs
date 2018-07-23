self.workbox.skipWaiting();
self.workbox.clientsClaim();

self.workbox.setConfig({
  debug: self.__env["PAW_ENV"] !== "production"
});

const getOfflineHtml = () => {
  let scripts = self.__offline_assets.filter(a => a.endsWith(".js")).map(js => {
    return `<script type="text/javascript" src="${js}" async></script>`;
  }).join("");
  return `<!DOCTYPE html><html><head></head><body><div id="${self.__injected_variables["clientRootElementId"]}"></div>${scripts}</body></html>`;
};

self.workbox.routing.registerRoute(
  new RegExp(`^${self.location.origin}/.*__hmm_update.*`),
  self.workbox.strategies.networkOnly()
);

const assetsRegExp = /\.(css|js|jpg|png|jpeg|gif|woff|woff2|ttf|eot|ico|mp4|avi)$/;

const networkFirstHandler = self.workbox.strategies.networkFirst();
const cacheFirstHandler = self.workbox.strategies.cacheFirst();
const staleHandler = self.workbox.strategies.staleWhileRevalidate();

self.workbox.routing.setDefaultHandler(({event}) => {

  const request = event.request;
  const requestMethod = request.method.toUpperCase();

  if (requestMethod !== "GET") {
    return fetch(event.request);
  }

  if (
    request.url.indexOf(self.location.origin) !== -1 &&
    assetsRegExp.test(request.url)
  ) {
    return cacheFirstHandler.handle({event});
  }

  if (
    request.url.indexOf(self.location.origin) === -1 &&
    assetsRegExp.test(request.url)
  ) {
    return staleHandler.handle({event});
  }

  if (
    request.url.indexOf(self.location.origin) !== -1 &&
    request.headers.get("accept").indexOf("html") !== -1
  ) {
    return networkFirstHandler.handle({event}).then(response => {
      if (!response) {
        return new Response(
          getOfflineHtml(),
          { headers: { "Content-Type": "text/html" }}
        );
      }
      return response;
    });
  }

  return networkFirstHandler.handle({event});
});

self.workbox.precaching.precacheAndRoute(self.__precacheManifest);