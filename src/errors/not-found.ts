class NotFoundError extends Error {
  code: number = 404;

  name: string = 'NotFound';

  constructor(...args: any) {
    super(...args);
    Error.captureStackTrace(this, NotFoundError);
  }
}

export default NotFoundError;
