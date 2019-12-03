import get from 'lodash/get';
import set from 'lodash/set';
import isEmpty from 'lodash/isEmpty';
import each from 'lodash/each';
import find from 'lodash/find';
import defaultsDeep from 'lodash/defaultsDeep';
import cloneDeep from 'lodash/cloneDeep';
import first from 'lodash/first';
import isEqual from 'lodash/isEqual';
import uniqWith from 'lodash/uniqWith';
import { isBrowser } from './utils';

const defaultMeta = (pwaSchema: any) => [
  {
    charSet: 'utf-8',
  },
  {
    name: 'robots',
    content: 'all',
  },
  {
    name: 'author',
    content: 'Atyantik Technologies Private Limited',
  },
  {
    httpEquiv: 'x-ua-compatible',
    content: 'ie=edge',
  },
  {
    name: 'viewport',
    content: 'width=device-width, initial-scale=1, shrink-to-fit=no',
  },
  {
    name: 'application-name',
    content: get(pwaSchema, 'name', ''),
  },
  {
    name: 'generator',
    content: 'PawJS',
  },
  {
    name: 'rating',
    content: 'General',
  },
  {
    name: 'mobile-web-app-capable',
    content: 'yes',
  },
  {
    name: 'theme-color',
    content: get(pwaSchema, 'theme_color', '#fff'),
  },
  {
    name: 'apple-mobile-web-app-capable',
    content: 'yes',
  },
  {
    name: 'apple-mobile-web-app-status-bar-style',
    content: get(pwaSchema, 'theme_color', '#fff'),
  },
  {
    name: 'apple-mobile-web-app-title',
    content: get(pwaSchema, 'name', ''),
  },
  {
    name: 'msapplication-tooltip',
    content: get(pwaSchema, 'description', ''),
  },
  {
    name: 'msapplication-starturl',
    content: get(pwaSchema, 'start_url', ''),
  },
  {
    name: 'msapplication-TileColor',
    content: get(pwaSchema, 'background_color', '#fff'),
  },
  {
    name: 'renderer',
    content: 'webkit|ie-comp|ie-stand',
  },
  {
    name: 'full-screen',
    content: 'yes',
  },

];

/**
 * Standard meta keys to differentiate
 * @type {[*]}
 */
export const metaKeys = [
  'name',
  'itemProp',
  'property',
  'charSet',
];

/**
 * Get full url appended with base url if no protocol present in the provided link
 * @param url
 * @param baseUrl
 * @returns {*}
 */
const getFullUrl = (url: string, baseUrl = '') => {
  let fullImageUrl = url;
  if (!fullImageUrl.startsWith('http')) {
    fullImageUrl = `${baseUrl}${!fullImageUrl.startsWith('/') ? '/' : ''}${fullImageUrl}`;
  }
  return fullImageUrl;
};

/**
 * Return the meta key detected from the meta provided.
 * if no meta key from our standard metaKeys is found then return false
 * @param meta
 * @returns {boolean|string}
 */
const getMetaKey = (meta: any): string => {
  let selectedMetaKey: string = '';
  each(metaKeys, (key) => {
    if (!selectedMetaKey && get(meta, key, false)) {
      selectedMetaKey = key;
    }
  });
  return selectedMetaKey;
};

/**
 * Update the source directly,
 * thus pass as array
 * @param source {Array}
 * @param customMetas {Array}
 */
const addUpdateMeta = (source: any [] = [], customMetas: any [] = []) => {
  each(customMetas, (meta) => {
    const metaKey = getMetaKey(meta);
    let metaUpdated = false;
    if (metaKey) {
      // Suppose we got a meta key in our generatedSchema
      // then we need to update the generated schema
      const generatedSchemaObj: any = find(source, { [metaKey]: meta[metaKey] });

      if (generatedSchemaObj) {
        each(meta, (value, key) => {
          set(generatedSchemaObj, key, value);
        });
        metaUpdated = true;
      }
    }
    // This means user is trying to add some meta that does
    // not match our standard criteria or is not present in our source, maybe for site verification
    // or google webmaster meta key etc
    if (!metaUpdated) {
      // Add data to source
      source.push(meta);
    }
  });
};

/**
 * Get text from html string
 * @param str
 * @returns {string}
 */
export const getTextFromHtml = (str = '') => str.replace(/<(?:.|\n)*?>/gm, '').trim();

/**
 * Return array of meta tags required for the route
 * Pass seo data to the function and get array of meta data
 * @param data
 * @param options
 * @returns {Array}
 */
export const generateMeta = (data = {}, options = {
  baseUrl: '', url: '', pwaSchema: {}, seoSchema: {},
}) => {
  // deep defaults the seoSchema we have in config file and the data provided to us.
  const seoData = defaultsDeep(data, options.seoSchema);

  // Let store the generated Schema in following variable
  let generatedSchema: any [] = [];

  const descriptionText = getTextFromHtml(seoData.description);
  // Get 155 words out of description
  // const desc155words = trimTillLastSentence(seoData.description, 155);
  const desc155chars = descriptionText.slice(0, 155);

  // Get 200 words out of description
  const desc200chars = descriptionText.slice(0, 200);

  // const desc200words = trimTillLastSentence(seoData.description, 200);

  // Base url after removing the end slash
  const baseUrl = options.baseUrl.replace(/\/$/, '');

  // Add meta required for at top of head
  addUpdateMeta(generatedSchema, cloneDeep(defaultMeta(options.pwaSchema)));

  /**
   * Manage name/title
   */
  // Meta name
  generatedSchema.push({
    name: 'title',
    content: seoData.title,
  });
  // Twitter title
  generatedSchema.push({
    name: 'twitter:title',
    content: seoData.title,
  });
  generatedSchema.push({
    property: 'og:title',
    content: seoData.title,
  });

  /**
   * Manage keywords (allow string and array as well)
   */
  if (process.env.ENABLE_KEYWORDS
    && (
      process.env.ENABLE_KEYWORDS === 'true'
      || process.env.ENABLE_KEYWORDS === '1'
      || process.env.ENABLE_KEYWORDS === 'yes'
    )
  ) {
    if (typeof seoData.keywords === 'string' && seoData.keywords.trim().length) {
      generatedSchema.push({
        name: 'keywords',
        content: seoData.keywords,
      });
    }
    if (Array.isArray(seoData.keywords) && seoData.keywords.length) {
      generatedSchema.push({
        name: 'keywords',
        content: seoData.keywords.join(','),
      });
    }
  }

  /**
   * Manage twitter site & author
   */
  const twitterSite = get(seoData, 'twitter.site', '');
  if (twitterSite.length) {
    generatedSchema.push({
      name: 'twitter:site',
      content: twitterSite,
    });
  }

  const twitterCreator = get(seoData, 'twitter.creator', '');
  if (twitterCreator.length) {
    generatedSchema.push({
      name: 'twitter:creator',
      content: twitterCreator,
    });
  }

  /**
   * Manage facebook admins
   */
  const fbAdmins = get(seoData, 'facebook.admins', []);
  if (fbAdmins && fbAdmins.length) {
    generatedSchema.push({
      property: 'fb:admins',
      content: fbAdmins.join(','),
    });
  }

  /**
   * Manage description
   */
  // Meta description
  generatedSchema.push({
    name: 'description',
    content: desc155chars,
  });
  generatedSchema.push({
    name: 'twitter:description',
    content: desc200chars,
  });
  generatedSchema.push({
    property: 'og:description',
    content: descriptionText,
  });

  /**
   * Site name
   */
  if (seoData.site_name && seoData.site_name.length) {
    generatedSchema.push({
      property: 'og:site_name',
      content: seoData.site_name,
    });
  }

  /**
   * Manage Primary Image
   */
  const hasImage = (seoData.image && !!seoData.image.length);

  if (hasImage) {
    let images = hasImage ? seoData.image : [];
    if (!Array.isArray(images)) {
      images = [images];
    }

    const image: string = first(images) || '';
    const fullImageUrl = getFullUrl(image, baseUrl);
    generatedSchema.push({
      itemProp: 'image',
      content: fullImageUrl,
    });
    generatedSchema.push({
      name: 'twitter:image:src',
      content: fullImageUrl,
    });
    if (image.length > 1) {
      each(images, (img) => {
        generatedSchema.push({
          property: 'og:image',
          content: getFullUrl(img, baseUrl),
        });
      });
    } else {
      generatedSchema.push({
        property: 'og:image',
        content: fullImageUrl,
      });
    }

    // Add type of twitter card
    generatedSchema.push({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
  } else {
    generatedSchema.push({
      name: 'twitter:card',
      content: 'summary',
    });
  }

  /**
   * Manage Type article/product/music/movie etc
   */
  generatedSchema.push({
    property: 'og:type',
    content: seoData.type,
  });

  let twitterDataCounter = 1;
  each(seoData.type_details, (value, key) => {
    if (typeof value === 'object' && value !== null) {
      each(value, (subValue, subKey) => {
        if (!isEmpty(subValue)) {
          generatedSchema.push({
            property: `${seoData.type}:${key}:${subKey}`,
            content: subValue,
          });
          generatedSchema.push({
            name: `twitter:data${twitterDataCounter}`,
            content: subValue,
          });
          generatedSchema.push({
            name: `twitter:label${twitterDataCounter}`,
            content: subKey,
          });
          twitterDataCounter += 1;
        }
      });
    } else if (!isEmpty(value)) {
      generatedSchema.push({
        property: `${seoData.type}:${key}`,
        content: value,
      });
      generatedSchema.push({
        name: `twitter:data${twitterDataCounter}`,
        content: value,
      });
      generatedSchema.push({
        name: `twitter:label${twitterDataCounter}`,
        content: key,
      });
      twitterDataCounter += 1;
    }
  });

  let url = get(seoData, 'url', get(options, 'url', ''));
  if (!url.length && isBrowser()) {
    url = get(window, 'location.href', '');
  }
  if (url.trim().length) {
    generatedSchema.push({
      property: 'og:url',
      content: url,
    });
  }

  const userMeta = get(seoData, 'meta', []);
  addUpdateMeta(generatedSchema, userMeta);

  generatedSchema = uniqWith(generatedSchema, isEqual);

  return generatedSchema;
};

/**
 * Process string to get appropriate trimmed data
 * Thus string "Tirth Bodawala" should return "Tirth Bodawala" with length 14
 * & should return "Tirth" with length 13, first it tries to search for "." and then
 * for " "(space)
 * @param str
 * @param length
 * @returns String
 */
export const trimTillLastSentence = (str: string, length = 0) => {
  // Get pure text from string provided, necessary
  // to remove html tags
  let strr: string = getTextFromHtml(str);

  // If no min length specified or no string
  // length then return string
  if (!length || !strr.length) {
    return strr;
  }

  // Add leading space to preserve string length
  strr += ' ';

  // trim the string to the maximum length
  let trimmedString = strr.substr(0, length + 1);

  // Re-trim if we are in the middle of a word
  let separator = '.';

  // Check if there is a sentence and a "." exists
  if (trimmedString.lastIndexOf(separator) === -1) {
    separator = ' ';
    if (trimmedString.lastIndexOf(separator) === -1) {
      // if no space exists at all then return the string
      // with max length value
      trimmedString = str.substr(0, length);
      return trimmedString;
    }
  }
  return trimmedString.substr(
    0,
    Math.min(trimmedString.length - 1, trimmedString.lastIndexOf(separator)),
  ).trim();
};
