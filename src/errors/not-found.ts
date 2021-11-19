class NotFoundError extends Error {
  statusCode: number = 404;

  name: string = 'NotFound';

  constructor(...args: any) {
    super(...args);
    if (Error.captureStackTrace && typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, NotFoundError);
    }
  }

  setStatusCode(code: number) {
    this.statusCode = code;
  }

  getStatusCode() {
    return this.statusCode;
  }

  set code(code: number) {
    this.statusCode = code;
  }

  get code(): number {
    return this.statusCode;
  }
}

export default NotFoundError;
