import _ from 'lodash';

/**
 * Check if current script is running in browser or not
 * @returns {boolean}
 */
export const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';

const loadPromises: any = {};

/**
 * Simple numeric hash of a string, used for non-secure usage only
 * @param str
 * @param namespace
 * @returns {string}
 */
export const generateStringHash = (str: string, namespace: string = '') => {
  const nmspace = namespace || '';
  let hash = 0; let i; let
    chr;
  if (str.length === 0) return `${nmspace}__${hash}`;
  const strr = `${nmspace}_${str}`;
  for (i = 0; i < strr.length; i += 1) {
    chr = strr.charCodeAt(i);
    // eslint-disable-next-line
    hash = ((hash << 5) - hash) + chr;
    // eslint-disable-next-line
    hash |= 0; // Convert to 32bit integer
  }
  return `${nmspace}__${hash}`;
};

/**
 * Load stylesheet
 * @param path
 * @returns {Promise}
 */
export const loadStyle = (path: string) => {
  const pathHash = generateStringHash(path, 'CSS');

  if (loadPromises[pathHash]) return loadPromises[pathHash];

  loadPromises[pathHash] = new Promise((resolve, reject) => {
    if (!isBrowser()) {
      return reject(
        new Error('Cannot call from server. Function can be executed only from browser'),
      );
    }

    // Do not load css if already loaded
    const previousLink = document.getElementById(pathHash.toString());
    if (previousLink) {
      resolve();
      return previousLink;
    }

    const head = document.getElementsByTagName('head')[0];
    // reference to document.head for appending/ removing link nodes

    const link = document.createElement('link'); // create the link node

    link.setAttribute('href', path);
    link.setAttribute('id', pathHash.toString());
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');

    let sheet: any;
    let cssRules: any;
    // get the correct properties to check for depending on the browser
    if ('sheet' in link) {
      sheet = 'sheet';
      cssRules = 'cssRules';
    } else {
      sheet = 'styleSheet';
      cssRules = 'rules';
    }

    // start checking whether the style sheet has successfully loaded
    const intervalId = setInterval(
      () => {
        try {
          // SUCCESS! our style sheet has loaded
          // @ts-ignore
          if (link[sheet] && link[sheet][cssRules].length) {
            // clear the counters
            clearInterval(intervalId);

            // Declared after "," so it will be available in Interval
            // eslint-disable-next-line
            clearTimeout(timeoutId);
            resolve();
          }
        } catch (e) {
          // Do nothing, timeout will handle it for fail after 15 seconds
        }
      },
      10,
    );

    // how often to check if the stylesheet is loaded
    // start counting down till fail

    const timeoutId = setTimeout(
      () => {
        // clear the counters
        clearInterval(intervalId);
        clearTimeout(timeoutId);

        // since the style sheet didn't load, remove the link node from the DOM
        head.removeChild(link);
        return reject(new Error('Timeout, unable to load css file'));
        // how long to wait before failing
      },
      15000,
    );

    // insert the link node into the DOM and start loading the style sheet

    head.appendChild(link);
    // return the link node;
    return link;
  });
  return loadPromises[pathHash];
};

/**
 * Load javascript file by path
 * @param path
 * @param attributes
 * @returns {Promise}
 */
export const loadScript = (path: string, attributes: any = {}) => {
  const pathHash = generateStringHash(path, 'JS').toString();
  if (loadPromises[pathHash]) return loadPromises[pathHash];

  loadPromises[pathHash] = new Promise((resolve, reject) => {
    if (!isBrowser()) {
      // If not a browser then do not allow loading of
      // css file, return with success->false
      return reject(
        new Error('Cannot call from server. Function can be executed only from browser'),
      );
    }

    // Do not load script if already loaded
    const previousLink = document.getElementById(pathHash);
    if (previousLink) {
      resolve();
      return previousLink;
    }

    let r: any;
    r = false;
    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.id = pathHash;
    s.src = path;
    s.defer = true;
    // eslint-disable-next-line
    // @ts-ignore
    // eslint-disable-next-line no-multi-assign
    s.onload = s.onreadystatechange = function () {
      // @ts-ignore
      if (!r && (!this.readyState || this.readyState === 'complete')) {
        r = true;
        resolve();
      }
    };
    // Add custom attribute added by user
    Object.keys(attributes).forEach((attr) => {
      // @ts-ignore
      s[attr] = attributes[attr];
    });
    const t = document.getElementsByTagName('script')[0];
    // @ts-ignore
    t.parentNode.insertBefore(s, t);
    return s;
  });
  return loadPromises[pathHash];
};

/**
 * Return assets as array
 * @param assets
 * @returns {Array}
 */
export const assetsToArray = (assets: any) => {
  let allAssets: any = [];
  if (assets instanceof Object) {
    _.each(assets, (a) => {
      if (typeof a === 'string') {
        allAssets.push(a);
      } else if (a instanceof Object) {
        allAssets = allAssets.concat(assetsToArray(a));
      }
    });
  } else if (typeof assets === 'string') {
    allAssets.push(assets);
  }
  allAssets = _.sortBy(allAssets, a => a.indexOf('hot-update') !== -1);
  return _.uniq(allAssets);
};
