import ServerHandler from '@pawjs/pawjs/src/server/handler';
import ReactPWA192Icon from './resources/images/pwa-icon-192x192.png';
import ReactPWA512Icon from './resources/images/pwa-icon-512x512.png';


export default class Server {
  serverHandler: ServerHandler | null = null;

  /**
   * Add head links like theme color, apple icon links,
   * Favicon, tile color etc.
   */
  addHeadLinks() {
    if (!this.serverHandler) return false;
    this
      .serverHandler
      .hooks
      .beforeHtmlRender
      .tapPromise(
        'HeadLinks',
        async (application: any) => {
          const { htmlProps: { head } } = application;

          // Apple touch icons
          head.push(
            (
              <link
                key="apple-touch-icon-192"
                rel="apple-touch-icon"
                sizes="192x191"
                href={ReactPWA192Icon}
              />
            ),
          );
          head.push(
            (
              <link
                key="apple-touch-icon-512"
                rel="apple-touch-icon"
                sizes="512x512"
                href={ReactPWA512Icon}
              />
            ),
          );
          head.push(
            (
              <link
                key="apple-touch-icon"
                rel="apple-touch-icon-precomposed"
                href={ReactPWA192Icon}
              />
            ),
          );
        },
      );
    return true;
  }

  apply(serverHandler: ServerHandler) {
    this.serverHandler = serverHandler;
    this.serverHandler.setCache({ max: 52428800, maxAge: 1000 * 20, reCache: true });
    this.addHeadLinks();
  }
}
