import { To } from 'react-router';

class RedirectError extends Error {
  statusCode: number = 302;

  to: To = '';

  name: string = 'RedirectError';

  constructor(...args: any) {
    super(...args);
    if (Error.captureStackTrace && typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, RedirectError);
    }
  }

  setStatusCode(code: number) {
    this.statusCode = code;
  }

  getStatusCode() {
    return this.statusCode;
  }

  setRedirect(to: To) {
    this.to = to;
  }

  getRedirect() {
    return this.to;
  }

  set code(code: number) {
    this.statusCode = code;
  }

  get code(): number {
    return this.statusCode;
  }
}

export default RedirectError;
