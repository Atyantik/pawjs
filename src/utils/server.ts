import express from 'express';

export const getBaseRequestUrl = (req: express.Request) => {
  try {
    const host = req.get('X-Host') || req.get('X-Forwarded-Host') || req.get('host');
    const protocol = req.protocol
      || req.get('X-Forwarded-Protocol')
      || req.get('X-Forwarded-Proto')
      || (req.secure ? 'https' : 'http');
    return `${protocol}://${host}`;
  } catch (ex) {
    return `${req.protocol}://${req.get('host')}`;
    // Some error with parsing of url
  }
};

export const getFullRequestUrl = (req: express.Request) => {
  try {
    const baseUrl = getBaseRequestUrl(req);
    const parsedUrl = new URL(req.originalUrl, baseUrl);

    let pathName = '/';
    if (parsedUrl.pathname) {
      pathName = parsedUrl.pathname;
    }
    return `${baseUrl}${pathName}${parsedUrl.search || ''}`;
  } catch (ex) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return `${baseUrl}${req.originalUrl}`;
    // Some error with parsing of url
  }
};
