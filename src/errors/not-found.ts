class NotFoundError extends Error {
  code: number = 404;

  name: string = 'NotFound';

  constructor(...args: any) {
    super(...args);
    if (Error.captureStackTrace && typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, NotFoundError);
    }
  }
}

export default NotFoundError;
