import http from 'http';
import fetch from 'cross-fetch';
import express from 'express';
// @ts-ignore
import stoppable from 'stoppable';


const startLocalServer = (app: Express.Application): Promise<[string, http.Server & { stop: () => void }]> => new Promise((resolve) => {
  let localServerBase = 'http://localhost';
  let localServer: http.Server;
  localServer = stoppable(http.createServer(app));

  localServer = localServer.listen(0, function listening() {
    if (localServer === null) return;
    const address = localServer.address();
    if (address && typeof address !== 'string') {
      localServerBase += `:${address.port}`;
    }
    // @ts-ignore
    resolve([localServerBase, localServer]);
  });
});

export const request = (app: express.Express) => {
  return {
    get: async (url: string, headers?: http.IncomingHttpHeaders) => {
      app.locals.noRecache = true;
      const [localServerBase, localServer] = await startLocalServer(app);
      const fetchHeaders: Record<string, string> = {};
      if (headers) {
        Object.keys(headers).forEach(key => {
          const headerVal = headers[key];
          if (typeof headerVal === 'string') {
            fetchHeaders[key] = headerVal;
          }
        });
      }

      const urlObj = new URL(url, localServerBase);
      return fetch(urlObj.toString(), {
        headers: fetchHeaders,
      }).then(res => {
        localServer.stop();
        return res;
      });
    },
  };
};


